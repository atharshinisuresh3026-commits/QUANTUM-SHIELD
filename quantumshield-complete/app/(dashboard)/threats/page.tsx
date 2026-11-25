'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Search, ExternalLink } from 'lucide-react'
import { generateSampleThreats, Severity, Status, DATASET_SOURCE_URL } from '../../../lib/sampleData'

const severityColor: Record<Severity, string> = {
  Critical: 'text-quantum-red border-quantum-red/40 bg-quantum-red/10',
  High: 'text-quantum-yellow border-quantum-yellow/40 bg-quantum-yellow/10',
  Medium: 'text-quantum-cyan border-quantum-cyan/40 bg-quantum-cyan/10',
  Low: 'text-quantum-green border-quantum-green/40 bg-quantum-green/10',
}

const statusColor: Record<Status, string> = {
  Active: 'text-quantum-red',
  Contained: 'text-quantum-yellow',
  Resolved: 'text-quantum-green',
}

const ALL_SEVERITIES: (Severity | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low']
const ALL_STATUSES: (Status | 'All')[] = ['All', 'Active', 'Contained', 'Resolved']

export default function ThreatsPage() {
  const allThreats = useMemo(() => generateSampleThreats(48, 42), [])
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<Severity | 'All'>('All')
  const [status, setStatus] = useState<Status | 'All'>('All')

  const filtered = useMemo(() => {
    return allThreats.filter((t) => {
      if (severity !== 'All' && t.severity !== severity) return false
      if (status !== 'All' && t.status !== status) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q) &&
          !t.vector.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [allThreats, query, severity, status])

  const counts = useMemo(() => {
    const c = { Critical: 0, High: 0, Medium: 0, Low: 0, Active: 0 }
    for (const t of allThreats) {
      c[t.severity]++
      if (t.status === 'Active') c.Active++
    }
    return c
  }, [allThreats])

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-quantum-yellow" />
          <h1 className="text-4xl font-bold text-white">Threat Log</h1>
        </div>
        <p className="text-gray-400 mb-6 max-w-3xl">
          Detected threat activity across monitored systems. This view is sample data
          generated for demonstration —{' '}
          <a
            href={DATASET_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-quantum-cyan hover:underline inline-flex items-center gap-1"
          >
            real dataset source <ExternalLink className="w-3 h-3" />
          </a>
          . Signature forgery/impersonation/replay/channel-manipulation detections come
          from the{' '}
          <a href="/quantum" className="text-quantum-cyan hover:underline">
            Quantum QDS simulator
          </a>{' '}
          separately.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatPill label="Critical" value={counts.Critical} className="text-quantum-red" />
          <StatPill label="High" value={counts.High} className="text-quantum-yellow" />
          <StatPill label="Medium" value={counts.Medium} className="text-quantum-cyan" />
          <StatPill label="Low" value={counts.Low} className="text-quantum-green" />
          <StatPill label="Active now" value={counts.Active} className="text-white" />
        </div>

        <div className="netflix-card p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, or vector..."
              className="w-full bg-netflix-black border border-netflix-gray rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-quantum-cyan"
            />
          </div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity | 'All')}
            className="bg-netflix-black border border-netflix-gray rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-quantum-cyan"
          >
            {ALL_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All severities' : s}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | 'All')}
            className="bg-netflix-black border border-netflix-gray rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-quantum-cyan"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="netflix-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-netflix-gray text-left text-gray-400">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Vector</th>
                <th className="p-4">Detected</th>
                <th className="p-4">Systems</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-netflix-gray/50 hover:bg-netflix-gray/10">
                  <td className="p-4 text-gray-500 font-mono text-xs">{t.id}</td>
                  <td className="p-4 text-white font-medium">{t.name}</td>
                  <td className="p-4 text-gray-400">{t.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${severityColor[t.severity]}`}>
                      {t.severity}
                    </span>
                  </td>
                  <td className={`p-4 text-xs font-medium ${statusColor[t.status]}`}>{t.status}</td>
                  <td className="p-4 text-gray-400">{t.vector}</td>
                  <td className="p-4 text-gray-400">{t.detected}</td>
                  <td className="p-4 text-gray-400">{t.affectedSystems}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No threats match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="netflix-card p-4 text-center">
      <div className={`text-2xl font-bold ${className}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
