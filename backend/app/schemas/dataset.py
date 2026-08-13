from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class DatasetSummary(BaseModel):
    rows: int
    columns: int
    engines: int
    sensors: int
    min_cycle: int
    max_cycle: int

class DataQualityReport(BaseModel):
    missing_values: int
    duplicate_rows: int
    invalid_values: int
    nan_values: int
    infinite_values: int
    numeric_sensors_status: str
    is_sensors_valid: bool
    issues: List[str]

class ColumnProfile(BaseModel):
    column: str
    data_type: str
    non_null_count: int
    unique_count: int
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    mean_value: Optional[float] = None

class DatasetMetadata(BaseModel):
    dataset_id: str
    filename: str
    original_filename: str
    file_size_bytes: int
    dataset_format: str
    status: str
    uploaded_at: str
    summary: DatasetSummary
    quality: DataQualityReport
    column_names: List[str]
    columns_profile: List[ColumnProfile]

class DatasetPreviewResponse(BaseModel):
    dataset_id: str
    filename: str
    total_rows: int
    preview_rows_count: int
    columns: List[str]
    rows: List[Dict[str, Any]]
