'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileSignature, ShieldCheck, FileText, Atom } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))

    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setRegisteredUsers(d.registeredUsers))
      .catch(() => setRegisteredUsers(null))
  }, [])

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          {user ? `Welcome, ${user.name}` : 'Dashboard'}
        </h1>
        <p className="text-gray-400 mb-8">
          Real numbers only — this app doesn't track response latency or a
          composite "security score," so those aren't shown here.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="netflix-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {registeredUsers ?? '—'}
            </div>
            <div className="text-sm text-gray-400">Registered users</div>
          </div>
          <div className="netflix-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {user ? 'Logged in' : 'Not logged in'}
            </div>
            <div className="text-sm text-gray-400">Session status</div>
          </div>
        </div>

        <div className="netflix-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/sign" className="netflix-button py-4 w-full flex items-center justify-center gap-2">
              <FileSignature className="w-4 h-4" /> Sign Document
            </Link>
            <Link href="/verify" className="netflix-button py-4 w-full flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Verify Signature
            </Link>
            <Link href="/verify-pdf" className="netflix-button py-4 w-full flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Verify PDF
            </Link>
            <Link href="/quantum" className="netflix-button py-4 w-full flex items-center justify-center gap-2">
              <Atom className="w-4 h-4" /> Quantum QDS
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
