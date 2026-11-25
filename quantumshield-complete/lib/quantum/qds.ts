/**
 * Teleportation-based Quantum Digital Signature (QDS) protocol.
 *
 * The signature "message" is encoded as one of six Pauli eigenstates
 * (±1 eigenstates of X, Y, or Z). Alice teleports this qubit to Bob using an
 * entangled Bell pair; Bob verifies by measuring in the SAME Pauli basis Alice
 * used. In the honest case this is deterministic — the measurement always
 * returns the expected eigenvalue. An adversary who doesn't know the correct
 * basis (or doesn't hold the real entangled channel) cannot reproduce this
 * determinism: their guesses only match roughly half the time, which repeated
 * verification rounds expose statistically. This is the core idea from the
 * problem statement — no AI/ML, just Pauli eigenstates, projective
 * measurement, and statistical thresholding.
 */
import { Complex, C } from "./complex";
import { teleport } from "./teleportation";

export type PauliBasis = "X" | "Y" | "Z";
export type Sign = 1 | -1;

/** Returns the ±1 eigenstate of the given Pauli operator as a 2-amplitude qubit. */
export function eigenstate(basis: PauliBasis, sign: Sign): [Complex, Complex] {
  const s = 1 / Math.SQRT2;
  switch (basis) {
    case "Z":
      return sign === 1 ? [C(1), C(0)] : [C(0), C(1)];
    case "X":
      return sign === 1 ? [C(s), C(s)] : [C(s), C(-s)];
    case "Y":
      return sign === 1 ? [C(s), C(0, s)] : [C(s), C(0, -s)];
  }
}

function inner(a: [Complex, Complex], b: [Complex, Complex]): Complex {
  return a[0].conj().mul(b[0]).add(a[1].conj().mul(b[1]));
}

/** Projective measurement of a qubit in a chosen Pauli basis (Born rule). */
export function measureInBasis(
  qubitState: [Complex, Complex],
  basis: PauliBasis,
  rng: () => number
): Sign {
  const plus = eigenstate(basis, 1);
  const probPlus = inner(plus, qubitState).abs2();
  return rng() < probPlus ? 1 : -1;
}

export interface QDSRoundResult {
  basis: PauliBasis;
  expectedSign: Sign;
  measuredSign: Sign;
  accepted: boolean;
}

/** Honest signing + verification round: real teleportation, correct basis. */
export function runLegitimateRound(
  basis: PauliBasis,
  sign: Sign,
  rng: () => number
): QDSRoundResult {
  const [alpha, beta] = eigenstate(basis, sign);
  const { finalQubitState } = teleport(alpha, beta, rng);
  const measured = measureInBasis(finalQubitState, basis, rng);
  return { basis, expectedSign: sign, measuredSign: measured, accepted: measured === sign };
}

function randomBasis(rng: () => number): PauliBasis {
  return (["X", "Y", "Z"] as PauliBasis[])[Math.floor(rng() * 3)];
}
function randomSign(rng: () => number): Sign {
  return rng() < 0.5 ? 1 : -1;
}

/** Forgery: attacker has no channel access at all and guesses a state outright. */
export function runForgeryAttack(basis: PauliBasis, sign: Sign, rng: () => number): QDSRoundResult {
  const guessed = eigenstate(randomBasis(rng), randomSign(rng));
  const measured = measureInBasis(guessed, basis, rng);
  return { basis, expectedSign: sign, measuredSign: measured, accepted: measured === sign };
}

/** Impersonation: attacker runs real teleportation, but from a guessed input state. */
export function runImpersonationAttack(
  basis: PauliBasis,
  sign: Sign,
  rng: () => number
): QDSRoundResult {
  const [alpha, beta] = eigenstate(randomBasis(rng), randomSign(rng));
  const { finalQubitState } = teleport(alpha, beta, rng);
  const measured = measureInBasis(finalQubitState, basis, rng);
  return { basis, expectedSign: sign, measuredSign: measured, accepted: measured === sign };
}

/**
 * Replay: attacker reuses a stale pair of classical correction bits from an
 * earlier session instead of the fresh ones this round's Bell measurement
 * actually produced.
 */
export function runReplayAttack(basis: PauliBasis, sign: Sign, rng: () => number): QDSRoundResult {
  const [alpha, beta] = eigenstate(basis, sign);
  const { finalQubitState } = teleport(alpha, beta, rng);
  // Simulate stale corrections by re-flipping with a fixed, wrong pair (0,1)
  // instead of trusting the (already-applied) correct ones — i.e. the
  // attacker's replayed bits corrupt an otherwise-valid transcript.
  const corrupted: [Complex, Complex] = [
    finalQubitState[1],
    finalQubitState[0],
  ];
  const measured = measureInBasis(corrupted, basis, rng);
  return { basis, expectedSign: sign, measuredSign: measured, accepted: measured === sign };
}

/** Channel manipulation: eavesdropper injects a random Pauli error mid-transit. */
export function runChannelManipulationAttack(
  basis: PauliBasis,
  sign: Sign,
  rng: () => number,
  errorProbability = 0.5
): QDSRoundResult {
  const [alpha, beta] = eigenstate(basis, sign);
  const { finalQubitState } = teleport(alpha, beta, rng, { probability: errorProbability });
  const measured = measureInBasis(finalQubitState, basis, rng);
  return { basis, expectedSign: sign, measuredSign: measured, accepted: measured === sign };
}
