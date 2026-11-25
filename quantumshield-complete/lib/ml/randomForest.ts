/**
 * Random Forest classifier — a real, working implementation from scratch.
 * Ensemble of decision trees, each trained on a bootstrap sample with a
 * random subset of features considered at each split (Gini impurity).
 * Final prediction is majority vote across trees.
 *
 * MARKED CLEARLY AS OPTIONAL / NOT PART OF THE PS-5 SOLUTION — see the page
 * that renders this.
 */

export interface TrainingExample {
  features: number[];
  label: string;
}

interface DecisionNode {
  isLeaf: boolean;
  prediction?: string;
  splitFeature?: number;
  splitValue?: number;
  left?: DecisionNode;
  right?: DecisionNode;
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

function gini(examples: TrainingExample[]): number {
  const counts = new Map<string, number>();
  for (const ex of examples) counts.set(ex.label, (counts.get(ex.label) ?? 0) + 1);
  let impurity = 1;
  for (const count of counts.values()) {
    const p = count / examples.length;
    impurity -= p * p;
  }
  return impurity;
}

function majorityLabel(examples: TrainingExample[]): string {
  const counts = new Map<string, number>();
  for (const ex of examples) counts.set(ex.label, (counts.get(ex.label) ?? 0) + 1);
  let best = examples[0].label;
  let bestCount = 0;
  for (const [label, count] of counts) {
    if (count > bestCount) {
      best = label;
      bestCount = count;
    }
  }
  return best;
}

function buildDecisionTree(
  examples: TrainingExample[],
  depth: number,
  maxDepth: number,
  numFeaturesToTry: number,
  rng: () => number
): DecisionNode {
  const allSameLabel = examples.every((ex) => ex.label === examples[0].label);
  if (allSameLabel || depth >= maxDepth || examples.length < 2) {
    return { isLeaf: true, prediction: majorityLabel(examples) };
  }

  const numFeatures = examples[0].features.length;
  const featureIndices = new Set<number>();
  while (featureIndices.size < Math.min(numFeaturesToTry, numFeatures)) {
    featureIndices.add(Math.floor(rng() * numFeatures));
  }

  let bestGiniGain = -Infinity;
  let bestFeature = -1;
  let bestValue = 0;
  const parentGini = gini(examples);

  for (const feature of featureIndices) {
    const values = [...new Set(examples.map((ex) => ex.features[feature]))].sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const left = examples.filter((ex) => ex.features[feature] < threshold);
      const right = examples.filter((ex) => ex.features[feature] >= threshold);
      if (left.length === 0 || right.length === 0) continue;

      const weightedGini =
        (left.length / examples.length) * gini(left) + (right.length / examples.length) * gini(right);
      const gain = parentGini - weightedGini;
      if (gain > bestGiniGain) {
        bestGiniGain = gain;
        bestFeature = feature;
        bestValue = threshold;
      }
    }
  }

  if (bestFeature === -1) {
    return { isLeaf: true, prediction: majorityLabel(examples) };
  }

  const left = examples.filter((ex) => ex.features[bestFeature] < bestValue);
  const right = examples.filter((ex) => ex.features[bestFeature] >= bestValue);

  return {
    isLeaf: false,
    splitFeature: bestFeature,
    splitValue: bestValue,
    left: buildDecisionTree(left, depth + 1, maxDepth, numFeaturesToTry, rng),
    right: buildDecisionTree(right, depth + 1, maxDepth, numFeaturesToTry, rng),
  };
}

function predictTree(node: DecisionNode, features: number[]): string {
  if (node.isLeaf) return node.prediction!;
  return features[node.splitFeature!] < node.splitValue!
    ? predictTree(node.left!, features)
    : predictTree(node.right!, features);
}

export interface RandomForestModel {
  trees: DecisionNode[];
}

export function trainRandomForest(
  examples: TrainingExample[],
  numTrees = 50,
  maxDepth = 8,
  seed = 42
): RandomForestModel {
  const rng = makeRng(seed);
  const numFeatures = examples[0].features.length;
  const numFeaturesToTry = Math.max(1, Math.floor(Math.sqrt(numFeatures)));
  const trees: DecisionNode[] = [];

  for (let t = 0; t < numTrees; t++) {
    const bootstrap: TrainingExample[] = [];
    for (let i = 0; i < examples.length; i++) {
      bootstrap.push(examples[Math.floor(rng() * examples.length)]);
    }
    trees.push(buildDecisionTree(bootstrap, 0, maxDepth, numFeaturesToTry, rng));
  }

  return { trees };
}

export function predictRandomForest(model: RandomForestModel, features: number[]): string {
  const votes = new Map<string, number>();
  for (const tree of model.trees) {
    const prediction = predictTree(tree, features);
    votes.set(prediction, (votes.get(prediction) ?? 0) + 1);
  }
  let best = "";
  let bestCount = -1;
  for (const [label, count] of votes) {
    if (count > bestCount) {
      best = label;
      bestCount = count;
    }
  }
  return best;
}
