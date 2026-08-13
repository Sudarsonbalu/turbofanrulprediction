import fs from 'fs';
import path from 'path';
import { ParsedRow } from '../services/parser_service';
import { generateTrainingRUL } from './rul_generator';
import { engineerFeatures, fitScaler, transformScaler } from './feature_engineering';
import { trainLinearRegression, predictLinearRegression, LinearRegressionModel } from './models/linear_regression';
import { trainRandomForest, predictRandomForest, RandomForestModel } from './models/random_forest';
import { calculateMetrics } from './evaluate';
import { ModelComparisonResult, ModelMetrics, TrainModelParams, FeatureImportanceItem } from '../../../src/types';

const MODELS_DIR = process.env.VERCEL || fs.existsSync('/tmp')
  ? path.join('/tmp', 'models')
  : path.join(process.cwd(), 'models');

export interface TrainingPipelineOutput {
  datasetId: string;
  bestModelName: string;
  selectionReason: string;
  modelComparisons: ModelComparisonResult[];
  scalerParams: any;
  bestModelObj: LinearRegressionModel | RandomForestModel;
  featureImportances: FeatureImportanceItem[];
}

export function runTrainingPipeline(
  datasetId: string,
  rows: ParsedRow[],
  params?: Partial<TrainModelParams>
): TrainingPipelineOutput {
  if (!rows || rows.length === 0) {
    throw new Error('Cannot train ML pipeline on empty dataset.');
  }

  // 1. Generate Training RUL dynamically
  const rowsWithRUL = generateTrainingRUL(rows);

  // 2. Engine-Aware Train / Validation Split (80% Train Engines, 20% Validation Engines)
  const uniqueEngines = Array.from(new Set(rowsWithRUL.map(r => r.engine_id))).sort((a, b) => a - b);
  
  if (uniqueEngines.length === 0) {
    throw new Error('No valid engine IDs found in dataset.');
  }

  // Engine split
  const trainEngineCount = Math.max(1, Math.floor(uniqueEngines.length * 0.8));
  const trainEngines = new Set(uniqueEngines.slice(0, trainEngineCount));
  const valEngines = new Set(uniqueEngines.slice(trainEngineCount));

  const trainRows = rowsWithRUL.filter(r => trainEngines.has(r.engine_id));
  const valRows = valEngines.size > 0 ? rowsWithRUL.filter(r => valEngines.has(r.engine_id)) : trainRows;

  // 3. Feature Engineering
  const trainFeatures = engineerFeatures(trainRows, 'rul', 5);
  const valFeatures = engineerFeatures(valRows, 'rul', 5);

  if (trainFeatures.X.length === 0 || trainFeatures.featureNames.length === 0) {
    throw new Error('Feature engineering yielded 0 valid features or samples.');
  }

  // Fit scaler strictly on training set
  const scaler = fitScaler(trainFeatures.X, trainFeatures.featureNames);
  const X_train_scaled = transformScaler(trainFeatures.X, scaler);
  const X_val_scaled = transformScaler(valFeatures.X, scaler);

  // 4. Train Model 1: Linear Regression
  const lrLambda = params?.lr_lambda !== undefined ? params.lr_lambda : 0.1;
  const lrResult = trainLinearRegression(X_train_scaled, trainFeatures.y, trainFeatures.featureNames, lrLambda);
  const lrValPreds = predictLinearRegression(lrResult.model, X_val_scaled);
  const lrMetrics = calculateMetrics(valFeatures.y, lrValPreds, lrResult.trainingTimeMs);

  // 5. Train Model 2: Random Forest
  const rfNEstimators = params?.rf_n_estimators !== undefined ? params.rf_n_estimators : 15;
  const rfMaxDepth = params?.rf_max_depth !== undefined ? params.rf_max_depth : 8;
  const rfMinSplit = params?.rf_min_samples_split !== undefined ? params.rf_min_samples_split : 5;

  const rfResult = trainRandomForest(
    X_train_scaled,
    trainFeatures.y,
    trainFeatures.featureNames,
    rfNEstimators,
    rfMaxDepth,
    rfMinSplit
  );
  const rfValPreds = predictRandomForest(rfResult.model, X_val_scaled);
  const rfMetrics = calculateMetrics(valFeatures.y, rfValPreds, rfResult.trainingTimeMs);

  // 6. Best Model Selection (Based on lower Validation MAE)
  let bestModelName = 'Linear Regression';
  let bestModelObj: LinearRegressionModel | RandomForestModel = lrResult.model;
  let isLrBest = true;

  if (rfMetrics.mae < lrMetrics.mae) {
    bestModelName = 'Random Forest';
    bestModelObj = rfResult.model;
    isLrBest = false;
  }

  const selectionReason = `Selected '${bestModelName}' based on lower validation MAE (${isLrBest ? lrMetrics.mae : rfMetrics.mae} vs ${isLrBest ? rfMetrics.mae : lrMetrics.mae} cycles).`;

  const modelComparisons: ModelComparisonResult[] = [
    {
      model_name: 'Linear Regression',
      metrics: lrMetrics,
      is_best: isLrBest,
      selection_reason: isLrBest ? selectionReason : undefined
    },
    {
      model_name: 'Random Forest',
      metrics: rfMetrics,
      is_best: !isLrBest,
      selection_reason: !isLrBest ? selectionReason : undefined
    }
  ];

  // Feature importances
  let featureImportances: FeatureImportanceItem[] = [];
  if (rfResult.model.featureImportances && rfResult.model.featureImportances.length > 0) {
    featureImportances = rfResult.model.featureImportances;
  } else {
    featureImportances = trainFeatures.featureNames.map(f => ({ feature: f, importance: 1 / trainFeatures.featureNames.length }));
  }

  // 7. Save trained model artifacts under models/<dataset_id>/
  try {
    const datasetModelDir = path.join(MODELS_DIR, datasetId);
    if (!fs.existsSync(datasetModelDir)) {
      fs.mkdirSync(datasetModelDir, { recursive: true });
    }

    fs.writeFileSync(path.join(datasetModelDir, 'scaler.json'), JSON.stringify(scaler, null, 2));
    fs.writeFileSync(path.join(datasetModelDir, 'linear_regression.json'), JSON.stringify(lrResult.model, null, 2));
    fs.writeFileSync(path.join(datasetModelDir, 'random_forest.json'), JSON.stringify(rfResult.model, null, 2));

    const modelMetadata = {
      dataset_id: datasetId,
      trained_at: new Date().toISOString(),
      best_model_name: bestModelName,
      selection_reason: selectionReason,
      comparisons: modelComparisons,
      feature_importances: featureImportances,
      hyperparameters: {
        lr_lambda: lrLambda,
        rf_n_estimators: rfNEstimators,
        rf_max_depth: rfMaxDepth,
        rf_min_samples_split: rfMinSplit
      }
    };

    fs.writeFileSync(path.join(datasetModelDir, 'metadata.json'), JSON.stringify(modelMetadata, null, 2));
  } catch (e) {
    console.warn('Skipping disk model saving in client environment:', e);
  }

  return {
    datasetId,
    bestModelName,
    selectionReason,
    modelComparisons,
    scalerParams: scaler,
    bestModelObj,
    featureImportances
  };
}
