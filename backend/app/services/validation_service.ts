import { ParseResult } from './parser_service';
import { DataQualityReport } from '../../../src/types';

export interface ValidationOutput {
  status: 'VALID' | 'WARNING' | 'INVALID';
  quality: DataQualityReport;
  summary: {
    rows: number;
    columns: number;
    engines: number;
    sensors: number;
    min_cycle: number;
    max_cycle: number;
  };
}

export function validateDataset(parseResult: ParseResult): ValidationOutput {
  const { rows, columns, engineColName, cycleColName, sensorColNames, format, error } = parseResult;

  if (error || rows.length === 0) {
    return {
      status: 'INVALID',
      quality: {
        missing_values: 0,
        duplicate_rows: 0,
        invalid_values: 0,
        nan_values: 0,
        infinite_values: 0,
        numeric_sensors_status: 'Invalid - Data structure parse error',
        is_sensors_valid: false,
        issues: [error || 'Dataset contains 0 readable rows.']
      },
      summary: {
        rows: 0,
        columns: columns.length,
        engines: 0,
        sensors: sensorColNames.length,
        min_cycle: 0,
        max_cycle: 0
      }
    };
  }

  let missingValues = 0;
  let invalidValues = 0;
  let nanValues = 0;
  let infiniteValues = 0;
  const issues: string[] = [];

  const engineSet = new Set<number | string>();
  let minCycle = Infinity;
  let maxCycle = -Infinity;

  const seenEngineCycle = new Set<string>();
  let duplicateRows = 0;

  let nonNumericSensorsCount = 0;

  rows.forEach((row, rowIndex) => {
    // Check Engine ID
    if (engineColName && row[engineColName] !== undefined && row[engineColName] !== null) {
      const engVal = row[engineColName];
      engineSet.add(String(engVal));
      if (typeof engVal === 'number' && (engVal <= 0 || !Number.isInteger(engVal))) {
        invalidValues++;
      }
    } else if (engineColName) {
      missingValues++;
    }

    // Check Cycle
    if (cycleColName && row[cycleColName] !== undefined && row[cycleColName] !== null) {
      const cycVal = row[cycleColName];
      if (typeof cycVal === 'number') {
        if (cycVal < minCycle) minCycle = cycVal;
        if (cycVal > maxCycle) maxCycle = cycVal;
        if (cycVal <= 0 || !Number.isInteger(cycVal)) {
          invalidValues++;
        }
      } else {
        invalidValues++;
      }

      // Check duplicates
      if (engineColName && row[engineColName] !== undefined) {
        const key = `${row[engineColName]}_${cycVal}`;
        if (seenEngineCycle.has(key)) {
          duplicateRows++;
        } else {
          seenEngineCycle.add(key);
        }
      }
    }

    // Check all fields for NaN, Infinite, Missing
    columns.forEach(col => {
      const val = row[col];
      if (val === null || val === undefined || val === '') {
        missingValues++;
      } else if (typeof val === 'number') {
        if (Number.isNaN(val)) {
          nanValues++;
        } else if (!Number.isFinite(val)) {
          infiniteValues++;
        }
      } else if (typeof val === 'string') {
        // If sensor column contains non-numeric string
        if (sensorColNames.includes(col)) {
          nonNumericSensorsCount++;
        }
      }
    });
  });

  if (minCycle === Infinity) minCycle = 0;
  if (maxCycle === -Infinity) maxCycle = 0;

  if (duplicateRows > 0) {
    issues.push(`Detected ${duplicateRows} duplicate engine cycle records.`);
  }
  if (missingValues > 0) {
    issues.push(`Found ${missingValues} missing or blank fields.`);
  }
  if (invalidValues > 0) {
    issues.push(`Found ${invalidValues} invalid non-positive or non-integer engine/cycle values.`);
  }
  if (nanValues > 0) {
    issues.push(`Found ${nanValues} NaN numerical values.`);
  }
  if (infiniteValues > 0) {
    issues.push(`Found ${infiniteValues} Infinite numerical values.`);
  }
  if (nonNumericSensorsCount > 0) {
    issues.push(`Detected ${nonNumericSensorsCount} non-numeric values in sensor measurements.`);
  }

  const isSensorsValid = nonNumericSensorsCount === 0 && nanValues === 0 && infiniteValues === 0;
  const sensorStatus = isSensorsValid
    ? `Valid (${sensorColNames.length} sensor features)`
    : `Warning (${nonNumericSensorsCount} non-numeric entries)`;

  let status: 'VALID' | 'WARNING' | 'INVALID' = 'VALID';

  if (rows.length < 1 || (engineColName && engineSet.size === 0)) {
    status = 'INVALID';
  } else if (issues.length > 0 || format === 'UNKNOWN') {
    status = 'WARNING';
  }

  return {
    status,
    quality: {
      missing_values: missingValues,
      duplicate_rows: duplicateRows,
      invalid_values: invalidValues,
      nan_values: nanValues,
      infinite_values: infiniteValues,
      numeric_sensors_status: sensorStatus,
      is_sensors_valid: isSensorsValid,
      issues
    },
    summary: {
      rows: rows.length,
      columns: columns.length,
      engines: engineSet.size,
      sensors: sensorColNames.length,
      min_cycle: minCycle,
      max_cycle: maxCycle
    }
  };
}
