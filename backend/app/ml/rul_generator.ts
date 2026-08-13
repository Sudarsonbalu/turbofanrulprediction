import { ParsedRow } from '../services/parser_service';

export interface RowWithRUL extends ParsedRow {
  engine_id: number;
  cycle: number;
  rul: number;
}

/**
 * Calculates Target RUL (Remaining Useful Life) for training turbofan datasets.
 * RUL = max_cycle(engine_id) - current_cycle
 * Computed dynamically from actual dataset rows.
 */
export function generateTrainingRUL(rows: ParsedRow[]): RowWithRUL[] {
  if (!rows || rows.length === 0) return [];

  // Group max cycle by engine_id
  const maxCyclesByEngine = new Map<number, number>();

  for (const row of rows) {
    const engId = Number(row['engine_id']);
    const cycle = Number(row['cycle']);
    if (!isNaN(engId) && !isNaN(cycle)) {
      const currentMax = maxCyclesByEngine.get(engId) || 0;
      if (cycle > currentMax) {
        maxCyclesByEngine.set(engId, cycle);
      }
    }
  }

  // Generate rows with dynamic RUL
  const result: RowWithRUL[] = [];

  for (const row of rows) {
    const engId = Number(row['engine_id']);
    const cycle = Number(row['cycle']);
    if (!isNaN(engId) && !isNaN(cycle)) {
      const maxCycle = maxCyclesByEngine.get(engId) || cycle;
      const rul = Math.max(0, maxCycle - cycle);
      result.push({
        ...row,
        engine_id: engId,
        cycle: cycle,
        rul: rul
      });
    }
  }

  return result;
}

/**
 * Extracts last observed cycle for each engine in test dataset.
 */
export function extractTestLastCycles(rows: ParsedRow[]): Map<number, { last_cycle: number; last_row: ParsedRow }> {
  const engineMap = new Map<number, { last_cycle: number; last_row: ParsedRow }>();

  for (const row of rows) {
    const engId = Number(row['engine_id']);
    const cycle = Number(row['cycle']);
    if (!isNaN(engId) && !isNaN(cycle)) {
      const existing = engineMap.get(engId);
      if (!existing || cycle > existing.last_cycle) {
        engineMap.set(engId, { last_cycle: cycle, last_row: row });
      }
    }
  }

  return engineMap;
}
