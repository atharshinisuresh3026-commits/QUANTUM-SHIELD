/**
 * A real Merkle tree: leaves are SHA-256 hashes of log entries, internal
 * nodes are SHA-256(left + right), root is a single hash committing to
 * every entry. Supports generating and verifying an inclusion proof for
 * any leaf without needing the whole tree.
 *
 * Framed here as an "audit log" — not "blockchain." A blockchain implies a
 * distributed network of nodes reaching consensus; this is a single
 * tamper-evident hash structure, which is what's actually being built.
 */

async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface MerkleProofStep {
  hash: string;
  position: "left" | "right";
}

export interface MerkleTree {
  root: string;
  leaves: string[];
  layers: string[][];
}

export async function buildMerkleTree(entries: string[]): Promise<MerkleTree> {
  if (entries.length === 0) {
    throw new Error("Cannot build a Merkle tree with zero entries.");
  }
  const leaves = await Promise.all(entries.map((e) => sha256Hex(e)));
  const layers: string[][] = [leaves];

  let current = leaves;
  while (current.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = i + 1 < current.length ? current[i + 1] : current[i]; // duplicate last if odd
      next.push(await sha256Hex(left + right));
    }
    layers.push(next);
    current = next;
  }

  return { root: current[0], leaves, layers };
}

export function getMerkleProof(tree: MerkleTree, leafIndex: number): MerkleProofStep[] {
  if (leafIndex < 0 || leafIndex >= tree.leaves.length) {
    throw new Error("Leaf index out of range.");
  }
  const proof: MerkleProofStep[] = [];
  let index = leafIndex;

  for (let layer = 0; layer < tree.layers.length - 1; layer++) {
    const currentLayer = tree.layers[layer];
    const isRightNode = index % 2 === 1;
    const siblingIndex = isRightNode ? index - 1 : index + 1;
    const sibling = siblingIndex < currentLayer.length ? currentLayer[siblingIndex] : currentLayer[index];
    proof.push({ hash: sibling, position: isRightNode ? "left" : "right" });
    index = Math.floor(index / 2);
  }
  return proof;
}

export async function verifyMerkleProof(
  leafData: string,
  proof: MerkleProofStep[],
  root: string
): Promise<boolean> {
  let hash = await sha256Hex(leafData);
  for (const step of proof) {
    hash = step.position === "left" ? await sha256Hex(step.hash + hash) : await sha256Hex(hash + step.hash);
  }
  return hash === root;
}
