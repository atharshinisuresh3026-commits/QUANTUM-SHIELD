"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="QuantumShield logo"
              width={48}
              height={48}
              className="rounded-lg"
              priority
            />
            <span className="text-2xl font-bold gradient-text">QuantumShield</span>
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-white text-center">Log in</h1>
        <form onSubmit={handleSubmit} className="netflix-card space-y-4 p-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-netflix-gray bg-netflix-black px-3 focus-within:border-quantum-cyan">
              <span className="text-lg" aria-hidden="true">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-transparent py-3 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="flex items-center gap-2 rounded-lg border border-netflix-gray bg-netflix-black px-3 focus-within:border-quantum-cyan">
              <span className="text-lg" aria-hidden="true">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full bg-transparent py-3 text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-lg text-gray-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {error && <p className="text-quantum-red text-sm">{error}</p>}
          <button type="submit" disabled={busy} className="netflix-button w-full disabled:opacity-50">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-quantum-cyan hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
