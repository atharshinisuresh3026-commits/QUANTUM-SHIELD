"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Shield, Calendar, User, Building, Mail } from "lucide-react";

export default function VerifyPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError("Please select a valid PDF file");
    }
  }

  async function handleVerify() {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/verify-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Failed to verify PDF. Please try again.");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError("Please drop a valid PDF file");
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
            Verify a signed PDF
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Checks a PDF's embedded digital signature — the same PKCS#7/X.509 mechanism
            used by Certifying-Authority-issued signatures (e.g. eMudhra, DSC-signed documents)
            — and reads the signer's certificate.
          </p>
        </div>

        <div className="netflix-card p-6 md:p-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all cursor-pointer ${
              file
                ? "border-green-500 bg-green-500/5"
                : "border-zinc-700 bg-zinc-900/50 hover:border-purple-500 hover:bg-purple-500/5"
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                {file ? (
                  <>
                    <FileText className="w-16 h-16 md:w-20 md:h-20 text-green-500" />
                    <div>
                      <p className="text-lg md:text-xl font-semibold text-white break-all">{file.name}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        setResult(null);
                        setError(null);
                      }}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Choose different file
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 md:w-20 md:h-20 text-gray-500" />
                    <div>
                      <p className="text-lg md:text-xl font-semibold text-white mb-1">
                        Click to upload PDF
                      </p>
                      <p className="text-sm text-gray-400">
                        or drag and drop
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300">PKCS#7</span>
                      <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300">X.509</span>
                      <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300">eMudhra</span>
                      <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300">DSC</span>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleVerify}
              disabled={!file || verifying}
              className="netflix-button px-8 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {verifying ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying PDF...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify PDF
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="netflix-card p-6 bg-red-500/10 border border-red-500/50">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400 mb-1">Verification Failed</h3>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && result.valid && (
          <div className="netflix-card p-6 bg-green-500/10 border border-green-500/50">
            <div className="flex items-start gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-1">Signature Valid</h3>
                <p className="text-sm text-green-300">This PDF has a valid digital signature</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Certificate Information
                </h4>
                <div className="space-y-3">
                  <InfoRow icon={User} label="Signer" value={result.certificate?.commonName || "Unknown"} />
                  <InfoRow icon={Building} label="Organization" value={result.certificate?.organization || "N/A"} />
                  <InfoRow icon={Mail} label="Email" value={result.certificate?.email || "N/A"} />
                  <InfoRow icon={Shield} label="Issuer" value={result.certificate?.issuer || "N/A"} />
                  <InfoRow icon={Calendar} label="Valid From" value={result.certificate?.validFrom ? new Date(result.certificate.validFrom).toLocaleDateString() : "N/A"} />
                  <InfoRow icon={Calendar} label="Valid Until" value={result.certificate?.validTo ? new Date(result.certificate.validTo).toLocaleDateString() : "N/A"} />
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Signature Details
                </h4>
                <div className="space-y-3">
                  <InfoRow label="Type" value={result.signatureType || "PKCS#7"} mono />
                  <InfoRow label="Algorithm" value={result.algorithm || "SHA-256 with RSA"} mono />
                  <InfoRow label="Signed Date" value={result.signedDate ? new Date(result.signedDate).toLocaleString() : "N/A"} />
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !result.valid && (
          <div className="netflix-card p-6 bg-yellow-500/10 border border-yellow-500/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">Signature Information</h3>
                <p className="text-sm text-yellow-300 mb-4">{result.error || "Signature details extracted"}</p>
                {result.reason && <p className="text-sm text-gray-400 mb-4">{result.reason}</p>}

                {result.certificate && (
                  <div className="mt-4 space-y-3 bg-zinc-900/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Extracted Information:</h4>
                    <InfoRow label="Signer" value={result.certificate.commonName || "N/A"} small />
                    <InfoRow label="Type" value={result.signatureType || "N/A"} small />
                    <InfoRow label="Algorithm" value={result.algorithm || "N/A"} small />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEMPORARY DEBUG BLOCK — shows the raw API response so we can fix
            certificate-field parsing against real data. Safe to delete once
            that's sorted out. */}
        {result && (
          <details className="netflix-card p-6">
            <summary className="cursor-pointer text-sm text-quantum-cyan">
              Debug: raw API response (click to expand, then copy this to Claude)
            </summary>
            <pre className="mt-4 whitespace-pre-wrap break-all text-xs text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )}

        <div className="netflix-card p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Supported Signature Formats
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "PKCS#7 (adbe.pkcs7.sha1)", supported: true },
              { name: "PKCS#7 Detached (adbe.pkcs7.detached)", supported: true },
              { name: "X.509 Certificates", supported: true },
              { name: "eMudhra DSC", supported: true },
              { name: "Adobe CDS", supported: true },
              { name: "PAdES", supported: true },
            ].map((format) => (
              <div key={format.name} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-800/50 transition-colors">
                {format.supported ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-300">{format.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false, small = false }: any) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className={`${small ? 'text-xs' : 'text-sm'} text-gray-400 flex items-center gap-2`}>
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
      <span className={`${small ? 'text-xs' : 'text-sm'} text-white font-medium text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
