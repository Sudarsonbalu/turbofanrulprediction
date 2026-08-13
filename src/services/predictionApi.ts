import {
  PredictionResultsResponse,
  ModelComparisonResult,
  FeatureImportanceItem,
  TrainModelParams
} from '../types';

export async function trainRulModels(
  datasetId: string,
  params?: Partial<TrainModelParams>
): Promise<any> {
  const res = await fetch('/api/prediction/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, params })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to train ML models');
  }
  return res.json();
}

export async function runPredictiveAnalysis(
  datasetId: string,
  params?: Partial<TrainModelParams>
): Promise<PredictionResultsResponse> {
  const res = await fetch('/api/prediction/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, params })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run predictive analysis');
  }
  return res.json();
}

export async function fetchPredictionResults(datasetId: string): Promise<PredictionResultsResponse | null> {
  const res = await fetch(`/api/prediction/${datasetId}/results`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch prediction results');
  }
  return res.json();
}

export async function fetchModelComparison(datasetId: string): Promise<ModelComparisonResult[] | null> {
  const res = await fetch(`/api/prediction/${datasetId}/model-comparison`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.comparisons || null;
}

export async function fetchFeatureImportance(datasetId: string): Promise<FeatureImportanceItem[] | null> {
  const res = await fetch(`/api/prediction/${datasetId}/feature-importance`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.feature_importance || null;
}
