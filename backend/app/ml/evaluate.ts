import { ModelMetrics } from '../../../src/types';

/**
 * Calculates MAE, RMSE, and R^2 evaluation metrics.
 */
export function calculateMetrics(
  yTrue: number[],
  yPred: number[],
  trainingTimeMs: number = 0
): ModelMetrics {
  const N = yTrue.length;

  if (N === 0) {
    return { mae: 0, rmse: 0, r2: 0, training_time_ms: trainingTimeMs };
  }

  let absErrorSum = 0;
  let sqErrorSum = 0;
  let ySum = 0;

  for (let i = 0; i < N; i++) {
    const actual = yTrue[i];
    const pred = yPred[i];
    const diff = pred - actual;
    absErrorSum += Math.abs(diff);
    sqErrorSum += diff * diff;
    ySum += actual;
  }

  const mae = absErrorSum / N;
  const rmse = Math.sqrt(sqErrorSum / N);

  const yMean = ySum / N;
  let totalVarSum = 0;
  for (let i = 0; i < N; i++) {
    totalVarSum += Math.pow(yTrue[i] - yMean, 2);
  }

  const r2 = totalVarSum > 1e-6 ? 1 - sqErrorSum / totalVarSum : 0;

  return {
    mae: Number(mae.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
    r2: Number(Math.max(-1, Math.min(1, r2)).toFixed(4)),
    training_time_ms: trainingTimeMs
  };
}
