import { SensorStats, CorrelationMatrixResponse, EngineDetailResponse } from '../types';

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
  const res = await fetch('/api/analysis/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run dataset analysis');
  }
  return res.json();
}

export async function fetchDatasetAnalysis(datasetId: string): Promise<FullAnalysisResponse | null> {
  const res = await fetch(`/api/analysis/${datasetId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch dataset analysis');
  }
  return res.json();
}

export async function fetchSensorStats(datasetId: string): Promise<SensorStats[] | null> {
  const res = await fetch(`/api/analysis/${datasetId}/sensors`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.sensors || null;
}

export async function fetchCorrelationMatrix(datasetId: string): Promise<CorrelationMatrixResponse | null> {
  const res = await fetch(`/api/analysis/${datasetId}/correlation`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchEngineDetail(datasetId: string, engineId: number): Promise<EngineDetailResponse | null> {
  const res = await fetch(`/api/analysis/${datasetId}/engines/${engineId}`);
  if (!res.ok) return null;
  return res.json();
}
