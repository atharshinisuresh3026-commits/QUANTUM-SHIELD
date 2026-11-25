/**
 * Isolation Forest (Liu, Ting & Zhou, 2008) — a real, working implementation
 * from scratch. Builds an ensemble of random isolation trees; anomalies get
 * isolated in fewer random splits than normal points, so they end up with
 * shorter average path lengths across the forest.
 *
 * MARKED CLEARLY AS OPTIONAL / NOT PART OF THE PS-5 SOLUTION — see the page
 * that renders this. The problem statement explicitly requires threat
 * detection WITHOUT AI/ML; this is a genuine ML algorithm, kept separate.
 */

export interface IsolationTreeNode {
  splitFeature?: number;
  splitValue?: number;
  left?: IsolationTreeNode;
  right?: IsolationTreeNode;
  size: number;
  isLeaf: boolean;
}

function buildTree(
  data: number[][],
  currentDepth: number,
  maxDepth: number,
  rng: () => number
): IsolationTreeNode {
  if (currentDepth >= maxDepth || data.length <= 1) {
    return { size: data.length, isLeaf: true };
  }

  const numFeatures = data[0].length;
  const splitFeature = Math.floor(rng() * numFeatures);
  const values = data.map((row) => row[splitFeature]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return { size: data.length, isLeaf: true };
  }

  const splitValue = min + rng() * (max - min);
  const left = data.filter((row) => row[splitFeature] < splitValue);
  const right = data.filter((row) => row[splitFeature] >= splitValue);

  return {
    splitFeature,
    splitValue,
    left: buildTree(left, currentDepth + 1, maxDepth, rng),
    right: buildTree(right, currentDepth + 1, maxDepth, rng),
    size: data.length,
    isLeaf: false,
  };
}

function pathLength(row: number[], node: IsolationTreeNode, currentDepth: number): number {
  if (node.isLeaf) {
    // Average path length adjustment for unsplit points remaining in a leaf
    // (standard isolation forest correction term c(n))
    const n = node.size;
    if (n <= 1) return currentDepth;
    const c = 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
    return currentDepth + c;
  }
  if (row[node.splitFeature!] < node.splitValue!) {
    return pathLength(row, node.left!, currentDepth + 1);
  }
  return pathLength(row, node.right!, currentDepth + 1);
}

export interface IsolationForestModel {
  trees: IsolationTreeNode[];
  sampleSize: number;
}

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function trainIsolationForest(
  data: number[][],
  numTrees = 100,
  sampleSize = Math.min(256, data.length),
  seed = 42
): IsolationForestModel {
  const rng = makeRng(seed);
  const maxDepth = Math.ceil(Math.log2(sampleSize));
  const trees: IsolationTreeNode[] = [];

  for (let t = 0; t < numTrees; t++) {
    const sample: number[][] = [];
    for (let i = 0; i < sampleSize; i++) {
      sample.push(data[Math.floor(rng() * data.length)]);
    }
    trees.push(buildTree(sample, 0, maxDepth, rng));
  }

  return { trees, sampleSize };
}

/** Anomaly score in [0, 1]: closer to 1 = more anomalous, closer to 0.5 = normal. */
export function anomalyScore(model: IsolationForestModel, row: number[]): number {
  const avgPathLength =
    model.trees.reduce((sum, tree) => sum + pathLength(row, tree, 0), 0) / model.trees.length;
  const n = model.sampleSize;
  const c = n > 1 ? 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n : 1;
  return Math.pow(2, -avgPathLength / c);
}
