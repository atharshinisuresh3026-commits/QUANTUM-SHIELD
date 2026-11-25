/**
 * Runs repeated QDS rounds (Monte Carlo) for a chosen scenario and reports
 * the empirical acceptance rate against a security threshold — the
 * "statistical analysis of measurement outcomes" the problem statement calls
 * for, with no AI/ML involved: it's a direct frequency count against a
 * fixed decision rule.
 */
import { makeRng } from "./statevector";
import {
  PauliBasis,
  Sign,
  runLegitimateRound,
  runForgeryAttack,
  runImpersonationAttack,
  runReplayAttack,
  runChannelManipulationAttack,
} from "./qds";

export type ScenarioType = "legitimate" | "forgery" | "impersonation" | "replay" | "channel";

export const SCENARIO_LABELS: Record<ScenarioType, string> = {
  legitimate: "Legitimate signature",
  forgery: "Forgery attempt",
  impersonation: "Impersonation attack",
  replay: "Replay attack",
  channel: "Channel manipulation",
};

export interface SimulationSummary {
  scenario: ScenarioType;
  trials: number;
  acceptedCount: number;
  acceptanceRate: number;
  threshold: number;
  verdict: "Accepted" | "Threat detected";
}

const bases: PauliBasis[] = ["X", "Y", "Z"];

export function runSimulation(
  scenario: ScenarioType,
  trials: number,
  seed: number,
  threshold = 0.9
): SimulationSummary {
  const rng = makeRng(seed);
  let accepted = 0;

  for (let i = 0; i < trials; i++) {
    const basis = bases[Math.floor(rng() * 3)];
    const sign: Sign = rng() < 0.5 ? 1 : -1;

    const result =
      scenario === "legitimate"
        ? runLegitimateRound(basis, sign, rng)
        : scenario === "forgery"
        ? runForgeryAttack(basis, sign, rng)
        : scenario === "impersonation"
        ? runImpersonationAttack(basis, sign, rng)
        : scenario === "replay"
        ? runReplayAttack(basis, sign, rng)
        : runChannelManipulationAttack(basis, sign, rng);

    if (result.accepted) accepted++;
  }

  const acceptanceRate = accepted / trials;
  return {
    scenario,
    trials,
    acceptedCount: accepted,
    acceptanceRate,
    threshold,
    verdict: acceptanceRate >= threshold ? "Accepted" : "Threat detected",
  };
}

export function runAllScenariosDetailed(
  trials: number,
  seed: number,
  threshold = 0.9
): SimulationSummary[] {
  const scenarios: ScenarioType[] = [
    "legitimate",
    "forgery",
    "impersonation",
    "replay",
    "channel",
  ];
  return scenarios.map((s, i) => runSimulation(s, trials, seed + i * 1000, threshold));
}

/**
 * Simplified shape used by the dashboard's Quantum QDS page: a plain
 * scenario name, raw match count, acceptance rate, and a three-tier verdict
 * (clear accept / borderline / clear attack) rather than a single threshold.
 * Same underlying simulation as runAllScenariosDetailed — just a thinner
 * result shape for that page's table.
 */
export interface ScenarioResult {
  name: string;
  trials: number;
  matches: number;
  acceptRate: number;
  verdict: "LEGITIMATE (accepted)" | "SUSPICIOUS (borderline)" | "ATTACK DETECTED";
}

export function runAllScenarios(trials: number): ScenarioResult[] {
  const seed = Date.now() % 100000;
  const scenarios: ScenarioType[] = [
    "legitimate",
    "forgery",
    "impersonation",
    "replay",
    "channel",
  ];
  return scenarios.map((s, i) => {
    const summary = runSimulation(s, trials, seed + i * 7919);
    const rate = summary.acceptanceRate;
    const verdict: ScenarioResult["verdict"] =
      rate >= 0.9 ? "LEGITIMATE (accepted)" : rate <= 0.6 ? "ATTACK DETECTED" : "SUSPICIOUS (borderline)";
    return {
      name: SCENARIO_LABELS[s],
      trials: summary.trials,
      matches: summary.acceptedCount,
      acceptRate: rate,
      verdict,
    };
  });
}
