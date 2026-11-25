/**
 * From-scratch statevector quantum simulator.
 *
 * This is NOT a wrapper around Qiskit or any external quantum library —
 * there is no mature quantum-simulation library for JavaScript, so this
 * implements the same underlying model real simulators use: a 2^n-dimensional
 * complex statevector, unitary gate application via tensor structure, and
 * Born-rule probabilistic measurement with wavefunction collapse.
 *
 * Qubit indexing convention: qubit 0 is the most significant bit of the
 * state index. For n=3, basis state |q0 q1 q2> maps to index (q0<<2)|(q1<<1)|q2.
 */
import { Complex, C } from "./complex";

export type StateVector = Complex[];

export function initState(numQubits: number): StateVector {
  const size = 1 << numQubits;
  const state: StateVector = new Array(size).fill(null).map(() => C(0));
  state[0] = C(1);
  return state;
}

/** Applies a 2x2 unitary gate to a single qubit within an n-qubit register. */
export function applyGate(
  state: StateVector,
  gate: Complex[][],
  qubit: number,
  numQubits: number
): StateVector {
  const size = state.length;
  const newState: StateVector = state.map(() => C(0));
  const bit = numQubits - 1 - qubit;

  for (let i = 0; i < size; i++) {
    const bitVal = (i >> bit) & 1;
    if (bitVal === 0) {
      const pairIndex = i ^ (1 << bit);
      newState[i] = newState[i]
        .add(gate[0][0].mul(state[i]))
        .add(gate[0][1].mul(state[pairIndex]));
      newState[pairIndex] = newState[pairIndex]
        .add(gate[1][0].mul(state[i]))
        .add(gate[1][1].mul(state[pairIndex]));
    }
  }
  return newState;
}

/** Applies CNOT with the given control and target qubits. */
export function applyCNOT(
  state: StateVector,
  control: number,
  target: number,
  numQubits: number
): StateVector {
  const size = state.length;
  const out: StateVector = new Array(size).fill(null).map(() => C(0));
  const cBit = numQubits - 1 - control;
  const tBit = numQubits - 1 - target;

  for (let i = 0; i < size; i++) {
    if (((i >> cBit) & 1) === 1) {
      const j = i ^ (1 << tBit);
      out[j] = out[j].add(state[i]);
    } else {
      out[i] = out[i].add(state[i]);
    }
  }
  return out;
}

export const GATES = {
  H: [
    [C(1 / Math.SQRT2), C(1 / Math.SQRT2)],
    [C(1 / Math.SQRT2), C(-1 / Math.SQRT2)],
  ],
  X: [
    [C(0), C(1)],
    [C(1), C(0)],
  ],
  Y: [
    [C(0), C(0, -1)],
    [C(0, 1), C(0)],
  ],
  Z: [
    [C(1), C(0)],
    [C(0), C(-1)],
  ],
};

/**
 * Measures a single qubit in the computational basis using the Born rule,
 * then collapses and renormalizes the statevector to match the outcome.
 * `rng` is injected so simulations can be seeded and reproduced.
 */
export function measure(
  state: StateVector,
  qubit: number,
  numQubits: number,
  rng: () => number
): { outcome: 0 | 1; state: StateVector } {
  const size = state.length;
  const bit = numQubits - 1 - qubit;
  let prob0 = 0;
  for (let i = 0; i < size; i++) {
    if (((i >> bit) & 1) === 0) prob0 += state[i].abs2();
  }
  const outcome: 0 | 1 = rng() < prob0 ? 0 : 1;
  const norm = Math.sqrt(outcome === 0 ? prob0 : 1 - prob0) || 1;

  const newState = state.map((amp, i) =>
    ((i >> bit) & 1) === outcome ? amp.scale(1 / norm) : C(0)
  );
  return { outcome, state: newState };
}

/** Seeded PRNG (mulberry32) so simulation runs are reproducible from a seed. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
