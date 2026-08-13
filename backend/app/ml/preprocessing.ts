import { ParsedRow } from '../services/parser_service';
import { SensorStats, CorrelationMatrixResponse } from '../../../src/types';

/**
 * Validates numeric cleanliness of data rows.
 */
export function cleanRows(rows: ParsedRow[]): ParsedRow[] {
  return rows.filter(row => {
    const engId = Number(row['engine_id']);
    const cycle = Number(row['cycle']);
    return !isNaN(engId) && !isNaN(cycle) && engId > 0 && cycle > 0;
  });
}

/**
 * Calculates statistical distribution metrics for each sensor column across actual dataset rows.
 */
export function computeSensorStatistics(rows: ParsedRow[], sensorCols: string[]): SensorStats[] {
  const statsList: SensorStats[] = [];

  for (const sensor of sensorCols) {
    let sum = 0;
    let count = 0;
    let missingCount = 0;
    let min = Infinity;
    let max = -Infinity;
    const uniqueVals = new Set<number>();
    const validVals: number[] = [];

    for (const row of rows) {
      const val = row[sensor];
      if (val === null || val === undefined || val === '') {
        missingCount++;
      } else {
        const num = Number(val);
        if (isNaN(num)) {
          missingCount++;
        } else {
          sum += num;
          count++;
          validVals.push(num);
          uniqueVals.add(num);
          if (num < min) min = num;
          if (num > max) max = num;
        }
      }
    }

    if (count === 0) {
      statsList.push({
        sensor,
        mean: 0,
        std: 0,
        min: 0,
        max: 0,
        missing_count: rows.length,
        unique_count: 0
      });
      continue;
    }

    const mean = sum / count;
    const variance = validVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
    const std = Math.sqrt(variance);

    statsList.push({
      sensor,
      mean: Number(mean.toFixed(4)),
      std: Number(std.toFixed(4)),
      min: Number((min === Infinity ? 0 : min).toFixed(4)),
      max: Number((max === -Infinity ? 0 : max).toFixed(4)),
      missing_count: missingCount,
      unique_count: uniqueVals.size
    });
  }

  return statsList;
}

/**
 * Calculates actual Pearson correlation matrix between sensor features in dataset.
 */
export function computeCorrelationMatrix(rows: ParsedRow[], sensorCols: string[]): CorrelationMatrixResponse {
  // Filter sensor cols to those with >0 std dev
  const activeSensors: string[] = [];
  const sensorValues: Record<string, number[]> = {};

  for (const sensor of sensorCols) {
    const vals: number[] = [];
    for (const r of rows) {
      const v = Number(r[sensor]);
      if (!isNaN(v)) vals.push(v);
    }
    if (vals.length === rows.length) {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length);
      if (std > 1e-6) {
        activeSensors.push(sensor);
        sensorValues[sensor] = vals;
      }
    }
  }

  const nSensors = activeSensors.length;
  const matrix: number[][] = Array.from({ length: nSensors }, () => Array(nSensors).fill(0));

  for (let i = 0; i < nSensors; i++) {
    const s1 = activeSensors[i];
    const v1 = sensorValues[s1];
    const m1 = v1.reduce((a, b) => a + b, 0) / v1.length;
    const std1 = Math.sqrt(v1.reduce((a, b) => a + Math.pow(b - m1, 2), 0) / v1.length);

    matrix[i][i] = 1.0;

    for (let j = i + 1; j < nSensors; j++) {
      const s2 = activeSensors[j];
      const v2 = sensorValues[s2];
      const m2 = v2.reduce((a, b) => a + b, 0) / v2.length;
      const std2 = Math.sqrt(v2.reduce((a, b) => a + Math.pow(b - m2, 2), 0) / v2.length);

      let cov = 0;
      for (let k = 0; k < v1.length; k++) {
        cov += (v1[k] - m1) * (v2[k] - m2);
      }
      cov = cov / v1.length;

      const corr = std1 > 0 && std2 > 0 ? cov / (std1 * std2) : 0;
      const roundedCorr = Number(Math.max(-1, Math.min(1, corr)).toFixed(4));

      matrix[i][j] = roundedCorr;
      matrix[j][i] = roundedCorr;
    }
  }

  return {
    sensors: activeSensors,
    matrix
  };
}
