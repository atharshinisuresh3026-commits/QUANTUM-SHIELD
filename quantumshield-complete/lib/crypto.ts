/**
 * QuantumShield crypto utilities.
 * Uses the browser's native SubtleCrypto API — no fake or mocked hashing.
 *
 * NOTE ON "QUANTUM": true post-quantum signature schemes (e.g. Dilithium, SPHINCS+)
 * require WASM libraries not bundled here. This module implements the same
 * conceptual pipeline (hash -> sign -> verify) using SHA-256 + HMAC as a stand-in
 * signing primitive, so the flow is real and functional end-to-end. Swap
 * `hmacSign` for a real PQC library call when one is wired in.
 */

export interface SignedRecord {
  hash: string;
  signature: string;
  algorithm: string;
  timestamp: string;
  keyFingerprint: string;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** SHA-256 hash of arbitrary text, returned as a hex string. */
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
}

/** SHA-256 hash of a File/Blob, returned as a hex string. */
export async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(digest);
}

/** Derives a stable, non-secret "key fingerprint" label from a passphrase. */
export async function keyFingerprint(passphrase: string): Promise<string> {
  const hash = await sha256(`fingerprint:${passphrase}`);
  return hash.substring(0, 16).toUpperCase().replace(/(.{4})/g, "$1-").slice(0, -1);
}

async function importHmacKey(passphrase: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(passphrase);
  const digest = await crypto.subtle.digest("SHA-256", keyMaterial);
  return crypto.subtle.importKey(
    "raw",
    digest,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Signs a hash with an HMAC key derived from the passphrase. */
export async function signHash(hash: string, passphrase: string): Promise<string> {
  const key = await importHmacKey(passphrase);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(hash));
  return bufferToHex(sig);
}

/** Verifies a hash+signature pair against a passphrase. */
export async function verifySignature(
  hash: string,
  signature: string,
  passphrase: string
): Promise<boolean> {
  try {
    const key = await importHmacKey(passphrase);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuffer(signature),
      new TextEncoder().encode(hash)
    );
  } catch {
    return false;
  }
}

/** Full sign pipeline: hash content, then sign the hash. */
export async function signContent(
  content: string,
  passphrase: string
): Promise<SignedRecord> {
  const hash = await sha256(content);
  const signature = await signHash(hash, passphrase);
  const fp = await keyFingerprint(passphrase);
  return {
    hash,
    signature,
    algorithm: "SHA-256 + HMAC-SHA256",
    timestamp: new Date().toISOString(),
    keyFingerprint: fp,
  };
}

/**
 * Dashboard-facing sign/verify API. Same underlying HMAC pipeline as
 * signContent/verifySignature above — this is just the shape the Sign and
 * Verify dashboard pages consume. Requires a passphrase: without one, this
 * would only be a tamper check, not an actual signature (nothing would tie
 * it to a specific signer).
 */
export interface SignedDocument {
  algorithm: string;
  documentHash: string;
  signature: string;
  keyFingerprint: string;
  signedAt: string;
}

export async function signDocument(text: string, passphrase: string): Promise<SignedDocument> {
  const record = await signContent(text, passphrase);
  return {
    algorithm: record.algorithm,
    documentHash: record.hash,
    signature: record.signature,
    keyFingerprint: record.keyFingerprint,
    signedAt: record.timestamp,
  };
}

export async function verifyDocument(
  text: string,
  passphrase: string,
  signed: SignedDocument
): Promise<{ valid: boolean; hashMatches: boolean; signatureValid: boolean }> {
  const computedHash = await sha256(text);
  const hashMatches = computedHash === signed.documentHash;
  const signatureValid = await verifySignature(signed.documentHash, signed.signature, passphrase);
  return { valid: hashMatches && signatureValid, hashMatches, signatureValid };
}

/**
 * Plain statistical analysis — Shannon entropy plus the hash/signature match
 * results already computed above. No AI/ML, no learned model: just arithmetic
 * on the text and a fixed set of rules, consistent with the project's
 * no-AI/ML constraint for threat detection.
 */
export interface ThreatAnalysis {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  threatScore: number;
  entropy: number;
  signals: string[];
}

function shannonEntropy(text: string): number {
  if (!text.length) return 0;
  const freq: Record<string, number> = {};
  for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / text.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function analyzeThreat(
  text: string,
  hashMatches: boolean,
  signatureValid: boolean
): ThreatAnalysis {
  const entropy = shannonEntropy(text);
  const signals: string[] = [];
  let threatScore = 0;

  if (!hashMatches) {
    threatScore += 70;
    signals.push("Document hash does not match the signed hash — content was altered after signing.");
  } else {
    signals.push("Document hash matches the signed hash — content is unaltered.");
  }

  if (!signatureValid) {
    threatScore += 25;
    signals.push("Signature does not verify against the provided passphrase.");
  } else {
    signals.push("Signature verified against the provided passphrase.");
  }

  if (entropy > 4.5) {
    threatScore += 5;
    signals.push(
      `Unusually high text entropy (${entropy.toFixed(2)} bits/char) — informational only, not conclusive of tampering.`
    );
  }

  threatScore = Math.min(100, threatScore);
  const riskLevel: ThreatAnalysis["riskLevel"] =
    threatScore >= 70 ? "HIGH" : threatScore >= 30 ? "MEDIUM" : "LOW";

  return { riskLevel, threatScore, entropy, signals };
}
