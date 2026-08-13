from fastapi import FastAPI
from backend.app.api import dataset

app = FastAPI(
    title="TurbofanAI API",
    description="Turbomachinery Health & Predictive Maintenance Platform - Real Dataset Ingestion & Validation API",
    version="1.0.0"
)

app.include_router(dataset.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "TurbofanAI"}
