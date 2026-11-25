/**
 * Standard 3-qubit quantum teleportation protocol.
 *
 * Qubit 0: the message qubit, prepared in the state to be teleported (Alice's).
 * Qubit 1: Alice's half of an entangled Bell pair.
 * Qubit 2: Bob's half of the Bell pair (receives the teleported state).
 *
 * Protocol:
 *  1. Entangle qubits 1 & 2 into a Bell pair (H then CNOT).
 *  2. Alice entangles her message qubit with her half of the pair (CNOT then H).
 *  3. Alice measures both her qubits (0 and 1) — these become classical bits m1, m2.
 *  4. Bob applies Pauli corrections to qubit 2 based on (m1, m2): X if m2=1, Z if m1=1.
 *  5. Qubit 2 now holds the original state, up to no error — this is teleportation,
 *     not cloning: qubit 0's original state is destroyed by measurement.
 */
import { Complex, C } from "./complex";
import { StateVector, initState, applyGate, applyCNOT, measure, GATES } from "./statevector";

export interface TeleportResult {
  m1: 0 | 1;
  m2: 0 | 1;
  finalQubitState: [Complex, Complex];
}

/**
 * Runs the teleportation circuit. Optionally injects a channel error (a random
 * Pauli applied to the traveling half of the Bell pair before the Bell
 * measurement) to model an eavesdropper or noisy channel.
 */
export function teleport(
  alpha: Complex,
  beta: Complex,
  rng: () => number,
  channelError?: { probability: number }
): TeleportResult {
  const n = 3;
  let state: StateVector = initState(n);
  state[0] = alpha; // |q0=0, q1=0, q2=0>
  state[4] = beta; // |q0=1, q1=0, q2=0>

  state = applyGate(state, GATES.H, 1, n);
  state = applyCNOT(state, 1, 2, n);

  if (channelError && rng() < channelError.probability) {
    const pauli = [GATES.X, GATES.Y, GATES.Z][Math.floor(rng() * 3)];
    state = applyGate(state, pauli, 1, n);
  }

  state = applyCNOT(state, 0, 1, n);
  state = applyGate(state, GATES.H, 0, n);

  const r1 = measure(state, 0, n, rng);
  state = r1.state;
  const r2 = measure(state, 1, n, rng);
  state = r2.state;

  if (r2.outcome === 1) state = applyGate(state, GATES.X, 2, n);
  if (r1.outcome === 1) state = applyGate(state, GATES.Z, 2, n);

  const idx0 = (r1.outcome << 2) | (r2.outcome << 1) | 0;
  const idx1 = (r1.outcome << 2) | (r2.outcome << 1) | 1;

  return {
    m1: r1.outcome,
    m2: r2.outcome,
    finalQubitState: [state[idx0], state[idx1]],
  };
}
