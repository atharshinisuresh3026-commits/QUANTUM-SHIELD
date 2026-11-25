'use client'

import { useState } from 'react'
import { Atom, Play } from 'lucide-react'
import { runAllScenarios, ScenarioResult } from '@/lib/quantum/attacks'

export default function QuantumPage() {
  const [trials, setTrials] = useState(1000)
  const [results, setResults] = useState<ScenarioResult[] | null>(null)
  const [running, setRunning] = useState(false)

  const run = () => {
    setRunning(true)
    // setTimeout lets the "Running..." state paint before the
    // (synchronous, CPU-bound) simulation blocks the thread.
    setTimeout(() => {
      setResults(runAllScenarios(trials))
      setRunning(false)
    }, 30)
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Atom className="w-8 h-8 text-quantum-cyan" />
          <h1 className="text-4xl font-bold text-white">Quantum QDS Simulator</h1>
        </div>
        <p className="text-gray-400 mb-8 max-w-3xl">
          A real statevector simulation of teleportation-based Quantum Digital
          Signatures — Bell-state entanglement, Pauli corrections, and
          projective measurement, run thousands of times per scenario to
          produce genuine acceptance-rate statistics. No AI/ML is used; the
          threat detection below is pure statistical thresholding on
          measurement outcomes, per the problem statement.
        </p>

        <div className="netflix-card p-6 mb-8">
          <label className="block text-sm text-gray-400 mb-2">
            Trials per scenario
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              min={100}
              max={20000}
              step={100}
              value={trials}
              onChange={(e) => setTrials(Number(e.target.value))}
              className="bg-netflix-black border border-netflix-gray rounded px-4 py-2 text-white w-40 focus:outline-none focus:border-quantum-cyan"
            />
            <button
              onClick={run}
              disabled={running}
              className="netflix-button inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {running ? 'Running...' : 'Run all 5 scenarios'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Higher trial counts take longer (this runs the full quantum
            circuit synchronously in your browser) but give tighter
            statistics. 1,000–5,000 is a good demo range.
          </p>
        </div>

        {results && (
          <div className="netflix-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-netflix-gray text-left text-gray-400">
                  <th className="p-4">Scenario</th>
                  <th className="p-4">Trials</th>
                  <th className="p-4">Matches</th>
                  <th className="p-4">Accept Rate</th>
                  <th className="p-4">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.name} className="border-b border-netflix-gray/50">
                    <td className="p-4 text-white font-medium">{r.name}</td>
                    <td className="p-4 text-gray-400">{r.trials}</td>
                    <td className="p-4 text-gray-400">{r.matches}</td>
                    <td className="p-4 text-white font-mono">
                      {(r.acceptRate * 100).toFixed(1)}%
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          r.verdict === 'LEGITIMATE (accepted)'
                            ? 'text-quantum-green'
                            : r.verdict === 'ATTACK DETECTED'
                            ? 'text-quantum-red'
                            : 'text-quantum-yellow'
                        }
                      >
                        {r.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 leading-relaxed">
          <p className="mb-2">
            <strong className="text-gray-400">Why legitimate signatures land near 100%:</strong>{' '}
            quantum teleportation is exact — once Bob applies the correct Pauli
            correction from Alice's real measurement outcomes, his qubit
            reproduces the original state deterministically.
          </p>
          <p className="mb-2">
            <strong className="text-gray-400">Why forgery / impersonation / replay land near 50%:</strong>{' '}
            an attacker without the real correction bits (or the real shared
            entanglement) is measuring what is, from their perspective, a
            maximally mixed qubit — equivalent to guessing.
          </p>
          <p>
            <strong className="text-gray-400">Why channel manipulation lands in between:</strong>{' '}
            a random Pauli error (X, Y, or Z) is injected with 50% probability;
            only X and Y errors flip a Z-basis measurement outcome, so the
            degradation is real but less severe than pure random guessing.
          </p>
        </div>
      </div>
    </div>
  )
}
