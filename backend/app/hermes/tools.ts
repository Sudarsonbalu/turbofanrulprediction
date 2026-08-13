import { TurbofanToolContext } from './tool_context';

export interface HermesToolDeclaration {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export const HERMES_READONLY_TOOLS: HermesToolDeclaration[] = [
  {
    type: 'function',
    function: {
      name: 'get_dataset_summary',
      description: 'Retrieves metadata summary, row count, engine count, and validation status for a Phase 1 uploaded dataset.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID (e.g. dataset_173918239 or train_FD001)' }
        },
        required: ['dataset_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_dataset_quality',
      description: 'Retrieves data quality metrics including missing values, duplicate rows, and numeric validation results.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' }
        },
        required: ['dataset_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_sensor_statistics',
      description: 'Retrieves mean, standard deviation, min, max, and unique value distributions for dataset sensors.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' },
          sensor_name: { type: 'string', description: 'Optional specific sensor name (e.g., sensor_7)' }
        },
        required: ['dataset_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_sensor_trend',
      description: 'Retrieves historical cycle telemetry observations and percentage degradation delta for a specific sensor and engine unit.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' },
          engine_id: { type: 'integer', description: 'The engine unit ID (e.g. 24)' },
          sensor_name: { type: 'string', description: 'Sensor column name (e.g., sensor_7)' }
        },
        required: ['dataset_id', 'engine_id', 'sensor_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_engine_details',
      description: 'Retrieves complete operating profile, cycle count, sensor degradation summary, and current RUL prediction for an engine unit.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' },
          engine_id: { type: 'integer', description: 'The engine unit ID' }
        },
        required: ['dataset_id', 'engine_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_rul_prediction',
      description: 'Retrieves predicted Remaining Useful Life (RUL), risk classification, and current cycle for an engine unit or entire dataset summary.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' },
          engine_id: { type: 'integer', description: 'Optional engine unit ID' }
        },
        required: ['dataset_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_model_metrics',
      description: 'Retrieves MAE, RMSE, R² scores, and validation comparisons for trained ML baseline and Random Forest models.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' }
        },
        required: ['dataset_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_feature_importance',
      description: 'Retrieves normalized feature importance weights from Random Forest model variance gain calculations.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' }
        },
        required: ['dataset_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_engines',
      description: 'Ranks and compares engine units in dataset by lowest predicted remaining useful life (RUL) and health risk classification.',
      parameters: {
        type: 'object',
        properties: {
          dataset_id: { type: 'string', description: 'The dataset ID' },
          limit: { type: 'integer', description: 'Number of top engines to return (default 10)' }
        },
        required: ['dataset_id']
      }
    }
  }
];

export async function executeHermesTool(
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; result: any; error?: string }> {
  try {
    const datasetId = args.dataset_id || 'train_FD001.txt';

    switch (toolName) {
      case 'get_dataset_summary':
        return { success: true, result: TurbofanToolContext.getDatasetSummary(datasetId) };

      case 'get_dataset_quality':
        return { success: true, result: TurbofanToolContext.getDatasetQuality(datasetId) };

      case 'get_sensor_statistics':
        return { success: true, result: TurbofanToolContext.getSensorStatistics(datasetId, args.sensor_name) };

      case 'get_sensor_trend':
        return { success: true, result: TurbofanToolContext.getSensorTrend(datasetId, Number(args.engine_id), args.sensor_name) };

      case 'get_engine_details':
        return { success: true, result: TurbofanToolContext.getEngineDetails(datasetId, Number(args.engine_id)) };

      case 'get_rul_prediction':
        return { success: true, result: TurbofanToolContext.getRulPrediction(datasetId, args.engine_id ? Number(args.engine_id) : undefined) };

      case 'get_model_metrics':
        return { success: true, result: TurbofanToolContext.getModelMetrics(datasetId) };

      case 'get_feature_importance':
        return { success: true, result: TurbofanToolContext.getFeatureImportance(datasetId) };

      case 'compare_engines':
        return { success: true, result: TurbofanToolContext.compareEngines(datasetId, args.limit ? Number(args.limit) : 10) };

      default:
        return { success: false, result: null, error: `Unknown Hermes tool '${toolName}'. Tool access is restricted to authorized read-only tools.` };
    }
  } catch (err: any) {
    return { success: false, result: null, error: err?.message || `Failed to execute tool '${toolName}'.` };
  }
}
