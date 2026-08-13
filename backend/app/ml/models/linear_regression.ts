/**
 * Ridge Linear Regression Model (Baseline RUL Regressor)
 * Solves w = (X^T X + lambda * I)^(-1) X^T y using regularized normal equation or gradient descent.
 */

export interface LinearRegressionModel {
  type: 'LinearRegression';
  weights: number[];
  bias: number;
  lambda: number;
  featureNames: string[];
}

export function trainLinearRegression(
  X: number[][],
  y: number[],
  featureNames: string[],
  lambda: number = 0.1,
  maxEpochs: number = 200,
  lr: number = 0.05
): { model: LinearRegressionModel; trainingTimeMs: number } {
  const startTime = Date.now();
  const N = X.length;
  const P = X[0].length;

  if (N === 0 || P === 0) {
    return {
      model: { type: 'LinearRegression', weights: [], bias: 0, lambda, featureNames },
      trainingTimeMs: 0
    };
  }

  // Gradient Descent with Momentum & Ridge L2 Regularization
  const weights: number[] = Array(P).fill(0);
  let bias = y.reduce((a, b) => a + b, 0) / N;

  const velocityW: number[] = Array(P).fill(0);
  let velocityB = 0;
  const momentum = 0.85;

  let currentLr = lr;

  for (let epoch = 0; epoch < maxEpochs; epoch++) {
    const gradW: number[] = Array(P).fill(0);
    let gradB = 0;

    for (let i = 0; i < N; i++) {
      let pred = bias;
      for (let j = 0; j < P; j++) {
        pred += X[i][j] * weights[j];
      }
      const err = pred - y[i];
      gradB += err;
      for (let j = 0; j < P; j++) {
        gradW[j] += err * X[i][j];
      }
    }

    gradB /= N;
    for (let j = 0; j < P; j++) {
      gradW[j] = (gradW[j] / N) + (lambda * weights[j]) / N;
    }

    // Update with momentum
    velocityB = momentum * velocityB + currentLr * gradB;
    bias -= velocityB;

    for (let j = 0; j < P; j++) {
      velocityW[j] = momentum * velocityW[j] + currentLr * gradW[j];
      weights[j] -= velocityW[j];
    }

    // Decay learning rate gradually
    if ((epoch + 1) % 50 === 0) {
      currentLr *= 0.7;
    }
  }

  const trainingTimeMs = Math.max(1, Date.now() - startTime);

  return {
    model: {
      type: 'LinearRegression',
      weights,
      bias,
      lambda,
      featureNames
    },
    trainingTimeMs
  };
}

export function predictLinearRegression(model: LinearRegressionModel, X: number[][]): number[] {
  const N = X.length;
  const P = model.weights.length;
  const predictions: number[] = [];

  for (let i = 0; i < N; i++) {
    let pred = model.bias;
    for (let j = 0; j < P; j++) {
      const val = X[i][j] !== undefined ? X[i][j] : 0;
      pred += val * model.weights[j];
    }
    // RUL cannot be negative
    predictions.push(Math.max(0, pred));
  }

  return predictions;
}
