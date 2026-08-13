/**
 * Random Forest Regression Model for RUL Prediction
 * Ensembles multiple decision trees trained on bootstrap samples with feature subsampling.
 */

export interface TreeNode {
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number;
  gain?: number;
  samples?: number;
}

export interface RandomForestModel {
  type: 'RandomForest';
  trees: TreeNode[];
  featureNames: string[];
  nEstimators: number;
  maxDepth: number;
  minSamplesSplit: number;
  featureImportances: { feature: string; importance: number }[];
}

export function trainRandomForest(
  X: number[][],
  y: number[],
  featureNames: string[],
  nEstimators: number = 15,
  maxDepth: number = 8,
  minSamplesSplit: number = 5
): { model: RandomForestModel; trainingTimeMs: number } {
  const startTime = Date.now();
  const N = X.length;
  const P = X[0].length;

  if (N === 0 || P === 0) {
    return {
      model: {
        type: 'RandomForest',
        trees: [],
        featureNames,
        nEstimators,
        maxDepth,
        minSamplesSplit,
        featureImportances: featureNames.map(f => ({ feature: f, importance: 0 }))
      },
      trainingTimeMs: 0
    };
  }

  const featureImportanceSums: number[] = Array(P).fill(0);
  const trees: TreeNode[] = [];

  // Number of features to sample at each split k = sqrt(P)
  const kFeatures = Math.max(1, Math.floor(Math.sqrt(P)));

  for (let t = 0; t < nEstimators; t++) {
    // Bootstrap sampling with replacement
    const bootstrapIndices: number[] = [];
    for (let i = 0; i < N; i++) {
      bootstrapIndices.push(Math.floor(Math.random() * N));
    }

    const tree = buildTree(
      X,
      y,
      bootstrapIndices,
      0,
      maxDepth,
      minSamplesSplit,
      kFeatures,
      featureImportanceSums
    );
    trees.push(tree);
  }

  // Calculate normalized feature importances
  const totalGain = featureImportanceSums.reduce((a, b) => a + b, 0);
  const featureImportances = featureNames.map((name, idx) => ({
    feature: name,
    importance: totalGain > 0 ? Number((featureImportanceSums[idx] / totalGain).toFixed(4)) : Number((1 / P).toFixed(4))
  }));

  // Sort by importance descending
  featureImportances.sort((a, b) => b.importance - a.importance);

  const trainingTimeMs = Math.max(1, Date.now() - startTime);

  return {
    model: {
      type: 'RandomForest',
      trees,
      featureNames,
      nEstimators,
      maxDepth,
      minSamplesSplit,
      featureImportances
    },
    trainingTimeMs
  };
}

function buildTree(
  X: number[][],
  y: number[],
  indices: number[],
  currentDepth: number,
  maxDepth: number,
  minSamplesSplit: number,
  kFeatures: number,
  importanceSums: number[]
): TreeNode {
  const n = indices.length;

  // Calculate node mean
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumY += y[indices[i]];
  }
  const meanY = sumY / n;

  // Stopping conditions
  if (currentDepth >= maxDepth || n < minSamplesSplit) {
    return { value: meanY, samples: n };
  }

  // Calculate node variance
  let varSum = 0;
  for (let i = 0; i < n; i++) {
    varSum += Math.pow(y[indices[i]] - meanY, 2);
  }
  const parentMSE = varSum / n;

  if (parentMSE < 1e-6) {
    return { value: meanY, samples: n };
  }

  // Randomly select kFeatures candidate features
  const P = X[0].length;
  const candidateFeatures: number[] = [];
  while (candidateFeatures.length < kFeatures) {
    const randIdx = Math.floor(Math.random() * P);
    if (!candidateFeatures.includes(randIdx)) {
      candidateFeatures.push(randIdx);
    }
  }

  let bestFeatureIdx = -1;
  let bestThreshold = 0;
  let bestGain = -1;
  let bestLeftIndices: number[] = [];
  let bestRightIndices: number[] = [];

  // Find best split
  for (const featIdx of candidateFeatures) {
    // Sort values for candidate threshold evaluation
    const sortedIdxs = [...indices].sort((a, b) => X[a][featIdx] - X[b][featIdx]);

    // Sample up to 10 split thresholds along percentile values
    const step = Math.max(1, Math.floor(n / 10));
    for (let s = step; s < n; s += step) {
      const threshold = X[sortedIdxs[s]][featIdx];

      const leftIdxs: number[] = [];
      const rightIdxs: number[] = [];
      let leftSum = 0;
      let rightSum = 0;

      for (let i = 0; i < n; i++) {
        const idx = indices[i];
        if (X[idx][featIdx] <= threshold) {
          leftIdxs.push(idx);
          leftSum += y[idx];
        } else {
          rightIdxs.push(idx);
          rightSum += y[idx];
        }
      }

      if (leftIdxs.length === 0 || rightIdxs.length === 0) continue;

      const leftMean = leftSum / leftIdxs.length;
      const rightMean = rightSum / rightIdxs.length;

      let leftVar = 0;
      for (const idx of leftIdxs) {
        leftVar += Math.pow(y[idx] - leftMean, 2);
      }
      let rightVar = 0;
      for (const idx of rightIdxs) {
        rightVar += Math.pow(y[idx] - rightMean, 2);
      }

      const weightedChildMSE = (leftVar + rightVar) / n;
      const gain = parentMSE - weightedChildMSE;

      if (gain > bestGain) {
        bestGain = gain;
        bestFeatureIdx = featIdx;
        bestThreshold = threshold;
        bestLeftIndices = leftIdxs;
        bestRightIndices = rightIdxs;
      }
    }
  }

  if (bestFeatureIdx === -1 || bestGain <= 1e-6) {
    return { value: meanY, samples: n };
  }

  // Record feature importance gain
  importanceSums[bestFeatureIdx] += bestGain * n;

  const leftChild = buildTree(
    X,
    y,
    bestLeftIndices,
    currentDepth + 1,
    maxDepth,
    minSamplesSplit,
    kFeatures,
    importanceSums
  );

  const rightChild = buildTree(
    X,
    y,
    bestRightIndices,
    currentDepth + 1,
    maxDepth,
    minSamplesSplit,
    kFeatures,
    importanceSums
  );

  return {
    featureIdx: bestFeatureIdx,
    threshold: bestThreshold,
    gain: bestGain,
    samples: n,
    value: meanY,
    left: leftChild,
    right: rightChild
  };
}

export function predictRandomForest(model: RandomForestModel, X: number[][]): number[] {
  const N = X.length;
  const predictions: number[] = [];

  for (let i = 0; i < N; i++) {
    const row = X[i];
    let treeSum = 0;

    for (const tree of model.trees) {
      treeSum += predictTree(tree, row);
    }

    const avgPred = treeSum / Math.max(1, model.trees.length);
    predictions.push(Math.max(0, avgPred));
  }

  return predictions;
}

function predictTree(node: TreeNode, row: number[]): number {
  if (node.featureIdx === undefined || node.left === undefined || node.right === undefined) {
    return node.value || 0;
  }

  const val = row[node.featureIdx] !== undefined ? row[node.featureIdx] : 0;
  if (val <= node.threshold!) {
    return predictTree(node.left, row);
  } else {
    return predictTree(node.right, row);
  }
}
