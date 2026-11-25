"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/sign", label: "Sign" },
  { href: "/verify", label: "Verify" },
  { href: "/verify-pdf", label: "Verify PDF" },
  { href: "/threats", label: "Threats" },
  { href: "/analytics", label: "Analytics" },
  { href: "/quantum", label: "Quantum QDS" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-netflix-gray/40 bg-netflix-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="QuantumShield logo"
            width={32}
            height={32}
            className="rounded"
            priority
          />
          <span className="text-xl font-bold tracking-tight gradient-text">
            QuantumShield
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-netflix-gray text-quantum-cyan"
                    : "text-netflix-lightGray hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="ml-2 flex items-center gap-2 border-l border-netflix-gray/40 pl-3">
            {user ? (
              <>
                <span className="text-sm text-netflix-lightGray">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded px-3 py-2 text-sm font-medium text-netflix-lightGray transition-colors hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded px-3 py-2 text-sm font-medium text-netflix-lightGray transition-colors hover:text-white"
                >
                  Log in
                </Link>
                <Link href="/register" className="netflix-button px-4 py-2 text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
