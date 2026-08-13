import { SensorStats, CorrelationMatrixResponse, EngineDetailResponse } from '../types';
import { computeClientDatasetAnalysis, getClientEngineDetail } from './clientDatasetService';

export interface FullAnalysisResponse {
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

export async function runDatasetAnalysis(datasetId: string): Promise<FullAnalysisResponse> {
  try {
    const res = await fetch('/api/analysis/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return computeClientDatasetAnalysis(datasetId);
}

export async function fetchDatasetAnalysis(datasetId: string): Promise<FullAnalysisResponse> {
  try {
    const res = await fetch(`/api/analysis/${datasetId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return computeClientDatasetAnalysis(datasetId);
}

export async function fetchSensorStats(datasetId: string): Promise<SensorStats[]> {
  try {
    const res = await fetch(`/api/analysis/${datasetId}/sensors`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.sensors) return data.sensors;
    }
  } catch {
    // ignore
  }
  const analysis = computeClientDatasetAnalysis(datasetId);
  return analysis.sensors_stats;
}

export async function fetchCorrelationMatrix(datasetId: string): Promise<CorrelationMatrixResponse> {
  try {
    const res = await fetch(`/api/analysis/${datasetId}/correlation`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  const analysis = computeClientDatasetAnalysis(datasetId);
  return analysis.correlation;
}

export async function fetchEngineDetail(datasetId: string, engineId: number): Promise<EngineDetailResponse> {
  try {
    const res = await fetch(`/api/analysis/${datasetId}/engines/${engineId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return getClientEngineDetail(datasetId, engineId);
}
