import fs from 'fs';
import path from 'path';
import { ParsedRow } from './parser_service';
import { cleanRows, computeSensorStatistics, computeCorrelationMatrix } from '../ml/preprocessing';
import { SensorStats, CorrelationMatrixResponse, EngineDetailResponse } from '../../../src/types';
import { getDatasetFolder, getDatasetMetadata } from './dataset_service';

const PROCESSED_DIR = path.join(process.cwd(), 'processed');

export interface FullAnalysisResult {
  dataset_id: string;
  processed_at: string;
  summary: {
    total_rows: number;
    total_engines: number;
    total_cycles: number;
    sensor_count: number;
  };
  sensors_stats: SensorStats[];
  correlation: CorrelationMatrixResponse;
}

function ensureProcessedDir(datasetId: string) {
  const dir = path.join(PROCESSED_DIR, datasetId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function runDatasetAnalysis(datasetId: string): FullAnalysisResult {
  const meta = getDatasetMetadata(datasetId);
  const uploadFolder = getDatasetFolder(datasetId);

  if (!meta || !uploadFolder) {
    throw new Error(`Dataset '${datasetId}' parsed data not found.`);
  }

  const dataPath = path.join(uploadFolder, 'parsed_data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Dataset '${datasetId}' parsed data file missing.`);
  }

  const rawRows: ParsedRow[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const cleaned = cleanRows(rawRows);

  if (cleaned.length === 0) {
    throw new Error(`Dataset '${datasetId}' contains no valid rows.`);
  }

  // Extract unique engines and max cycles
  const enginesSet = new Set<number>();
  let maxCycle = 0;
  for (const r of cleaned) {
    enginesSet.add(Number(r['engine_id']));
    const c = Number(r['cycle']);
    if (c > maxCycle) maxCycle = c;
  }

  // Identify sensor columns
  const sensorCols = Object.keys(cleaned[0]).filter(k => k.toLowerCase().includes('sensor'));

  const sensorsStats = computeSensorStatistics(cleaned, sensorCols);
  const correlation = computeCorrelationMatrix(cleaned, sensorCols);

  const result: FullAnalysisResult = {
    dataset_id: meta.dataset_id,
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

  const processedFolder = ensureProcessedDir(meta.dataset_id);
  fs.writeFileSync(path.join(processedFolder, 'analysis.json'), JSON.stringify(result, null, 2));

  return result;
}

export function getDatasetAnalysis(datasetId: string): FullAnalysisResult | null {
  const meta = getDatasetMetadata(datasetId);
  if (!meta) return null;

  const analysisPath = path.join(PROCESSED_DIR, meta.dataset_id, 'analysis.json');

  if (fs.existsSync(analysisPath)) {
    try {
      return JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    } catch {
      // Fallback
    }
  }

  try {
    return runDatasetAnalysis(meta.dataset_id);
  } catch {
    return null;
  }
}

export function getEngineDetail(datasetId: string, engineId: number): EngineDetailResponse | null {
  const meta = getDatasetMetadata(datasetId);
  const uploadFolder = getDatasetFolder(datasetId);
  if (!meta || !uploadFolder) return null;

  const dataPath = path.join(uploadFolder, 'parsed_data.json');
  if (!fs.existsSync(dataPath)) return null;

  const rawRows: ParsedRow[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const engineRows = rawRows
    .filter(r => Number(r['engine_id']) === Number(engineId))
    .sort((a, b) => Number(a['cycle']) - Number(b['cycle']));

  if (engineRows.length === 0) return null;

  const sensorCols = Object.keys(engineRows[0]).filter(k => k.toLowerCase().includes('sensor'));
  const startRow = engineRows[0];
  const lastRow = engineRows[engineRows.length - 1];

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
    dataset_id: meta.dataset_id,
    engine_id: engineId,
    total_cycles: engineRows.length,
    sensors_available: sensorCols,
    cycles: engineRows as Record<string, number | null>[],
    degradation_summary: {
      start_cycle: Number(startRow['cycle']),
      last_cycle: Number(lastRow['cycle']),
      initial_values: initialValues,
      final_values: finalValues,
      pct_changes: pctChanges
    }
  };
}
