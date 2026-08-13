export interface DatasetSummary {
  rows: number;
  columns: number;
  engines: number;
  sensors: number;
  min_cycle: number;
  max_cycle: number;
}

export interface DataQualityReport {
  missing_values: number;
  duplicate_rows: number;
  invalid_values: number;
  nan_values: number;
  infinite_values: number;
  numeric_sensors_status: string;
  is_sensors_valid: boolean;
  issues: string[];
}

export interface ColumnProfile {
  column: string;
  data_type: 'integer' | 'float' | 'string' | 'boolean';
  non_null_count: number;
  unique_count: number;
  min_value?: number;
  max_value?: number;
  mean_value?: number;
  std_dev?: number;
}

export interface DatasetMetadata {
  dataset_id: string;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  dataset_format: 'NASA_CMAPSS' | 'CSV' | 'NASA_CMAPSS_RUL' | 'UNKNOWN';
  status: 'VALID' | 'WARNING' | 'INVALID';
  uploaded_at: string;
  summary: DatasetSummary;
  quality: DataQualityReport;
  column_names: string[];
  columns_profile: ColumnProfile[];
}

export interface DatasetPreviewResponse {
  dataset_id: string;
  filename: string;
  total_rows: number;
  preview_rows_count: number;
  columns: string[];
  rows: Record<string, string | number | null>[];
}

// ==========================================
// Phase 2: Analytics & Correlation Types
// ==========================================

export interface SensorStats {
  sensor: string;
  mean: number;
  std: number;
  min: number;
  max: number;
  missing_count: number;
  unique_count: number;
}

export interface CorrelationMatrixResponse {
  sensors: string[];
  matrix: number[][]; // 2D matrix of Pearson correlation coefficients
}

export interface EngineDetailResponse {
  dataset_id: string;
  engine_id: number;
  total_cycles: number;
  sensors_available: string[];
  cycles: Record<string, number | null>[];
  degradation_summary: {
    start_cycle: number;
    last_cycle: number;
    initial_values: Record<string, number>;
    final_values: Record<string, number>;
    pct_changes: Record<string, number>;
  };
}

// ==========================================
// Phase 2: ML Models & Prediction Types
// ==========================================

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  training_time_ms: number;
}

export interface ModelComparisonResult {
  model_name: string;
  metrics: ModelMetrics;
  is_best: boolean;
  selection_reason?: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export type RiskLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export interface EnginePredictionResult {
  engine_id: number;
  current_cycle: number;
  predicted_rul: number;
  actual_rul?: number;
  absolute_error?: number;
  risk_level: RiskLevel;
}

export interface RiskThresholds {
  critical_threshold: number;
  warning_threshold: number;
}

export interface PredictionResultsResponse {
  dataset_id: string;
  model_used: string;
  selection_reason: string;
  metrics: ModelMetrics;
  thresholds: RiskThresholds;
  summary: {
    total_engines: number;
    avg_predicted_rul: number;
    min_predicted_rul: number;
    critical_count: number;
    warning_count: number;
    healthy_count: number;
  };
  predictions: EnginePredictionResult[];
  feature_importance: FeatureImportanceItem[];
}

export interface TrainModelParams {
  dataset_id: string;
  rf_n_estimators?: number;
  rf_max_depth?: number;
  rf_min_samples_split?: number;
  lr_lambda?: number;
  critical_threshold?: number;
  warning_threshold?: number;
}

export interface PipelineExecutionLog {
  step: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  message: string;
  timestamp: string;
}
