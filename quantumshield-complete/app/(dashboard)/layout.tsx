'use client'

import { LayoutDashboard, FileSignature, Shield, BarChart3, AlertTriangle, Menu, X, FileText, Atom, FlaskConical, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sign', href: '/sign', icon: FileSignature },
  { name: 'Verify', href: '/verify', icon: Shield },
  { name: 'Verify PDF', href: '/verify-pdf', icon: FileText },
  { name: 'Threats', href: '/threats', icon: AlertTriangle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Quantum QDS', href: '/quantum', icon: Atom },
  { name: 'Extras', href: '/extras', icon: FlaskConical },
]

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:text-quantum-cyan transition-colors p-2"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link href="/dashboard" className="flex items-center gap-2 group">
                <Image
                  src="/images/logo.png"
                  alt="QuantumShield logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  priority
                />
                <span className="hidden sm:block text-xl font-bold gradient-text">
                  QuantumShield
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 ml-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-zinc-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="hidden sm:block text-sm text-gray-300">{user.name}</span>
                  <div className="w-8 h-8 rounded-full bg-quantum-cyan flex items-center justify-center text-netflix-black text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Log out</span>
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-900 z-50 overflow-y-auto">
            <div className="p-6 pt-20">
              <div className="mb-8 flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="QuantumShield logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-lg font-bold gradient-text">QuantumShield</span>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-zinc-800 text-white'
                          : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
