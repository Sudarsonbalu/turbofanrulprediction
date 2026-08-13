import { parseDatasetFile, ParsedRow } from '../../backend/app/services/parser_service';
import { validateDataset } from '../../backend/app/services/validation_service';
import { cleanRows, computeSensorStatistics, computeCorrelationMatrix } from '../../backend/app/ml/preprocessing';
import { extractTestLastCycles, generateTrainingRUL } from '../../backend/app/ml/rul_generator';
import { engineerFeatures, fitScaler, transformScaler } from '../../backend/app/ml/feature_engineering';
import { trainLinearRegression, predictLinearRegression, LinearRegressionModel } from '../../backend/app/ml/models/linear_regression';
import { trainRandomForest, predictRandomForest, RandomForestModel } from '../../backend/app/ml/models/random_forest';
import { calculateMetrics } from '../../backend/app/ml/evaluate';
import {
  DatasetMetadata,
  ColumnProfile,
  DatasetPreviewResponse,
  EngineDetailResponse,
  PredictionResultsResponse,
  EnginePredictionResult,
  RiskLevel,
  RiskThresholds,
  TrainModelParams,
  ModelComparisonResult,
  FeatureImportanceItem
} from '../types';
import { FullAnalysisResult } from '../../backend/app/services/analysis_service';

// In-memory client dataset store fallback
const clientDatasets: Map<string, { metadata: DatasetMetadata; rows: ParsedRow[] }> = new Map();
const clientAnalysisCache: Map<string, FullAnalysisResult> = new Map();
const clientPredictionCache: Map<string, { response: PredictionResultsResponse; comparisons: ModelComparisonResult[] }> = new Map();

export function generateClientSampleDataset(): DatasetMetadata {
  const lines: string[] = [];
  const numEngines = 100;

  let seed = 42;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  function gaussianNoise(std = 1) {
    const u1 = rnd() || 0.0001;
    const u2 = rnd() || 0.0001;
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * std;
  }

  for (let eng = 1; eng <= numEngines; eng++) {
    const maxCycles = 120 + Math.floor(rnd() * 220);
    for (let cyc = 1; cyc <= maxCycles; cyc++) {
      const deg = Math.pow(cyc / maxCycles, 2) * 100;

      const setting1 = (-0.0007 + gaussianNoise(0.0005)).toFixed(4);
      const setting2 = (0.0003 + gaussianNoise(0.0002)).toFixed(4);
      const setting3 = "100.0";

      const s1 = "518.67";
      const s2 = (642.0 + 0.035 * deg + gaussianNoise(0.2)).toFixed(2);
      const s3 = (1580.0 + 0.075 * deg + gaussianNoise(0.6)).toFixed(2);
      const s4 = (1400.0 + 0.11 * deg + gaussianNoise(0.8)).toFixed(2);
      const s5 = "14.62";
      const s6 = "21.61";
      const s7 = (553.0 - 0.045 * deg + gaussianNoise(0.25)).toFixed(2);
      const s8 = (2388.0 + 0.01 * deg + gaussianNoise(0.15)).toFixed(2);
      const s9 = (9050.0 + 0.03 * deg + gaussianNoise(1.2)).toFixed(2);
      const s10 = "1.30";
      const s11 = (47.20 + 0.012 * deg + gaussianNoise(0.08)).toFixed(2);
      const s12 = (521.0 - 0.032 * deg + gaussianNoise(0.2)).toFixed(2);
      const s13 = (2388.0 + 0.01 * deg + gaussianNoise(0.15)).toFixed(2);
      const s14 = (8130.0 + 0.025 * deg + gaussianNoise(0.8)).toFixed(2);
      const s15 = (8.40 + 0.0012 * deg + gaussianNoise(0.02)).toFixed(4);
      const s16 = "0.03";
      const s17 = (392 + Math.floor(deg / 20) + Math.floor(rnd() * 2)).toString();
      const s18 = "2388";
      const s19 = "100.00";
      const s20 = (38.80 - 0.012 * deg + gaussianNoise(0.05)).toFixed(2);
      const s21 = (23.30 - 0.008 * deg + gaussianNoise(0.04)).toFixed(4);

      const line = `${eng} ${cyc} ${setting1} ${setting2} ${setting3} ${s1} ${s2} ${s3} ${s4} ${s5} ${s6} ${s7} ${s8} ${s9} ${s10} ${s11} ${s12} ${s13} ${s14} ${s15} ${s16} ${s17} ${s18} ${s19} ${s20} ${s21}`;
      lines.push(line);
    }
  }

  const rawTxt = lines.join('\n');
  return processClientDatasetUpload(rawTxt, 'train_FD001.txt');
}

export function processClientDatasetUpload(fileText: string, originalFilename: string): DatasetMetadata {
  const datasetId = 'dataset_' + Math.random().toString(36).substring(2, 10);
  const parseResult = parseDatasetFile(fileText, originalFilename);
  const validation = validateDataset(parseResult);

  const columnsProfile: ColumnProfile[] = parseResult.columns.map(col => {
    let nonNullCount = 0;
    const uniqueVals = new Set<string>();
    let sum = 0;
    let numCount = 0;
    let minVal = Infinity;
    let maxVal = -Infinity;
    let isAllNumbers = true;
    let isAllInts = true;

    parseResult.rows.forEach(row => {
      const val = row[col];
      if (val !== null && val !== undefined && val !== '') {
        nonNullCount++;
        uniqueVals.add(String(val));
        if (typeof val === 'number') {
          sum += val;
          numCount++;
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
          if (!Number.isInteger(val)) isAllInts = false;
        } else {
          isAllNumbers = false;
          isAllInts = false;
        }
      }
    });

    let dataType: 'integer' | 'float' | 'string' | 'boolean' = 'string';
    if (isAllNumbers && numCount > 0) {
      dataType = isAllInts ? 'integer' : 'float';
    }

    return {
      column: col,
      data_type: dataType,
      non_null_count: nonNullCount,
      unique_count: uniqueVals.size,
      min_value: isAllNumbers && numCount > 0 && minVal !== Infinity ? minVal : undefined,
      max_value: isAllNumbers && numCount > 0 && maxVal !== -Infinity ? maxVal : undefined,
      mean_value: isAllNumbers && numCount > 0 ? Number((sum / numCount).toFixed(4)) : undefined
    };
  });

  const metadata: DatasetMetadata = {
    dataset_id: datasetId,
    filename: originalFilename,
    original_filename: originalFilename,
    file_size_bytes: fileText.length,
    dataset_format: parseResult.format,
    status: validation.status,
    uploaded_at: new Date().toISOString(),
    summary: validation.summary,
    quality: validation.quality,
    column_names: parseResult.columns,
    columns_profile: columnsProfile
  };

  clientDatasets.set(datasetId, { metadata, rows: parseResult.rows });
  return metadata;
}

export function getClientDatasetMetadata(datasetId: string): DatasetMetadata {
  const found = clientDatasets.get(datasetId);
  if (found) return found.metadata;
  return generateClientSampleDataset();
}

export function getClientDatasetPreview(datasetId: string, limit: number = 20): DatasetPreviewResponse {
  let found = clientDatasets.get(datasetId);
  if (!found) {
    const meta = generateClientSampleDataset();
    found = clientDatasets.get(meta.dataset_id)!;
  }

  const previewRows = found.rows.slice(0, limit);
  return {
    dataset_id: found.metadata.dataset_id,
    filename: found.metadata.filename,
    total_rows: found.rows.length,
    preview_rows_count: previewRows.length,
    columns: found.metadata.column_names,
    rows: previewRows
  };
}

export function getClientRows(datasetId: string): ParsedRow[] {
  const found = clientDatasets.get(datasetId);
  if (found && found.rows.length > 0) return found.rows;
  const meta = generateClientSampleDataset();
  const sampleFound = clientDatasets.get(meta.dataset_id);
  return sampleFound ? sampleFound.rows : [];
}

export function computeClientDatasetAnalysis(datasetId: string): FullAnalysisResult {
  if (clientAnalysisCache.has(datasetId)) {
    return clientAnalysisCache.get(datasetId)!;
  }

  const rows = getClientRows(datasetId);
  const cleaned = cleanRows(rows);

  const enginesSet = new Set<number>();
  let maxCycle = 0;
  for (const r of cleaned) {
    enginesSet.add(Number(r['engine_id']));
    const c = Number(r['cycle']);
    if (c > maxCycle) maxCycle = c;
  }

  const sensorCols = Object.keys(cleaned[0] || {}).filter(k => k.toLowerCase().includes('sensor'));
  const sensorsStats = computeSensorStatistics(cleaned, sensorCols);
  const correlation = computeCorrelationMatrix(cleaned, sensorCols);

  const result: FullAnalysisResult = {
    dataset_id: datasetId,
    processed_at: new Date().toISOString(),
    summary: {
      total_rows: cleaned.length,
      total_engines: enginesSet.size,
      total_cycles: maxCycle,
      sensor_count: sensorCols.length
    },
    sensors_stats: sensorsStats,
    correlation
  };

  clientAnalysisCache.set(datasetId, result);
  return result;
}

export function getClientEngineDetail(datasetId: string, engineId: number): EngineDetailResponse {
  const rawRows = getClientRows(datasetId);
  const engineRows = rawRows
    .filter(r => Number(r['engine_id']) === Number(engineId))
    .sort((a, b) => Number(a['cycle']) - Number(b['cycle']));

  const sampleRows = engineRows.length > 0 ? engineRows : rawRows.filter(r => Number(r['engine_id']) === 1);
  const sensorCols = Object.keys(sampleRows[0] || {}).filter(k => k.toLowerCase().includes('sensor'));

  const startRow = sampleRows[0] || {};
  const lastRow = sampleRows[sampleRows.length - 1] || {};

  const initialValues: Record<string, number> = {};
  const finalValues: Record<string, number> = {};
  const pctChanges: Record<string, number> = {};

  for (const sensor of sensorCols) {
    const initV = Number(startRow[sensor]) || 0;
    const finalV = Number(lastRow[sensor]) || 0;
    initialValues[sensor] = Number(initV.toFixed(4));
    finalValues[sensor] = Number(finalV.toFixed(4));

    if (Math.abs(initV) > 1e-6) {
      const pct = ((finalV - initV) / Math.abs(initV)) * 100;
      pctChanges[sensor] = Number(pct.toFixed(2));
    } else {
      pctChanges[sensor] = 0;
    }
  }

  return {
    dataset_id: datasetId,
    engine_id: engineId,
    total_cycles: sampleRows.length,
    sensors_available: sensorCols,
    cycles: sampleRows as Record<string, number | null>[],
    degradation_summary: {
      start_cycle: Number(startRow['cycle'] || 1),
      last_cycle: Number(lastRow['cycle'] || sampleRows.length),
      initial_values: initialValues,
      final_values: finalValues,
      pct_changes: pctChanges
    }
  };
}

function trainClientModelInMemory(rows: ParsedRow[], params?: TrainModelParams) {
  const rowsWithRUL = generateTrainingRUL(rows);
  const uniqueEngines = Array.from(new Set(rowsWithRUL.map(r => Number(r.engine_id)))).sort((a, b) => a - b);

  const trainEngineCount = Math.max(1, Math.floor(uniqueEngines.length * 0.8));
  const trainEngines = new Set(uniqueEngines.slice(0, trainEngineCount));

  const trainRows = rowsWithRUL.filter(r => trainEngines.has(Number(r.engine_id)));
  const valRows = rowsWithRUL.filter(r => !trainEngines.has(Number(r.engine_id)));
  const evalRows = valRows.length > 0 ? valRows : trainRows;

  const trainFeatures = engineerFeatures(trainRows, 'rul', 5);
  const valFeatures = engineerFeatures(evalRows, 'rul', 5);

  const scaler = fitScaler(trainFeatures.X, trainFeatures.featureNames);
  const X_train_scaled = transformScaler(trainFeatures.X, scaler);
  const X_val_scaled = transformScaler(valFeatures.X, scaler);

  const lrLambda = params?.lr_lambda !== undefined ? params.lr_lambda : 0.1;
  const lrResult = trainLinearRegression(X_train_scaled, trainFeatures.y, trainFeatures.featureNames, lrLambda);
  const lrValPreds = predictLinearRegression(lrResult.model, X_val_scaled);
  const lrMetrics = calculateMetrics(valFeatures.y, lrValPreds, lrResult.trainingTimeMs);

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

  let featureImportances: FeatureImportanceItem[] = [];
  if (rfResult.model.featureImportances && rfResult.model.featureImportances.length > 0) {
    featureImportances = rfResult.model.featureImportances;
  } else {
    featureImportances = trainFeatures.featureNames.map(f => ({ feature: f, importance: 1 / trainFeatures.featureNames.length }));
  }

  return {
    bestModelName,
    bestModelObj,
    selectionReason,
    scalerParams: scaler,
    modelComparisons,
    featureImportances
  };
}

export function runClientPrediction(datasetId: string, params?: TrainModelParams): PredictionResultsResponse {
  if (clientPredictionCache.has(datasetId)) {
    return clientPredictionCache.get(datasetId)!.response;
  }

  const rows = getClientRows(datasetId);
  const trainOutput = trainClientModelInMemory(rows, params);

  const lastCycleMap = extractTestLastCycles(rows);
  const testEngineIds: number[] = [];
  const testLastCycles: number[] = [];

  for (const [engId, info] of lastCycleMap.entries()) {
    testEngineIds.push(engId);
    testLastCycles.push(info.last_cycle);
  }

  const fullRowsWithRUL = generateTrainingRUL(rows);
  const fullFeatures = engineerFeatures(fullRowsWithRUL, 'rul', 5);
  const X_scaled = transformScaler(fullFeatures.X, trainOutput.scalerParams);

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

  let predictionsRaw: number[] = [];
  if (trainOutput.bestModelName === 'Random Forest') {
    predictionsRaw = predictRandomForest(trainOutput.bestModelObj as RandomForestModel, lastCycleXScaled);
  } else {
    predictionsRaw = predictLinearRegression(trainOutput.bestModelObj as LinearRegressionModel, lastCycleXScaled);
  }

  const metrics = calculateMetrics(lastCycleActualRuls, predictionsRaw, 0);

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

  enginePredictions.sort((a, b) => a.predicted_rul - b.predicted_rul);
  const avgPredRul = testEngineIds.length > 0 ? Math.round(predRulSum / testEngineIds.length) : 0;

  const response: PredictionResultsResponse = {
    dataset_id: datasetId,
    model_used: trainOutput.bestModelName,
    selection_reason: trainOutput.selectionReason,
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
    feature_importance: trainOutput.featureImportances
  };

  clientPredictionCache.set(datasetId, { response, comparisons: trainOutput.modelComparisons });
  return response;
}

export function getClientModelComparison(datasetId: string): ModelComparisonResult[] {
  if (!clientPredictionCache.has(datasetId)) {
    runClientPrediction(datasetId);
  }
  return clientPredictionCache.get(datasetId)?.comparisons || [];
}

export function getClientFeatureImportance(datasetId: string): FeatureImportanceItem[] {
  if (!clientPredictionCache.has(datasetId)) {
    runClientPrediction(datasetId);
  }
  return clientPredictionCache.get(datasetId)?.response.feature_importance || [];
}

export function deleteClientDataset(datasetId: string): void {
  clientDatasets.delete(datasetId);
  clientAnalysisCache.delete(datasetId);
  clientPredictionCache.delete(datasetId);
}
