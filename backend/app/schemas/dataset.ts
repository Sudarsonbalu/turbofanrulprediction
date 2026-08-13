export interface DatasetUploadResponse {
  dataset_id: string;
  filename: string;
  dataset_format: string;
  status: 'VALID' | 'WARNING' | 'INVALID';
  summary: {
    rows: number;
    columns: number;
    engines: number;
    sensors: number;
    min_cycle: number;
    max_cycle: number;
  };
  quality: {
    missing_values: number;
    duplicate_rows: number;
    invalid_values: number;
    nan_values: number;
    infinite_values: number;
    numeric_sensors_status: string;
    is_sensors_valid: boolean;
    issues: string[];
  };
  uploaded_at: string;
}
