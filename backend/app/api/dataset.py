from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.dataset_service import (
    save_dataset, get_dataset_metadata, get_dataset_preview
)

router = APIRouter(prefix="/api/dataset", tags=["dataset"])

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    metadata = save_dataset(content, file.filename)
    return metadata

@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str):
    metadata = get_dataset_metadata(dataset_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return metadata

@router.get("/{dataset_id}/preview")
async def preview_dataset(dataset_id: str):
    preview = get_dataset_preview(dataset_id, limit=20)
    if not preview:
        raise HTTPException(status_code=404, detail="Dataset or preview rows not found")
    return preview

@router.get("/{dataset_id}/quality")
async def quality_dataset(dataset_id: str):
    metadata = get_dataset_metadata(dataset_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return metadata["quality"]
