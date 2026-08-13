import { ParsedRow } from '../services/parser_service';

export interface ScalerParams {
  featureNames: string[];
  means: number[];
  stds: number[];
}

export interface FeatureMatrix {
  engineIds: number[];
  cycles: number[];
  featureNames: string[];
  X: number[][]; // Row-wise 2D array [sample_idx][feature_idx]
  y: number[];   // Target RUL vector
}

/**
 * Engineers predictive features without data leakage (backward-looking rolling window W=5).
 */
export function engineerFeatures(
  rows: ParsedRow[],
  targetCol: string = 'rul',
  windowSize: number = 5
): {
  engineIds: number[];
  cycles: number[];
  featureNames: string[];
  X: number[][];
  y: number[];
} {
  if (!rows || rows.length === 0) {
    return { engineIds: [], cycles: [], featureNames: [], X: [], y: [] };
  }

  // Group rows by engine_id sorted by cycle
  const engineMap = new Map<number, ParsedRow[]>();
  for (const row of rows) {
    const engId = Number(row['engine_id']);
    if (isNaN(engId)) continue;
    if (!engineMap.has(engId)) {
      engineMap.set(engId, []);
    }
    engineMap.get(engId)!.push(row);
  }

  // Sort each engine's rows by cycle ascending
  for (const [engId, eRows] of engineMap.entries()) {
    eRows.sort((a, b) => Number(a['cycle']) - Number(b['cycle']));
  }

  // Identify non-constant numerical candidate features (settings & sensors)
  const candidateCols: string[] = [];
  const sampleRow = rows[0];
  for (const key of Object.keys(sampleRow)) {
    if (key === 'engine_id' || key === 'cycle' || key === 'rul') continue;
    if (typeof sampleRow[key] === 'number') {
      candidateCols.push(key);
    }
  }

  // Determine variance for each candidate col to exclude zero-variance flat sensors
  const activeCols: string[] = [];
  for (const col of candidateCols) {
    const vals = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
    if (vals.length > 0) {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length);
      if (std > 1e-5) {
        activeCols.push(col);
      }
    }
  }

  // Build feature names list:
  // For each active col: raw, rolling_mean, rolling_std
  const featureNames: string[] = [];
  for (const col of activeCols) {
    featureNames.push(`${col}_raw`);
    featureNames.push(`${col}_roll_mean`);
    featureNames.push(`${col}_roll_std`);
  }

  const engineIds: number[] = [];
  const cycles: number[] = [];
  const X: number[][] = [];
  const y: number[] = [];

  // Iterate engine by engine
  for (const [engId, eRows] of engineMap.entries()) {
    for (let i = 0; i < eRows.length; i++) {
      const currentRow = eRows[i];
      const cycle = Number(currentRow['cycle']);
      const targetRul = currentRow[targetCol] !== undefined && currentRow[targetCol] !== null ? Number(currentRow[targetCol]) : 0;

      const featureRow: number[] = [];

      // Compute backward-looking window [startIdx ... i]
      const startIdx = Math.max(0, i - windowSize + 1);
      const windowRows = eRows.slice(startIdx, i + 1);

      for (const col of activeCols) {
        const currentVal = Number(currentRow[col]) || 0;
        const windowVals = windowRows.map(r => Number(r[col]) || 0);

        // Raw
        featureRow.push(currentVal);

        // Rolling mean over past cycles
        const mean = windowVals.reduce((a, b) => a + b, 0) / windowVals.length;
        featureRow.push(mean);

        // Rolling std over past cycles
        const variance = windowVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / windowVals.length;
        const std = Math.sqrt(variance);
        featureRow.push(std);
      }

      engineIds.push(engId);
      cycles.push(cycle);
      X.push(featureRow);
      y.push(isNaN(targetRul) ? 0 : targetRul);
    }
  }

  return { engineIds, cycles, featureNames, X, y };
}

/**
 * Fits a StandardScaler on feature matrix X.
 */
export function fitScaler(X: number[][], featureNames: string[]): ScalerParams {
  if (!X || X.length === 0 || X[0].length === 0) {
    return { featureNames: [], means: [], stds: [] };
  }

  const numFeatures = X[0].length;
  const numSamples = X.length;

  const means: number[] = Array(numFeatures).fill(0);
  const stds: number[] = Array(numFeatures).fill(1);

  for (let j = 0; j < numFeatures; j++) {
    let sum = 0;
    for (let i = 0; i < numSamples; i++) {
      sum += X[i][j];
    }
    const mean = sum / numSamples;
    means[j] = mean;

    let varSum = 0;
    for (let i = 0; i < numSamples; i++) {
      varSum += Math.pow(X[i][j] - mean, 2);
    }
    const std = Math.sqrt(varSum / numSamples);
    stds[j] = std < 1e-8 ? 1.0 : std; // Prevent divide by zero for constant features
  }

  return { featureNames, means, stds };
}

/**
 * Transforms feature matrix X using pre-calculated ScalerParams.
 */
export function transformScaler(X: number[][], scaler: ScalerParams): number[][] {
  if (!X || X.length === 0) return [];

  const transformed: number[][] = [];
  const numFeatures = scaler.featureNames.length;

  for (let i = 0; i < X.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < numFeatures; j++) {
      const rawVal = X[i][j] !== undefined ? X[i][j] : 0;
      const mean = scaler.means[j] || 0;
      const std = scaler.stds[j] || 1;
      row.push((rawVal - mean) / std);
    }
    transformed.push(row);
  }

  return transformed;
}
