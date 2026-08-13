import React, { useState, useEffect } from 'react';
import { Database, Trash2, FileText } from 'lucide-react';
import { DatasetMetadata, DatasetPreviewResponse } from '../types';
import { UploadZone } from '../components/UploadZone';
import { DatasetSummaryCard } from '../components/DatasetSummary';
import { DataQualityCard } from '../components/DataQuality';
import { DatasetProfileTable } from '../components/DatasetProfile';
import { DatasetTable } from '../components/DatasetTable';
import {
  fetchUploadedDatasets,
  fetchDatasetPreview,
  deleteUploadedDataset,
  loadSampleDataset
} from '../services/datasetApi';

interface DatasetPageProps {
  selectedDataset: DatasetMetadata | null;
  onDatasetSelect: (dataset: DatasetMetadata | null) => void;
}

export const DatasetPage: React.FC<DatasetPageProps> = ({ selectedDataset, onDatasetSelect }) => {
  const [datasetsList, setDatasetsList] = useState<DatasetMetadata[]>([]);
  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    loadDatasetsList();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadPreview(selectedDataset.dataset_id);
    } else {
      setPreviewData(null);
    }
  }, [selectedDataset?.dataset_id]);

  const loadDatasetsList = async () => {
    try {
      const datasets = await fetchUploadedDatasets();
      setDatasetsList(datasets);
      if (datasets.length > 0 && !selectedDataset) {
        onDatasetSelect(datasets[0]);
      }
    } catch (err) {
      console.error('Failed to load dataset list:', err);
    }
  };

  const loadPreview = async (datasetId: string) => {
    setIsLoadingPreview(true);
    try {
      const preview = await fetchDatasetPreview(datasetId, 20);
      setPreviewData(preview);
    } catch (err) {
      console.error('Failed to load preview:', err);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleUploadSuccess = (newDataset: DatasetMetadata) => {
    setDatasetsList(prev => [newDataset, ...prev]);
    onDatasetSelect(newDataset);
  };

  const handleDeleteDataset = async (datasetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await deleteUploadedDataset(datasetId);
      const updatedList = datasetsList.filter(d => d.dataset_id !== datasetId);
      setDatasetsList(updatedList);

      if (selectedDataset?.dataset_id === datasetId) {
        onDatasetSelect(updatedList.length > 0 ? updatedList[0] : null);
      }
    } catch (err) {
      alert('Failed to delete dataset.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <UploadZone onUploadSuccess={handleUploadSuccess} />

      {datasetsList.length > 0 && (
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-4 space-y-2">
          <p className="text-xs font-semibold text-[#5A594F] uppercase font-mono tracking-wider">
            Uploaded Datasets Repository ({datasetsList.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {datasetsList.map(ds => {
              const isSelected = selectedDataset?.dataset_id === ds.dataset_id;
              return (
                <div
                  key={ds.dataset_id}
                  onClick={() => onDatasetSelect(ds)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-xs font-mono border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#16191C] text-white border-[#16191C]'
                      : 'bg-[#FAF9F6] text-[#16191C] border-[#DDD8D3] hover:border-[#16191C]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-semibold max-w-[160px] truncate">{ds.filename}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 font-bold uppercase border ${
                      ds.status === 'VALID'
                        ? 'text-[#2F6E5C] border-[#2F6E5C]/40 bg-[#2F6E5C]/10'
                        : 'text-[#B8791A] border-[#B8791A]/40 bg-[#B8791A]/10'
                    }`}
                  >
                    {ds.status}
                  </span>

                  <button
                    onClick={e => handleDeleteDataset(ds.dataset_id, e)}
                    className="ml-1 p-0.5 hover:text-[#A6362A] transition-colors"
                    title="Delete dataset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDataset ? (
        <div className="space-y-6">
          <DatasetSummaryCard metadata={selectedDataset} />
          <DataQualityCard quality={selectedDataset.quality} />
          <DatasetProfileTable columnsProfile={selectedDataset.columns_profile} />
          <DatasetTable previewData={previewData} isLoading={isLoadingPreview} />
        </div>
      ) : (
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-10 text-center space-y-4">
          <Database className="w-10 h-10 text-[#16191C] mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-[#16191C]">
              No active dataset loaded
            </h3>
            <p className="text-xs text-[#5A594F] mt-1 font-mono max-w-md mx-auto">
              Upload custom turbofan telemetry log files or load NASA's official benchmark dataset.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={async () => {
                try {
                  const sampleMeta = await loadSampleDataset();
                  handleUploadSuccess(sampleMeta);
                } catch (err) {
                  alert('Failed to load sample dataset.');
                }
              }}
              className="px-4 py-2 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm border border-[#16191C] transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Load NASA C-MAPSS FD001 Dataset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
