'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { generateSampleThreats, Severity } from '../../../lib/sampleData'
import { runAllScenarios, ScenarioResult } from '../../../lib/quantum/attacks'

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: '#EF4444',
  High: '#F59E0B',
  Medium: '#4FD1C5',
  Low: '#10B981',
}

const VERDICT_COLOR: Record<string, string> = {
  'LEGITIMATE (accepted)': '#10B981',
  'ATTACK DETECTED': '#EF4444',
}

export default function AnalyticsPage() {
  const threats = useMemo(() => generateSampleThreats(48, 42), [])
  const [qds, setQds] = useState<ScenarioResult[] | null>(null)

  useEffect(() => {
    // A representative QDS run for the trend view — real teleportation
    // simulation, not mock numbers.
    setQds(runAllScenarios(500))
  }, [])

  const severityData = useMemo(() => {
    const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    for (const t of threats) counts[t.severity]++
    return (Object.keys(counts) as Severity[]).map((s) => ({ name: s, value: counts[s] }))
  }, [threats])

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of threats) counts[t.category] = (counts[t.category] || 0) + 1
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [threats])

  const timelineData = useMemo(() => {
    const byWeek: Record<string, number> = {}
    for (const t of threats) {
      const d = new Date(t.detected)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split('T')[0]
      byWeek[key] = (byWeek[key] || 0) + 1
    }
    return Object.entries(byWeek)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => (a.week < b.week ? -1 : 1))
  }, [threats])

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-quantum-cyan" />
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
        </div>
        <p className="text-gray-400 mb-8 max-w-3xl">
          Aggregate views over the sample threat log and a live 500-trial run of the
          Quantum QDS simulator.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="netflix-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Threats by severity</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {severityData.map((d) => (
                    <Cell key={d.name} fill={SEVERITY_COLORS[d.name as Severity]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #333' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="netflix-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Threats by category</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #333' }} />
                <Bar dataKey="value" fill="#4FD1C5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="netflix-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detections over time (weekly)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#141414', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="netflix-card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            QDS acceptance rate by scenario
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Live result — 500 real teleportation-circuit trials per scenario, run just now.
          </p>
          {qds ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={qds}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={12} domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} />
                <Tooltip
                  contentStyle={{ background: '#141414', border: '1px solid #333' }}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Bar dataKey="acceptRate" radius={[4, 4, 0, 0]}>
                  {qds.map((r) => (
                    <Cell key={r.name} fill={VERDICT_COLOR[r.verdict] || '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-500 text-sm">
              Running simulation...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
