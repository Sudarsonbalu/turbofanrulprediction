import fs from 'fs';
import path from 'path';
import { ParsedRow } from './parser_service';
import { runTrainingPipeline } from '../ml/train';
import { extractTestLastCycles, generateTrainingRUL } from '../ml/rul_generator';
import { engineerFeatures, transformScaler } from '../ml/feature_engineering';
import { predictLinearRegression, LinearRegressionModel } from '../ml/models/linear_regression';
import { predictRandomForest, RandomForestModel } from '../ml/models/random_forest';
import { calculateMetrics } from '../ml/evaluate';
import { getDatasetFolder, getDatasetMetadata } from './dataset_service';
import {
  PredictionResultsResponse,
  EnginePredictionResult,
  RiskLevel,
  RiskThresholds,
  TrainModelParams,
  ModelComparisonResult
} from '../../../src/types';

const PROCESSED_DIR = path.join(process.cwd(), 'processed');
const MODELS_DIR = path.join(process.cwd(), 'models');

function ensureProcessedDir(datasetId: string) {
  const dir = path.join(PROCESSED_DIR, datasetId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function runPredictionService(
  datasetId: string,
  params?: Partial<TrainModelParams>
): PredictionResultsResponse {
  const meta = getDatasetMetadata(datasetId);
  const uploadFolder = getDatasetFolder(datasetId);

  if (!meta || !uploadFolder) {
    throw new Error(`No validated dataset available for ID '${datasetId}'. Upload and validate a dataset first.`);
  }

  const dataPath = path.join(uploadFolder, 'parsed_data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Dataset parsed data missing for ID '${datasetId}'.`);
  }

  const rawRows: ParsedRow[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  if (rawRows.length === 0) {
    throw new Error('Dataset contains no valid rows.');
  }

  const realDatasetId = meta.dataset_id;

  // 1. Train or load existing trained models
  const modelDir = path.join(MODELS_DIR, realDatasetId);
  let trainingOutput;

  if (!fs.existsSync(path.join(modelDir, 'metadata.json'))) {
    trainingOutput = runTrainingPipeline(realDatasetId, rawRows, params);
  } else {
    // Read trained metadata & model files
    const metaJson = JSON.parse(fs.readFileSync(path.join(modelDir, 'metadata.json'), 'utf-8'));
    const scalerJson = JSON.parse(fs.readFileSync(path.join(modelDir, 'scaler.json'), 'utf-8'));
    const isRfBest = metaJson.best_model_name === 'Random Forest';
    const bestModelFile = isRfBest ? 'random_forest.json' : 'linear_regression.json';
    const bestModelObj = JSON.parse(fs.readFileSync(path.join(modelDir, bestModelFile), 'utf-8'));

    trainingOutput = {
      datasetId: realDatasetId,
      bestModelName: metaJson.best_model_name,
      selectionReason: metaJson.selection_reason,
      modelComparisons: metaJson.comparisons as ModelComparisonResult[],
      scalerParams: scalerJson,
      bestModelObj,
      featureImportances: metaJson.feature_importances
    };
  }

  // 2. Extract final cycle per engine to predict current remaining useful life
  const lastCycleMap = extractTestLastCycles(rawRows);
  const testEngineRows: ParsedRow[] = [];
  const testEngineIds: number[] = [];
  const testLastCycles: number[] = [];

  for (const [engId, info] of lastCycleMap.entries()) {
    testEngineIds.push(engId);
    testLastCycles.push(info.last_cycle);
    testEngineRows.push(info.last_row);
  }

  // 3. Generate training RUL for full row dataset to compute features
  const fullRowsWithRUL = generateTrainingRUL(rawRows);

  // 4. Engineer features for the dataset
  const fullFeatures = engineerFeatures(fullRowsWithRUL, 'rul', 5);
  const X_scaled = transformScaler(fullFeatures.X, trainingOutput.scalerParams);

  // Filter feature matrix down to last cycle per engine
  const lastCycleXScaled: number[][] = [];
  const lastCycleActualRuls: number[] = [];

  for (let i = 0; i < fullFeatures.engineIds.length; i++) {
    const engId = fullFeatures.engineIds[i];
    const cycle = fullFeatures.cycles[i];
    const lastCycle = lastCycleMap.get(engId)?.last_cycle;

    if (cycle === lastCycle) {
      lastCycleXScaled.push(X_scaled[i]);
      lastCycleActualRuls.push(fullFeatures.y[i]);
    }
  }

  // 5. Predict using selected best model
  let predictionsRaw: number[] = [];
  if (trainingOutput.bestModelName === 'Random Forest') {
    predictionsRaw = predictRandomForest(trainingOutput.bestModelObj as RandomForestModel, lastCycleXScaled);
  } else {
    predictionsRaw = predictLinearRegression(trainingOutput.bestModelObj as LinearRegressionModel, lastCycleXScaled);
  }

  // 6. Ground Truth Evaluation
  const metrics = calculateMetrics(lastCycleActualRuls, predictionsRaw, 0);

  // 7. Health Risk Thresholds (Configurable)
  const criticalThreshold = params?.critical_threshold !== undefined ? params.critical_threshold : 30;
  const warningThreshold = params?.warning_threshold !== undefined ? params.warning_threshold : 70;
  const thresholds: RiskThresholds = {
    critical_threshold: criticalThreshold,
    warning_threshold: warningThreshold
  };

  let criticalCount = 0;
  let warningCount = 0;
  let healthyCount = 0;
  let predRulSum = 0;
  let minPredRul = Infinity;

  const enginePredictions: EnginePredictionResult[] = [];

  for (let i = 0; i < testEngineIds.length; i++) {
    const engId = testEngineIds[i];
    const cycle = testLastCycles[i];
    const predRul = Math.max(0, Math.round(predictionsRaw[i] || 0));
    const actualRul = lastCycleActualRuls[i];
    const absErr = actualRul !== undefined ? Math.abs(predRul - actualRul) : undefined;

    predRulSum += predRul;
    if (predRul < minPredRul) minPredRul = predRul;

    let risk: RiskLevel = 'HEALTHY';
    if (predRul <= criticalThreshold) {
      risk = 'CRITICAL';
      criticalCount++;
    } else if (predRul <= warningThreshold) {
      risk = 'WARNING';
      warningCount++;
    } else {
      healthyCount++;
    }

    enginePredictions.push({
      engine_id: engId,
      current_cycle: cycle,
      predicted_rul: predRul,
      actual_rul: actualRul,
      absolute_error: absErr,
      risk_level: risk
    });
  }

  // Sort predictions by lowest predicted RUL first
  enginePredictions.sort((a, b) => a.predicted_rul - b.predicted_rul);

  const avgPredRul = testEngineIds.length > 0 ? Math.round(predRulSum / testEngineIds.length) : 0;

  const response: PredictionResultsResponse = {
    dataset_id: realDatasetId,
    model_used: trainingOutput.bestModelName,
    selection_reason: trainingOutput.selectionReason,
    metrics: metrics,
    thresholds,
    summary: {
      total_engines: testEngineIds.length,
      avg_predicted_rul: avgPredRul,
      min_predicted_rul: minPredRul === Infinity ? 0 : minPredRul,
      critical_count: criticalCount,
      warning_count: warningCount,
      healthy_count: healthyCount
    },
    predictions: enginePredictions,
    feature_importance: trainingOutput.featureImportances
  };

  // Save prediction results under processed/<realDatasetId>/predictions.json
  const processedDir = ensureProcessedDir(realDatasetId);
  fs.writeFileSync(path.join(processedDir, 'predictions.json'), JSON.stringify(response, null, 2));

  return response;
}

export function getPredictionResults(datasetId: string): PredictionResultsResponse | null {
  const meta = getDatasetMetadata(datasetId);
  if (!meta) return null;

  const predPath = path.join(PROCESSED_DIR, meta.dataset_id, 'predictions.json');

  if (fs.existsSync(predPath)) {
    try {
      return JSON.parse(fs.readFileSync(predPath, 'utf-8'));
    } catch {
      // Fallback
    }
  }

  try {
    return runPredictionService(meta.dataset_id);
  } catch {
    return null;
  }
}

export function getModelComparison(datasetId: string): ModelComparisonResult[] | null {
  const meta = getDatasetMetadata(datasetId);
  if (!meta) return null;

  const metaPath = path.join(MODELS_DIR, meta.dataset_id, 'metadata.json');
  if (!fs.existsSync(metaPath)) return null;

  try {
    const metaJson = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    return metaJson.comparisons as ModelComparisonResult[];
  } catch {
    return null;
  }
}
