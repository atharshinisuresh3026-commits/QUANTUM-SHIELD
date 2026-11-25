/**
 * Real RSA (RSASSA-PKCS1-v1_5) and AES-256-GCM, both via the browser's
 * native Web Crypto API — same trust basis as the SHA-256/HMAC code
 * elsewhere in this project. No hand-rolled cryptographic primitives.
 */

export interface RSAKeyPairExport {
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
}

export async function generateRSAKeyPair(): Promise<{
  keyPair: CryptoKeyPair;
  exported: RSAKeyPairExport;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return { keyPair, exported: { publicKeyJwk, privateKeyJwk } };
}

export async function rsaSign(privateKey: CryptoKey, message: string): Promise<string> {
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(message)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function rsaVerify(
  publicKey: CryptoKey,
  message: string,
  signatureHex: string
): Promise<boolean> {
  const sigBytes = new Uint8Array(
    signatureHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    sigBytes,
    new TextEncoder().encode(message)
  );
}

export async function importRSAPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["sign"]
  );
}

export async function importRSAPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["verify"]
  );
}

export interface AESEncryptedPayload {
  ciphertextHex: string;
  ivHex: string;
}

export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function hexToBuf(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

export async function aesEncrypt(key: CryptoKey, plaintext: string): Promise<AESEncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { ciphertextHex: bufToHex(ciphertext), ivHex: bufToHex(iv) };
}

export async function aesDecrypt(key: CryptoKey, payload: AESEncryptedPayload): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBuf(payload.ivHex) },
    key,
    hexToBuf(payload.ciphertextHex)
  );
  return new TextDecoder().decode(plaintext);
}

export async function exportAESKeyRaw(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bufToHex(raw);
}

export async function importAESKeyRaw(hex: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", hexToBuf(hex), { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}
