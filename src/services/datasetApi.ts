import { DatasetMetadata, DatasetPreviewResponse, DataQualityReport, ColumnProfile } from '../types';

export async function uploadDatasetFile(file: File): Promise<DatasetMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/dataset/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let errMsg = 'Failed to upload dataset file.';
    try {
      const errData = await response.json();
      errMsg = errData.error || errData.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export async function loadSampleDataset(): Promise<DatasetMetadata> {
  const response = await fetch('/api/dataset/sample', {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Failed to load sample NASA dataset.');
  }

  return response.json();
}

export async function fetchUploadedDatasets(): Promise<DatasetMetadata[]> {
  const response = await fetch('/api/datasets');
  if (!response.ok) {
    throw new Error('Failed to fetch dataset list');
  }
  return response.json();
}

export async function fetchDatasetMetadata(datasetId: string): Promise<DatasetMetadata> {
  const response = await fetch(`/api/dataset/${datasetId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata for dataset ${datasetId}`);
  }
  return response.json();
}

export async function fetchDatasetPreview(datasetId: string, limit: number = 20): Promise<DatasetPreviewResponse> {
  const response = await fetch(`/api/dataset/${datasetId}/preview?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch preview for dataset ${datasetId}`);
  }
  return response.json();
}

export async function fetchDatasetQuality(datasetId: string): Promise<DataQualityReport> {
  const response = await fetch(`/api/dataset/${datasetId}/quality`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quality report for dataset ${datasetId}`);
  }
  return response.json();
}

export async function fetchDatasetColumns(datasetId: string): Promise<ColumnProfile[]> {
  const response = await fetch(`/api/dataset/${datasetId}/columns`);
  if (!response.ok) {
    throw new Error(`Failed to fetch column profiles for dataset ${datasetId}`);
  }
  return response.json();
}

export async function deleteUploadedDataset(datasetId: string): Promise<void> {
  const response = await fetch(`/api/dataset/${datasetId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to delete dataset ${datasetId}`);
  }
}
