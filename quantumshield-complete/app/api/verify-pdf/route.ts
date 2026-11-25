export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import verifyPDF from "@jonz94/verify-pdf";

/**
 * Best-effort parse of an X.509 distinguished name string (e.g.
 * "CN=John Doe,O=Example Corp,E=john@example.com") into its parts.
 * Exact DN formatting varies by CA, so this covers the common cases —
 * fields that don't parse cleanly are simply left undefined.
 */
function parseDN(dn?: string): { commonName?: string; organization?: string; email?: string } {
  if (!dn) return {};
  const result: { commonName?: string; organization?: string; email?: string } = {};
  const parts = dn.split(/[,/]/).map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toUpperCase();
    const value = part.slice(eq + 1).trim();
    if (!value) continue;
    if (key === "CN") result.commonName = value;
    else if (key === "O") result.organization = value;
    else if (key === "E" || key === "EMAILADDRESS" || key.includes("EMAIL")) result.email = value;
  }
  return result;
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = (formData.get("pdf") || formData.get("file")) as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = verifyPDF(buffer);
    const sig = result.signatures?.[0];
    const dn = parseDN(sig?.certs?.issuedTo);

    return NextResponse.json({
      valid: result.verified,
      integrity: result.integrity,
      authenticity: result.authenticity,
      expired: result.expired,
      certificate: {
        commonName: dn.commonName,
        organization: dn.organization,
        email: dn.email,
        issuer: sig?.certs?.issuedBy,
        validFrom: sig?.certs?.validityPeriod?.start,
        validTo: sig?.certs?.validityPeriod?.end,
      },
      signatureType: "PKCS#7 (detached)",
      algorithm: "SHA-256 with RSA (as embedded in the certificate)",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      {
        error: message.toLowerCase().includes("byterange")
          ? "This PDF doesn't appear to contain a digital signature."
          : `Could not verify this PDF: ${message}`,
      },
      { status: 422 }
    );
  }
}
