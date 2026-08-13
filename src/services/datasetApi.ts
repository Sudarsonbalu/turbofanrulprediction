import { DatasetMetadata, DatasetPreviewResponse, DataQualityReport, ColumnProfile } from '../types';
import {
  processClientDatasetUpload,
  generateClientSampleDataset,
  getClientDatasetMetadata,
  getClientDatasetPreview
} from './clientDatasetService';

export async function uploadDatasetFile(file: File): Promise<DatasetMetadata> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/dataset/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Server upload failed, switching to high-speed client-side ingestion fallback:', e);
  }

  // Client-side fallback for serverless/offline environments
  const text = await file.text();
  return processClientDatasetUpload(text, file.name);
}

export async function loadSampleDataset(): Promise<DatasetMetadata> {
  try {
    const response = await fetch('/api/dataset/sample', {
      method: 'POST'
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Server sample load failed, switching to client-side benchmark generator fallback:', e);
  }

  // Client-side fallback for serverless/offline environments
  return generateClientSampleDataset();
}

export async function fetchUploadedDatasets(): Promise<DatasetMetadata[]> {
  try {
    const response = await fetch('/api/datasets');
    if (response.ok) {
      const serverDatasets = await response.json();
      if (Array.isArray(serverDatasets) && serverDatasets.length > 0) {
        return serverDatasets;
      }
    }
  } catch {
    // ignore
  }

  // Fallback to generating initial client sample dataset
  return [generateClientSampleDataset()];
}

export async function fetchDatasetMetadata(datasetId: string): Promise<DatasetMetadata> {
  try {
    const response = await fetch(`/api/dataset/${datasetId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  const clientMeta = getClientDatasetMetadata(datasetId);
  if (clientMeta) return clientMeta;
  throw new Error(`Failed to fetch metadata for dataset ${datasetId}`);
}

export async function fetchDatasetPreview(datasetId: string, limit: number = 20): Promise<DatasetPreviewResponse> {
  try {
    const response = await fetch(`/api/dataset/${datasetId}/preview?limit=${limit}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  const clientPreview = getClientDatasetPreview(datasetId, limit);
  if (clientPreview) return clientPreview;
  throw new Error(`Failed to fetch preview for dataset ${datasetId}`);
}

export async function fetchDatasetQuality(datasetId: string): Promise<DataQualityReport> {
  try {
    const response = await fetch(`/api/dataset/${datasetId}/quality`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  const clientMeta = getClientDatasetMetadata(datasetId);
  if (clientMeta) return clientMeta.quality;
  throw new Error(`Failed to fetch quality report for dataset ${datasetId}`);
}

export async function fetchDatasetColumns(datasetId: string): Promise<ColumnProfile[]> {
  try {
    const response = await fetch(`/api/dataset/${datasetId}/columns`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }

  const clientMeta = getClientDatasetMetadata(datasetId);
  if (clientMeta) return clientMeta.columns_profile;
  throw new Error(`Failed to fetch column profiles for dataset ${datasetId}`);
}

export async function deleteUploadedDataset(datasetId: string): Promise<void> {
  try {
    await fetch(`/api/dataset/${datasetId}`, {
      method: 'DELETE'
    });
  } catch {
    // ignore
  }
}
