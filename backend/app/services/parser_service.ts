export interface ParsedRow {
  [key: string]: string | number | null;
}

export interface ParseResult {
  format: 'NASA_CMAPSS' | 'CSV' | 'NASA_CMAPSS_RUL' | 'UNKNOWN';
  columns: string[];
  rows: ParsedRow[];
  engineColName: string | null;
  cycleColName: string | null;
  sensorColNames: string[];
  settingColNames: string[];
  error?: string;
}

export const CMAPSS_COLUMNS = [
  'engine_id',
  'cycle',
  'setting_1',
  'setting_2',
  'setting_3',
  'sensor_1',
  'sensor_2',
  'sensor_3',
  'sensor_4',
  'sensor_5',
  'sensor_6',
  'sensor_7',
  'sensor_8',
  'sensor_9',
  'sensor_10',
  'sensor_11',
  'sensor_12',
  'sensor_13',
  'sensor_14',
  'sensor_15',
  'sensor_16',
  'sensor_17',
  'sensor_18',
  'sensor_19',
  'sensor_20',
  'sensor_21'
];

/**
 * Parses raw file content into normalized tabular rows.
 */
export function parseDatasetFile(fileBuffer: Buffer | string, filename: string): ParseResult {
  let content = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf-8');

  // Strip UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  content = content.replace(/^\uFEFF/, '');

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      format: 'UNKNOWN',
      columns: [],
      rows: [],
      engineColName: null,
      cycleColName: null,
      sensorColNames: [],
      settingColNames: [],
      error: 'File is empty or contains no valid rows.'
    };
  }

  const isCsv = filename.toLowerCase().endsWith('.csv') || (lines[0].includes(',') && !lines[0].includes('\t'));

  if (isCsv) {
    return parseCsvContent(lines);
  } else {
    return parseTxtContent(lines, filename);
  }
}

function parseCsvContent(lines: string[]): ParseResult {
  const headerLine = lines[0];
  const headerTokens = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  if (headerTokens.length < 2) {
    return {
      format: 'CSV',
      columns: headerTokens,
      rows: [],
      engineColName: null,
      cycleColName: null,
      sensorColNames: [],
      settingColNames: [],
      error: 'CSV file must have at least 2 header columns.'
    };
  }

  // Identify Engine column
  const engineColCandidates = ['engine_id', 'engine', 'unit', 'unit_id', 'id', 'unit_number', 'unit_nr', 'engine_number', 'eng_id', 'eng'];
  let engineColName: string | null = null;
  for (const col of headerTokens) {
    const colLower = col.toLowerCase();
    if (engineColCandidates.some(cand => colLower === cand || colLower.includes('engine') || colLower === 'unit')) {
      engineColName = col;
      break;
    }
  }

  // Identify Cycle column
  const cycleColCandidates = ['cycle', 'operating_cycle', 'time', 'time_in_cycles', 'cycles', 'step', 'time_cycle', 'time_in_cycle', 't', 'cyc'];
  let cycleColName: string | null = null;
  for (const col of headerTokens) {
    const colLower = col.toLowerCase();
    if (cycleColCandidates.some(cand => colLower === cand || colLower.includes('cycle'))) {
      cycleColName = col;
      break;
    }
  }

  // Fallback: If candidates aren't named explicitly, assign column 0 as engine and column 1 as cycle
  if (!engineColName) engineColName = headerTokens[0];
  if (!cycleColName) cycleColName = headerTokens[1] || headerTokens[0];

  const sensorColNames: string[] = [];
  const settingColNames: string[] = [];

  for (const col of headerTokens) {
    if (col === engineColName || col === cycleColName) continue;
    const lower = col.toLowerCase();
    if (lower.includes('setting') || lower.includes('op_cond') || lower.includes('opsetting')) {
      settingColNames.push(col);
    } else {
      sensorColNames.push(col);
    }
  }

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length < headerTokens.length) continue;

    const rowObj: ParsedRow = {};
    for (let c = 0; c < headerTokens.length; c++) {
      const rawVal = values[c];
      const numVal = Number(rawVal);
      rowObj[headerTokens[c]] = rawVal === '' || rawVal === undefined ? null : (isNaN(numVal) ? rawVal : numVal);
    }
    rows.push(rowObj);
  }

  return {
    format: 'CSV',
    columns: headerTokens,
    rows,
    engineColName,
    cycleColName,
    sensorColNames,
    settingColNames
  };
}

function parseTxtContent(lines: string[], filename: string): ParseResult {
  const isRulFile = filename.toLowerCase().startsWith('rul_') || filename.toLowerCase().includes('rul');

  // Check line structure (splits space, tab, comma, semicolon)
  const sampleLineTokens = lines[0].trim().split(/[\s,\t;]+/);

  if (isRulFile || sampleLineTokens.length === 1) {
    // NASA C-MAPSS RUL File (Contains single ground truth RUL value per engine or engine_id + RUL)
    const rows: ParsedRow[] = [];
    const isSingleVal = sampleLineTokens.length === 1;
    const columns = ['engine_id', 'rul'];

    lines.forEach((line, index) => {
      const tokens = line.trim().split(/[\s,\t;]+/);
      if (tokens.length === 0 || !tokens[0]) return;
      if (isSingleVal) {
        const rul = Number(tokens[0]);
        rows.push({
          engine_id: index + 1,
          rul: isNaN(rul) ? null : rul
        });
      } else {
        const engId = Number(tokens[0]);
        const rul = Number(tokens[1]);
        rows.push({
          engine_id: isNaN(engId) ? index + 1 : engId,
          rul: isNaN(rul) ? null : rul
        });
      }
    });

    return {
      format: 'NASA_CMAPSS_RUL',
      columns,
      rows,
      engineColName: 'engine_id',
      cycleColName: null,
      sensorColNames: [],
      settingColNames: []
    };
  }

  // Standard C-MAPSS dataset file (26 columns: engine_id, cycle, 3 settings, 21 sensors)
  const columns = CMAPSS_COLUMNS;
  const rows: ParsedRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const tokens = lines[i].trim().split(/[\s,\t;]+/);
    if (tokens.length < 2) continue; // Skip malformed lines

    const rowObj: ParsedRow = {};
    for (let c = 0; c < CMAPSS_COLUMNS.length; c++) {
      const colName = CMAPSS_COLUMNS[c];
      if (c < tokens.length) {
        const rawVal = tokens[c];
        const numVal = Number(rawVal);
        rowObj[colName] = isNaN(numVal) ? rawVal : numVal;
      } else {
        rowObj[colName] = null;
      }
    }
    rows.push(rowObj);
  }

  const sensorColNames = CMAPSS_COLUMNS.slice(5);
  const settingColNames = CMAPSS_COLUMNS.slice(2, 5);

  return {
    format: 'NASA_CMAPSS',
    columns,
    rows,
    engineColName: 'engine_id',
    cycleColName: 'cycle',
    sensorColNames,
    settingColNames
  };
}
