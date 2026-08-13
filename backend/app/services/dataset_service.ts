import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parseDatasetFile, ParsedRow } from './parser_service';
import { validateDataset } from './validation_service';
import { DatasetMetadata, ColumnProfile, DatasetPreviewResponse, DataQualityReport } from '../../../src/types';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function ensureUploadsDirExists() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function createSampleCmapssDataset(): DatasetMetadata {
  ensureUploadsDirExists();
  const lines: string[] = [];
  const numEngines = 100;

  let seed = 42;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  function gaussianNoise(std = 1) {
    const u1 = rnd() || 0.0001;
    const u2 = rnd() || 0.0001;
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * std;
  }

  for (let eng = 1; eng <= numEngines; eng++) {
    const maxCycles = 120 + Math.floor(rnd() * 220);
    for (let cyc = 1; cyc <= maxCycles; cyc++) {
      const deg = Math.pow(cyc / maxCycles, 2) * 100;

      const setting1 = (-0.0007 + gaussianNoise(0.0005)).toFixed(4);
      const setting2 = (0.0003 + gaussianNoise(0.0002)).toFixed(4);
      const setting3 = "100.0";

      const s1 = "518.67";
      const s2 = (642.0 + 0.035 * deg + gaussianNoise(0.2)).toFixed(2);
      const s3 = (1580.0 + 0.075 * deg + gaussianNoise(0.6)).toFixed(2);
      const s4 = (1400.0 + 0.11 * deg + gaussianNoise(0.8)).toFixed(2);
      const s5 = "14.62";
      const s6 = "21.61";
      const s7 = (553.0 - 0.045 * deg + gaussianNoise(0.25)).toFixed(2);
      const s8 = (2388.0 + 0.01 * deg + gaussianNoise(0.15)).toFixed(2);
      const s9 = (9050.0 + 0.03 * deg + gaussianNoise(1.2)).toFixed(2);
      const s10 = "1.30";
      const s11 = (47.20 + 0.012 * deg + gaussianNoise(0.08)).toFixed(2);
      const s12 = (521.0 - 0.032 * deg + gaussianNoise(0.2)).toFixed(2);
      const s13 = (2388.0 + 0.01 * deg + gaussianNoise(0.15)).toFixed(2);
      const s14 = (8130.0 + 0.025 * deg + gaussianNoise(0.8)).toFixed(2);
      const s15 = (8.40 + 0.0012 * deg + gaussianNoise(0.02)).toFixed(4);
      const s16 = "0.03";
      const s17 = (392 + Math.floor(deg / 20) + Math.floor(rnd() * 2)).toString();
      const s18 = "2388";
      const s19 = "100.00";
      const s20 = (38.80 - 0.012 * deg + gaussianNoise(0.05)).toFixed(2);
      const s21 = (23.30 - 0.008 * deg + gaussianNoise(0.04)).toFixed(4);

      const line = `${eng} ${cyc} ${setting1} ${setting2} ${setting3} ${s1} ${s2} ${s3} ${s4} ${s5} ${s6} ${s7} ${s8} ${s9} ${s10} ${s11} ${s12} ${s13} ${s14} ${s15} ${s16} ${s17} ${s18} ${s19} ${s20} ${s21}`;
      lines.push(line);
    }
  }

  const rawTxt = lines.join('\n');
  const fileBuffer = Buffer.from(rawTxt, 'utf-8');
  return saveUploadedDataset(fileBuffer, 'train_FD001.txt');
}

export function ensureSampleDatasetExists(): DatasetMetadata {
  const existing = listUploadedDatasets();
  if (existing.length > 0) {
    return existing[0];
  }
  return createSampleCmapssDataset();
}

export function saveUploadedDataset(fileBuffer: Buffer, originalFilename: string): DatasetMetadata {
  ensureUploadsDirExists();

  const datasetId = 'dataset_' + crypto.randomBytes(8).toString('hex');
  const datasetFolder = path.join(UPLOADS_DIR, datasetId);
  fs.mkdirSync(datasetFolder, { recursive: true });

  const parseResult = parseDatasetFile(fileBuffer, originalFilename);
  const validation = validateDataset(parseResult);

  // Generate column profiling details
  const columnsProfile: ColumnProfile[] = parseResult.columns.map(col => {
    let nonNullCount = 0;
    const uniqueVals = new Set<string>();
    let sum = 0;
    let numCount = 0;
    let minVal = Infinity;
    let maxVal = -Infinity;
    let isAllNumbers = true;
    let isAllInts = true;

    parseResult.rows.forEach(row => {
      const val = row[col];
      if (val !== null && val !== undefined && val !== '') {
        nonNullCount++;
        uniqueVals.add(String(val));
        if (typeof val === 'number') {
          sum += val;
          numCount++;
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
          if (!Number.isInteger(val)) isAllInts = false;
        } else {
          isAllNumbers = false;
          isAllInts = false;
        }
      }
    });

    let dataType: 'integer' | 'float' | 'string' | 'boolean' = 'string';
    if (isAllNumbers && numCount > 0) {
      dataType = isAllInts ? 'integer' : 'float';
    }

    return {
      column: col,
      data_type: dataType,
      non_null_count: nonNullCount,
      unique_count: uniqueVals.size,
      min_value: isAllNumbers && numCount > 0 && minVal !== Infinity ? minVal : undefined,
      max_value: isAllNumbers && numCount > 0 && maxVal !== -Infinity ? maxVal : undefined,
      mean_value: isAllNumbers && numCount > 0 ? Number((sum / numCount).toFixed(4)) : undefined
    };
  });

  const metadata: DatasetMetadata = {
    dataset_id: datasetId,
    filename: originalFilename,
    original_filename: originalFilename,
    file_size_bytes: fileBuffer.length,
    dataset_format: parseResult.format,
    status: validation.status,
    uploaded_at: new Date().toISOString(),
    summary: validation.summary,
    quality: validation.quality,
    column_names: parseResult.columns,
    columns_profile: columnsProfile
  };

  // Save original file, parsed_data.json, and metadata.json
  fs.writeFileSync(path.join(datasetFolder, 'original_file'), fileBuffer);
  fs.writeFileSync(path.join(datasetFolder, 'metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(datasetFolder, 'parsed_data.json'), JSON.stringify(parseResult.rows));

  return metadata;
}

export function listUploadedDatasets(): DatasetMetadata[] {
  ensureUploadsDirExists();
  if (!fs.existsSync(UPLOADS_DIR)) return [];

  const folders = fs.readdirSync(UPLOADS_DIR);
  const datasets: DatasetMetadata[] = [];

  for (const folder of folders) {
    if (folder.startsWith('dataset_')) {
      const metaPath = path.join(UPLOADS_DIR, folder, 'metadata.json');
      if (fs.existsSync(metaPath)) {
        try {
          const metaContent = fs.readFileSync(metaPath, 'utf-8');
          datasets.push(JSON.parse(metaContent));
        } catch (e) {
          console.error(`Failed to read metadata for ${folder}:`, e);
        }
      }
    }
  }

  // Sort newest first
  return datasets.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
}

export function getDatasetMetadata(datasetId: string): DatasetMetadata | null {
  const directPath = path.join(UPLOADS_DIR, datasetId, 'metadata.json');
  if (fs.existsSync(directPath)) {
    try {
      return JSON.parse(fs.readFileSync(directPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  const all = listUploadedDatasets();
  const match = all.find(d => d.dataset_id === datasetId || d.filename === datasetId);
  return match || null;
}

export function getDatasetFolder(datasetId: string): string | null {
  const meta = getDatasetMetadata(datasetId);
  if (!meta) return null;
  const folder = path.join(UPLOADS_DIR, meta.dataset_id);
  return fs.existsSync(folder) ? folder : null;
}

export function getDatasetPreview(datasetId: string, limit: number = 20): DatasetPreviewResponse | null {
  const meta = getDatasetMetadata(datasetId);
  if (!meta) return null;

  const folder = getDatasetFolder(datasetId);
  if (!folder) return null;

  const dataPath = path.join(folder, 'parsed_data.json');
  if (!fs.existsSync(dataPath)) return null;

  try {
    const rows: ParsedRow[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const previewRows = rows.slice(0, limit);

    return {
      dataset_id: meta.dataset_id,
      filename: meta.filename,
      total_rows: rows.length,
      preview_rows_count: previewRows.length,
      columns: meta.column_names,
      rows: previewRows
    };
  } catch {
    return null;
  }
}

export function getDatasetQuality(datasetId: string): DataQualityReport | null {
  const meta = getDatasetMetadata(datasetId);
  return meta ? meta.quality : null;
}

export function getDatasetColumnProfiles(datasetId: string): ColumnProfile[] | null {
  const meta = getDatasetMetadata(datasetId);
  return meta ? meta.columns_profile : null;
}

export function deleteDataset(datasetId: string): boolean {
  const datasetFolder = path.join(UPLOADS_DIR, datasetId);
  if (fs.existsSync(datasetFolder)) {
    fs.rmSync(datasetFolder, { recursive: true, force: true });
    return true;
  }
  return false;
}
