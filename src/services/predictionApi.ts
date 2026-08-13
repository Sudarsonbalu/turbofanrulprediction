import {
  PredictionResultsResponse,
  ModelComparisonResult,
  FeatureImportanceItem,
  TrainModelParams
} from '../types';
import {
  runClientPrediction,
  getClientModelComparison,
  getClientFeatureImportance
} from './clientDatasetService';

export async function trainRulModels(
  datasetId: string,
  params?: Partial<TrainModelParams>
): Promise<any> {
  try {
    const res = await fetch('/api/prediction/train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId, params })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  const results = runClientPrediction(datasetId, params as any);
  return {
    status: 'SUCCESS',
    dataset_id: datasetId,
    selected_model: results.model_used,
    selection_reason: results.selection_reason,
    model_comparisons: getClientModelComparison(datasetId),
    feature_importance: results.feature_importance
  };
}

export async function runPredictiveAnalysis(
  datasetId: string,
  params?: Partial<TrainModelParams>
): Promise<PredictionResultsResponse> {
  try {
    const res = await fetch('/api/prediction/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId, params })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return runClientPrediction(datasetId, params as any);
}

export async function fetchPredictionResults(datasetId: string): Promise<PredictionResultsResponse> {
  try {
    const res = await fetch(`/api/prediction/${datasetId}/results`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return runClientPrediction(datasetId);
}

export async function fetchModelComparison(datasetId: string): Promise<ModelComparisonResult[]> {
  try {
    const res = await fetch(`/api/prediction/${datasetId}/model-comparison`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.comparisons) return data.comparisons;
    }
  } catch {
    // ignore
  }

  return getClientModelComparison(datasetId);
}

export async function fetchFeatureImportance(datasetId: string): Promise<FeatureImportanceItem[]> {
  try {
    const res = await fetch(`/api/prediction/${datasetId}/feature-importance`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.feature_importance) return data.feature_importance;
    }
  } catch {
    // ignore
  }

  return getClientFeatureImportance(datasetId);
}
