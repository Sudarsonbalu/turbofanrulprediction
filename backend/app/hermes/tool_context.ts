import { listUploadedDatasets, getDatasetQuality } from '../services/dataset_service';
import { getDatasetAnalysis, getEngineDetail } from '../services/analysis_service';
import { getPredictionResults, getModelComparison } from '../services/prediction_service';

export class TurbofanToolContext {
  public static getDatasetSummary(datasetId: string) {
    const datasets = listUploadedDatasets();
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const found = datasets.find(d => d.dataset_id === normalized || d.dataset_id === datasetId);

    if (!found) {
      if (datasets.length > 0) {
        const fallback = datasets[0];
        return {
          dataset_id: fallback.dataset_id,
          filename: fallback.filename,
          dataset_format: fallback.dataset_format,
          total_rows: fallback.summary.rows,
          total_engines: fallback.summary.engines,
          max_cycle: fallback.summary.max_cycle,
          validation_status: fallback.status
        };
      }
      return { status: 'ERROR', message: 'No validated dataset is available in workspace.' };
    }

    return {
      dataset_id: found.dataset_id,
      filename: found.filename,
      dataset_format: found.dataset_format,
      total_rows: found.summary.rows,
      total_engines: found.summary.engines,
      max_cycle: found.summary.max_cycle,
      validation_status: found.status
    };
  }

  public static getDatasetQuality(datasetId: string) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    try {
      const quality = getDatasetQuality(normalized);
      if (!quality) {
        return { status: 'ERROR', message: `Dataset quality assessment not available for '${datasetId}'.` };
      }
      return quality;
    } catch {
      return { status: 'ERROR', message: `Dataset quality assessment failed for '${datasetId}'.` };
    }
  }

  public static getSensorStatistics(datasetId: string, sensorName?: string) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const analysis = getDatasetAnalysis(normalized);
    if (!analysis) {
      return { status: 'ERROR', message: `No sensor analysis available for dataset '${datasetId}'. Upload and validate dataset first.` };
    }

    if (sensorName) {
      const found = analysis.sensors_stats.find(s => s.sensor.toLowerCase() === sensorName.toLowerCase());
      if (!found) {
        return { status: 'ERROR', message: `Sensor '${sensorName}' not found in dataset analysis.` };
      }
      return found;
    }

    return {
      total_sensors: analysis.sensors_stats.length,
      sensors: analysis.sensors_stats
    };
  }

  public static getSensorTrend(datasetId: string, engineId: number, sensorName: string) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const engineDetail = getEngineDetail(normalized, engineId);
    if (!engineDetail) {
      return { status: 'ERROR', message: `Engine #${engineId} not found in dataset '${datasetId}'.` };
    }

    const sensorLower = sensorName.toLowerCase();
    const sensorKey = engineDetail.sensors_available.find(s => s.toLowerCase() === sensorLower);

    if (!sensorKey) {
      return { status: 'ERROR', message: `Sensor '${sensorName}' not found for Engine #${engineId}.` };
    }

    const trendPoints = engineDetail.cycles.map(c => ({
      cycle: c.cycle,
      value: c[sensorKey]
    }));

    return {
      engine_id: engineId,
      sensor: sensorKey,
      start_value: engineDetail.degradation_summary.initial_values[sensorKey],
      final_value: engineDetail.degradation_summary.final_values[sensorKey],
      percentage_change: engineDetail.degradation_summary.pct_changes[sensorKey],
      total_cycles: engineDetail.total_cycles,
      recent_cycles: trendPoints.slice(-10)
    };
  }

  public static getEngineDetails(datasetId: string, engineId: number) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const engineDetail = getEngineDetail(normalized, engineId);
    if (!engineDetail) {
      return { status: 'ERROR', message: `Engine #${engineId} not found in dataset '${datasetId}'.` };
    }

    const predResults = getPredictionResults(normalized);
    const predMatch = predResults?.predictions.find(p => p.engine_id === Number(engineId));

    return {
      engine_id: engineId,
      total_cycles: engineDetail.total_cycles,
      sensors_available: engineDetail.sensors_available,
      degradation_summary: engineDetail.degradation_summary,
      prediction: predMatch
        ? {
            predicted_rul: predMatch.predicted_rul,
            actual_rul: predMatch.actual_rul,
            risk_level: predMatch.risk_level,
            model_used: predResults?.model_used
          }
        : 'RUL prediction is not available yet for this engine.'
    };
  }

  public static getRulPrediction(datasetId: string, engineId?: number) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const predResults = getPredictionResults(normalized);

    if (!predResults) {
      return { status: 'NOT_RUN', message: 'RUL prediction has not been completed yet. Run predictive analysis first.' };
    }

    if (engineId !== undefined && engineId !== null) {
      const match = predResults.predictions.find(p => p.engine_id === Number(engineId));
      if (!match) {
        return { status: 'NOT_FOUND', message: `No prediction found for Engine #${engineId}.` };
      }
      return {
        engine_id: match.engine_id,
        current_cycle: match.current_cycle,
        predicted_rul: match.predicted_rul,
        actual_rul: match.actual_rul,
        risk_level: match.risk_level,
        model_used: predResults.model_used,
        thresholds: predResults.thresholds
      };
    }

    return {
      model_used: predResults.model_used,
      metrics: predResults.metrics,
      summary: predResults.summary,
      top_critical_engines: predResults.predictions.slice(0, 5)
    };
  }

  public static getModelMetrics(datasetId: string) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const comparisons = getModelComparison(normalized);
    const predResults = getPredictionResults(normalized);

    if (!comparisons || !predResults) {
      return { status: 'NOT_RUN', message: 'Model evaluation metrics not available yet. Run predictive analysis first.' };
    }

    return {
      selected_model: predResults.model_used,
      selection_reason: predResults.selection_reason,
      active_metrics: predResults.metrics,
      all_model_comparisons: comparisons
    };
  }

  public static getFeatureImportance(datasetId: string) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const predResults = getPredictionResults(normalized);

    if (!predResults || !predResults.feature_importance) {
      return { status: 'NOT_RUN', message: 'Feature importance not available. Run predictive analysis first.' };
    }

    return {
      model_used: predResults.model_used,
      feature_importance: predResults.feature_importance
    };
  }

  public static compareEngines(datasetId: string, limit: number = 10) {
    const normalized = datasetId.startsWith('dataset_') ? datasetId : `dataset_${datasetId}`;
    const predResults = getPredictionResults(normalized);

    if (!predResults) {
      return { status: 'NOT_RUN', message: 'RUL prediction has not been completed yet. Cannot compare engines.' };
    }

    const sorted = [...predResults.predictions].sort((a, b) => a.predicted_rul - b.predicted_rul);

    return {
      model_used: predResults.model_used,
      total_engines: predResults.summary.total_engines,
      lowest_rul_engines: sorted.slice(0, limit),
      summary: predResults.summary
    };
  }
}
