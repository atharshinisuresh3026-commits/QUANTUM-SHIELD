# Quantum-Inspired Cyber Threat Detection for Digital Signature Security
### SIH 2026 — Problem Statement 5 (Egreen Quanta LLP) — Documentation

---

## 1. Note on Dataset

The official PS table lists **Dataset: Public/Open**. This does not reference
a specific provided file — it means no proprietary dataset is supplied, and
none is required, because this is a mathematical/simulation problem, not a
data-driven one. The "data" evaluated in this submission is generated
directly by the quantum statevector simulator (Monte Carlo trial outcomes),
which is the correct and expected approach for a protocol-verification
framework of this kind.

No AI/ML techniques are used anywhere in this framework, per the explicit
constraint in the problem statement.

---

## 2. Mathematical Model of Teleportation-Based QDS

### 2.1 State Representation

The system is modelled as a 3-qubit register:

- **Qubit 0** — the message/signature qubit prepared by the signer (Alice)
- **Qubit 1** — Alice's half of a shared Bell pair
- **Qubit 2** — Bob's (the verifier's) half of the shared Bell pair

The joint state lives in an 8-dimensional complex Hilbert space
ℂ² ⊗ ℂ² ⊗ ℂ², represented as a length-8 complex amplitude vector indexed by
the 3-bit binary string (q0 q1 q2).

### 2.2 Message Encoding via Pauli Eigenstates

A 1-bit message *m ∈ {0,1}* is signed by first choosing a measurement basis
*b ∈ {Z, X}* uniformly at random, then preparing the corresponding Pauli
eigenstate:

| Basis | m = 0 (eigenvalue +1) | m = 1 (eigenvalue −1) |
|---|---|---|
| Z | \|0⟩ | \|1⟩ |
| X | \|+⟩ = (\|0⟩+\|1⟩)/√2 | \|−⟩ = (\|0⟩−\|1⟩)/√2 |

This directly satisfies the PS requirement to use **Pauli eigenstates** as
the signature basis.

### 2.3 Bell-State Entanglement

Alice and Bob share a Bell pair prepared on qubits 1 and 2:

```
|00⟩₁₂  --H(q1)-->  (|00⟩+|10⟩)/√2  --CNOT(1→2)-->  (|00⟩+|11⟩)/√2
```

This is the maximally entangled state |Φ⁺⟩ = (|00⟩+|11⟩)/√2.

### 2.4 Quantum Teleportation Protocol

Standard Bennett et al. (1993) protocol, applied to the message qubit:

1. Alice applies **CNOT(q0 → q1)** then **H(q0)** — a change of basis that
   entangles her message qubit with her half of the Bell pair.
2. Alice measures q0 and q1 in the computational basis, obtaining two
   classical bits (m₀, m₁).
3. Alice sends (m₀, m₁) to Bob over a classical channel.
4. Bob applies **Pauli corrections** to his qubit (q2) based on the
   received bits:
   - If m₁ = 1: apply **X**
   - If m₀ = 1: apply **Z**
5. Bob's qubit now equals the original state (α|0⟩ + β|1⟩) exactly, up to
   global phase — this is the deterministic, information-theoretic
   guarantee the PS asks for.

### 2.5 Signature Verification

The verifier (Bob) measures his corrected qubit in the **basis Alice
announces**, and checks that the resulting eigenvalue matches the claimed
message bit *m*. Because teleportation is exact, a legitimate signature
verifies with probability 1 (subject to the discrete Monte Carlo sample
size used in this implementation).

---

## 3. Threat Detection Framework

No AI/ML is used. Detection is entirely **statistical threshold analysis**
of measurement outcomes across repeated trials — exactly as specified.

### 3.1 Decision Rule

For a given scenario, the empirical **acceptance rate** (fraction of trials
where the measured eigenvalue matches the claimed message) is computed
over *N* trials. The verdict is:

| Acceptance Rate | Verdict |
|---|---|
| ≥ 90% | Legitimate (accepted) |
| ≤ 75% | Attack detected |
| 75%–90% | Inconclusive (flagged for review) |

This threshold-based rule is the "statistical analysis of measurement
outcomes" and "threshold-based decision rules" called for in the PS —
no learned model, no training data.

### 3.2 Attack Models Implemented

**Forgery** — An attacker has no shared entanglement and no real
measurement outcomes from Alice. They apply *randomly guessed* correction
bits to an otherwise-unentangled qubit. Because the correction is
uncorrelated with the actual state, Bob's post-correction qubit is
effectively maximally mixed with respect to the signing basis, giving a
match rate statistically indistinguishable from a coin flip (~50%).

**Impersonation** — An attacker without knowledge of the real (basis,
message) pair prepares and teleports their *own* arbitrary qubit,
attempting to pass it off as Alice's signature. Verification checks the
result against the real claimed basis/message, which the attacker had to
guess independently — again yielding a ~50% acceptance rate.

**Replay** — An attacker captures a previous, genuinely valid
(basis, message, correction-bits) tuple and re-submits it against a *new*
message in a *new* session. Because each teleportation instance uses a
freshly generated Bell pair, the old correction bits do not correspond to
the new session's actual Bell-measurement outcomes, so the replayed
signature fails to verify at above chance rates.

**Channel Manipulation** — A legitimate signature is generated correctly,
but a random Pauli error (X, Y, or Z, each equally likely) is injected on
Bob's qubit with probability *p* before his final measurement, modelling
an eavesdropper or noisy/tampered quantum channel. Because a Z-type error
does not affect measurement outcome probabilities in the Z basis
(it only introduces an undetectable global/relative phase for that
observable), only the X and Y branches actually flip the measured
eigenvalue. With p = 0.5, this yields a partially degraded — but not fully
randomized — acceptance rate, which the framework correctly distinguishes
from both the legitimate case and the full-guessing attack cases.

---

## 4. Software Framework / Prototype

### 4.1 Implementation Approach

Because Qiskit (the standard reference quantum-simulation toolkit) is
Python-only and the deliverable is a Next.js/TypeScript web application,
the statevector simulator was implemented **directly from first
principles** in TypeScript rather than approximated or mocked. This means:

- Genuine complex-number linear algebra (`lib/quantum/complex.ts`)
- A genuine 3-qubit statevector with real gate matrices, real CNOT
  permutation logic, and real Born-rule projective measurement with
  state collapse and renormalization (`lib/quantum/statevector.ts`)
- The real teleportation circuit, not a shortcut approximation
  (`lib/quantum/teleportation.ts`)
- The signature scheme and all four attack simulations built on top of
  that same simulator (`lib/quantum/qds.ts`)
- A Monte Carlo runner producing the acceptance-rate statistics and
  threshold verdicts (`lib/quantum/attacks.ts`)

This is architecturally equivalent to what a Qiskit `Statevector`/`Aer`
backend does internally — the same mathematics, implemented by hand
instead of imported from a library.

### 4.2 Components Delivered

| Component | File | Status |
|---|---|---|
| Mathematical model | This document, §2 | ✅ Complete |
| Signature generation & verification | `lib/quantum/qds.ts` | ✅ Complete |
| Attack simulation (4 types) | `lib/quantum/qds.ts` | ✅ Complete |
| Statistical threshold detection | `lib/quantum/attacks.ts` | ✅ Complete |
| Simulation environment / dashboard | `app/(dashboard)/quantum/page.tsx` | ✅ Complete |
| Verification interface | `app/(dashboard)/verify/page.tsx` | ✅ Complete (classical SHA-256 demo path; not the QDS path) |
| Logging of security events | — | ⚠️ Not yet implemented (see §6) |

### 4.3 How to Run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/quantum`, set a trial count (1,000–5,000 is a
good demo range — higher counts take longer since the circuit runs
synchronously per trial), and click **Run all 5 scenarios**.

---

## 5. Performance & Complexity Analysis

### 5.1 Computational Complexity

- **State size**: fixed at 8 complex amplitudes (3 qubits) regardless of
  trial count — O(1) per-trial memory.
- **Per-trial cost**: each teleportation run applies a constant number of
  gate operations (2 single-qubit gates for Bell-pair creation, 1 CNOT +
  1 Hadamard for the Bell-basis change, 2 measurements, up to 2 correction
  gates) — O(1) per trial, since qubit count does not grow with trial
  count or message length (this scheme signs 1 bit per protocol run).
- **Total complexity for N trials**: O(N) — linear in trial count, with a
  very small constant factor (single-digit numbers of 2×2 or 8-length
  array operations per trial).
- **No exponential blowup**: because the qubit count is fixed at 3
  regardless of N, this avoids the exponential state-space growth that
  limits general-purpose quantum simulators — a direct benefit of the
  protocol's constant per-signature qubit requirement.

### 5.2 Observed Behaviour (illustrative — actual runs will vary by RNG draw)

| Scenario | Expected acceptance rate | Verdict |
|---|---|---|
| Legitimate signature | ~100% | Legitimate (accepted) |
| Forgery | ~50% | Attack detected |
| Impersonation | ~50% | Attack detected |
| Replay | ~50% | Attack detected |
| Channel manipulation (p=0.5) | ~65–75% | Attack detected / inconclusive |

These are not hard-coded — they are the expected result of the underlying
quantum mechanics (a maximally mixed measurement is a coin flip; a partial
Pauli-error channel only partially degrades fidelity). Actual numbers from
any given run will vary slightly due to Monte Carlo sampling noise, and
will converge tighter around these values as trial count increases.

### 5.3 Security Guarantee

The separation between the legitimate case (~100%) and every attack case
(~50–75%) against a 90%/75% threshold band provides a clear, adjustable
security margin. This reflects the **information-theoretic security**
property claimed by the PS: the advantage above chance for an attacker who
does not possess Alice's real measurement outcomes or the real shared
entanglement is fundamentally bounded by quantum mechanics, not by
computational hardness assumptions (unlike RSA/ECC, which Shor's algorithm
breaks).

---

## 6. Known Gaps / Not Yet Delivered

- **Logging of security events** — the dashboard displays live results but
  does not yet persist a log of detected attacks over time.
- **Multi-bit messages** — the current scheme signs 1 bit per protocol
  run; extending to multi-bit messages requires either repeating the
  protocol per bit or a generalized higher-dimensional encoding, neither
  of which is implemented yet.
- **Formal security proof** — §5.3 gives an intuitive information-theoretic
  argument; a rigorous cryptographic security proof (e.g. bounding
  adversary advantage as a function of channel noise and trial count) is
  not included.

---

## 7. File Manifest

```
lib/quantum/
├── complex.ts          — complex number arithmetic
├── statevector.ts       — 3-qubit gates, CNOT, measurement/collapse
├── teleportation.ts      — the teleportation protocol
├── qds.ts                 — signature scheme + 4 attack simulations
└── attacks.ts               — Monte Carlo runner + threshold verdicts

app/(dashboard)/quantum/page.tsx  — simulation dashboard
```
