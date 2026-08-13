import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.services.parser_service import parse_dataset_file
from backend.app.services.validation_service import validate_dataset

UPLOADS_DIR = "uploads"

def save_dataset(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    dataset_id = f"dataset_{uuid.uuid4().hex[:12]}"
    dataset_folder = os.path.join(UPLOADS_DIR, dataset_id)
    os.makedirs(dataset_folder, exist_ok=True)

    parse_res = parse_dataset_file(file_bytes, filename)
    val_res = validate_dataset(parse_res)

    metadata = {
        "dataset_id": dataset_id,
        "filename": filename,
        "original_filename": filename,
        "file_size_bytes": len(file_bytes),
        "dataset_format": parse_res["format"],
        "status": val_res["status"],
        "uploaded_at": datetime.utcnow().isoformat() + "Z",
        "summary": val_res["summary"],
        "quality": val_res["quality"],
        "column_names": parse_res["columns"]
    }

    with open(os.path.join(dataset_folder, "original_file"), "wb") as f:
        f.write(file_bytes)

    with open(os.path.join(dataset_folder, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    with open(os.path.join(dataset_folder, "parsed_data.json"), "w") as f:
        json.dump(parse_res["rows"], f)

    return metadata

def get_dataset_metadata(dataset_id: str) -> Optional[Dict[str, Any]]:
    meta_path = os.path.join(UPLOADS_DIR, dataset_id, "metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            return json.load(f)
    return None

def get_dataset_preview(dataset_id: str, limit: int = 20) -> Optional[Dict[str, Any]]:
    meta = get_dataset_metadata(dataset_id)
    if not meta:
        return None
    data_path = os.path.join(UPLOADS_DIR, dataset_id, "parsed_data.json")
    if os.path.exists(data_path):
        with open(data_path, "r") as f:
            rows = json.load(f)
        preview = rows[:limit]
        return {
            "dataset_id": dataset_id,
            "filename": meta["filename"],
            "total_rows": len(rows),
            "preview_rows_count": len(preview),
            "columns": meta["column_names"],
            "rows": preview
        }
    return None
