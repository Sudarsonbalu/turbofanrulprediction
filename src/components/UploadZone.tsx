import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2, Database } from 'lucide-react';
import { DatasetMetadata } from '../types';
import { uploadDatasetFile, loadSampleDataset } from '../services/datasetApi';

interface UploadZoneProps {
  onUploadSuccess: (dataset: DatasetMetadata) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadSample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingSample(true);
    setErrorMessage(null);
    try {
      const sampleMeta = await loadSampleDataset();
      onUploadSuccess(sampleMeta);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load benchmark NASA dataset.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.txt', '.csv'];
    const fileNameLower = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Unsupported file format. Upload space-separated .txt or .csv files.');
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('Selected file is empty (0 bytes).');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const metadata = await uploadDatasetFile(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess(metadata);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Upload failed. Check file format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4 font-sans">
      <div>
        <h2 className="text-base font-semibold text-[#16191C]">
          Dataset Ingestion Workspace
        </h2>
        <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
          Upload and validate raw engine telemetry datasets before running predictive algorithms.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 border border-[#A6362A]/40 bg-[#A6362A]/10 text-xs text-[#A6362A] flex items-start gap-2.5 rounded-sm font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">INGESTION ERROR</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-[#16191C] bg-[#FAF9F6]'
              : 'border-[#DDD8D3] hover:border-[#16191C] bg-[#FAF9F6]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-sm bg-white border border-[#DDD8D3] flex items-center justify-center mx-auto mb-3 text-[#16191C]">
            <Upload className="w-5 h-5" />
          </div>

          <p className="text-sm font-semibold text-[#16191C]">
            Drag & drop dataset file here
          </p>
          <p className="text-xs text-[#5A594F] mt-1 font-mono">
            or <span className="text-[#16191C] underline font-semibold">browse files</span> from your computer
          </p>

          <div className="mt-4 pt-3 border-t border-[#DDD8D3] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5A594F]">
            <div className="flex items-center gap-2">
              <span>SUPPORTED:</span>
              <span className="px-1.5 py-0.5 border border-[#DDD8D3] bg-white text-[#16191C] font-semibold">
                CSV
              </span>
              <span className="px-1.5 py-0.5 border border-[#DDD8D3] bg-white text-[#16191C] font-semibold">
                NASA C-MAPSS TXT
              </span>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="px-3 py-1 bg-[#16191C] text-white hover:bg-[#2C3136] border border-[#16191C] font-mono text-[11px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer rounded-sm"
              title="Load benchmark 100-engine dataset"
            >
              {isLoadingSample ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                  <span>LOADING FD001...</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3" />
                  <span>LOAD NASA FD001 BENCHMARK</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-[#DDD8D3] rounded-sm p-4 bg-[#FAF9F6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-white border border-[#DDD8D3] text-[#16191C] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#16191C] font-mono">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-[#5A594F] mt-0.5">
                  <span>Size: {formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>Type: {selectedFile.name.endsWith('.txt') ? 'C-MAPSS Text' : 'CSV'}</span>
                </div>
              </div>
            </div>

            {!isUploading && (
              <button
                onClick={handleRemoveFile}
                className="p-1 text-[#5A594F] hover:text-[#16191C] hover:bg-white border border-transparent hover:border-[#DDD8D3] transition-colors"
                title="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-[#DDD8D3]">
            <button
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="px-3 py-1.5 text-xs font-sans font-medium text-[#16191C] hover:bg-white border border-transparent hover:border-[#DDD8D3] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={isUploading}
              className="px-4 py-1.5 text-xs font-sans font-medium bg-[#16191C] text-white hover:bg-[#2C3136] border border-[#16191C] transition-colors flex items-center gap-2 disabled:opacity-50 rounded-sm cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>UPLOADING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>UPLOAD & PARSE DATASET</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
