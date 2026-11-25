export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Status = "Active" | "Contained" | "Resolved";

export interface ThreatEntry {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  status: Status;
  vector: string;
  detected: string; // ISO date
  affectedSystems: number;
  description: string;
}

/**
 * DATA SOURCE
 * Live dataset: https://drive.google.com/drive/folders/1rgGdaPn9rdGZfkaqc3MKVfdCK8r5X_gk
 * ("Public/Open Additional Information Regarding PS")
 * That folder requires a Google sign-in to list files, so it cannot be fetched
 * at build/runtime without credentials. Until it's exported as CSV/JSON and
 * dropped into /public/data, the dashboard runs on the generated sample
 * data below so the UI is fully functional out of the box.
 *
 * To wire in the real dataset:
 * 1. Export the Drive folder contents as CSV/JSON.
 * 2. Save it to /public/data/threats.json (shape: ThreatEntry[]).
 * 3. Replace `generateSampleThreats()` calls with a fetch("/data/threats.json").
 */
export const DATASET_SOURCE_URL =
  "https://drive.google.com/drive/folders/1rgGdaPn9rdGZfkaqc3MKVfdCK8r5X_gk";

const categories = [
  "Ransomware",
  "Phishing",
  "Zero-Day Exploit",
  "Supply Chain",
  "Insider Threat",
  "DDoS",
  "Credential Stuffing",
  "Cryptojacking",
];

const vectors = [
  "Email attachment",
  "Compromised API key",
  "Unpatched CVE",
  "Malicious package",
  "Social engineering",
  "Exposed endpoint",
  "Third-party integration",
  "Brute force",
];

const namePrefixes = [
  "Shadowbyte", "Nullvector", "Cinderlock", "Ghostpatch", "Voidkey",
  "Ironclaw", "Dustveil", "Rustchain", "Emberline", "Frostbind",
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function generateSampleThreats(count = 48, seed = 42): ThreatEntry[] {
  const rand = seededRandom(seed);
  const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
  const statuses: Status[] = ["Active", "Contained", "Resolved"];
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const daysAgo = Math.floor(rand() * 90);
    const detected = new Date(now - daysAgo * 86400000).toISOString().split("T")[0];
    const severity = pick(severities, rand);
    const category = pick(categories, rand);

    return {
      id: `QS-${(1000 + i).toString()}`,
      name: `${pick(namePrefixes, rand)}-${Math.floor(rand() * 900 + 100)}`,
      category,
      severity,
      status: pick(statuses, rand),
      vector: pick(vectors, rand),
      detected,
      affectedSystems: Math.floor(rand() * 400) + 1,
      description: `${category} activity detected via ${pick(vectors, rand).toLowerCase()}, flagged for ${severity.toLowerCase()}-priority review.`,
    };
  }).sort((a, b) => (a.detected < b.detected ? 1 : -1));
}
