'use client'

import { LayoutDashboard, FileSignature, Shield, BarChart3, AlertTriangle, Menu, X, FileText, Atom, Bell, Search, FlaskConical, LogOut } from 'lucide-react'
import Link from 'next/link'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setUserMenuOpen(false)
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
                className="lg:hidden text-white hover:text-purple-400 transition-colors p-2"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
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
                          ? 'bg-purple-500/20 text-white'
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

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-gray-400 hover:text-white text-sm"
              >
                <Search size={16} />
                <span className="hidden md:inline">Search...</span>
              </button>
              <button className="relative p-2 text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                    title={user.email}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 text-sm text-white border-b border-zinc-800">{user.name}</div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2">
                    Log in
                  </Link>
                  <Link href="/register" className="netflix-button text-sm px-4 py-2">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="px-4 sm:px-6 lg:px-8 pb-4 border-t border-zinc-800 mt-2 pt-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search signatures, threats, analytics..."
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-900 z-50 overflow-y-auto">
            <div className="p-6 pt-20">
              <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
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
                          ? 'bg-purple-500/20 text-white'
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
