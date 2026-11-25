import Link from "next/link";
import { generateSampleThreats, DATASET_SOURCE_URL } from "../lib/sampleData";

export default function Home() {
  const threats = generateSampleThreats();
  const active = threats.filter((t) => t.status === "Active").length;
  const critical = threats.filter((t) => t.severity === "Critical").length;

  return (
    <div className="space-y-16">
      <section className="grid gap-10 py-10 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="text-sm text-netflix-lightGray">
            Mini-project &middot; Problem Statement 5
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">
            QuantumShield
          </h1>
          <p className="mt-2 text-lg text-netflix-lightGray">
            Quantum-Inspired Cyber Threat Detection for Digital Signature
            Security
          </p>
          <p className="mt-5 max-w-md text-sm text-netflix-lightGray">
            A working prototype of a teleportation-based Quantum Digital
            Signature (QDS) scheme. Signatures are encoded as Pauli
            eigenstates and verified by projective measurement, with a
            statistical threshold used to flag forgery, impersonation,
            replay, and channel-manipulation attempts &mdash; no AI/ML
            involved, as required by the problem statement.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/sign" className="netflix-button">
              Sign data
            </Link>
            <Link
              href="/quantum"
              className="rounded border border-netflix-gray px-6 py-3 font-semibold text-white transition-colors hover:border-quantum-cyan/60"
            >
              Run the QDS simulator
            </Link>
          </div>
        </div>
        <div className="netflix-card grid grid-cols-2 gap-px overflow-hidden rounded-lg">
          <Stat label="Sample threats logged" value={threats.length.toString()} />
          <Stat label="Currently active" value={active.toString()} />
          <Stat label="Critical severity" value={critical.toString()} />
          <Stat label="QDS attack scenarios" value="4" />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <FeatureCard
          title="Sign"
          body="Generate a SHA-256 hash of your data and sign it in your browser."
          href="/sign"
        />
        <FeatureCard
          title="Verify"
          body="Check a hash and signature against the original data to confirm nothing was altered."
          href="/verify"
        />
        <FeatureCard
          title="Quantum QDS"
          body="Run the teleportation-based signature protocol against forgery, impersonation, replay, and channel-manipulation attacks."
          href="/quantum"
        />
      </section>

      <p className="text-xs text-netflix-lightGray">
        Threat log data shown is generated sample data, used to demonstrate
        the dashboard. Real dataset source:{" "}
        <a
          href={DATASET_SOURCE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-quantum-cyan hover:underline"
        >
          Drive folder
        </a>
        .
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-netflix-black p-6">
      <div className="text-2xl font-bold text-quantum-cyan">{value}</div>
      <div className="mt-1 text-sm text-netflix-lightGray">{label}</div>
    </div>
  );
}

function FeatureCard({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link href={href} className="netflix-card block p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-netflix-lightGray">{body}</p>
    </Link>
  );
}
