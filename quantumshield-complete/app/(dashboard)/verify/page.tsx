'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { verifyDocument, analyzeThreat, SignedDocument, ThreatAnalysis } from '../../../lib/crypto'

export default function VerifyPage() {
  const [text, setText] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [signatureJson, setSignatureJson] = useState('')
  const [result, setResult] = useState<{ valid: boolean; threat: ThreatAnalysis } | null>(null)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    setError('')
    setResult(null)
    let signed: SignedDocument
    try {
      signed = JSON.parse(signatureJson)
    } catch {
      setError('That signature JSON is not valid — paste exactly what Sign gave you.')
      return
    }
    if (!passphrase) {
      setError('Enter the same passphrase that was used to sign this document.')
      return
    }
    setVerifying(true)
    try {
      const { valid, hashMatches, signatureValid } = await verifyDocument(text, passphrase, signed)
      const threat = analyzeThreat(text, hashMatches, signatureValid)
      setResult({ valid, threat })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Verify Signature</h1>
        <p className="text-gray-400 mb-8">
          Paste the document text, the signature JSON, and the passphrase used
          to sign it. Try editing the text before verifying — tamper detection
          will flag it immediately.
        </p>

        <div className="netflix-card p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Document text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full bg-netflix-black border border-netflix-gray rounded-lg p-4 text-white focus:outline-none focus:border-quantum-cyan"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Signature JSON</label>
            <textarea
              value={signatureJson}
              onChange={(e) => setSignatureJson(e.target.value)}
              rows={5}
              className="w-full bg-netflix-black border border-netflix-gray rounded-lg p-4 text-white font-mono text-xs focus:outline-none focus:border-quantum-cyan"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Passphrase</label>
            <div className="flex items-center gap-2 rounded-lg border border-netflix-gray bg-netflix-black px-3 focus-within:border-quantum-cyan">
              <span className="text-lg" aria-hidden="true">🔒</span>
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Same passphrase used to sign"
                className="w-full bg-transparent py-3 text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase((v) => !v)}
                aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                className="text-lg text-gray-400 hover:text-white"
              >
                {showPassphrase ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="text-quantum-red text-sm">{error}</p>}
          <button
            onClick={handleVerify}
            disabled={verifying || !text.trim() || !signatureJson.trim()}
            className="netflix-button inline-flex items-center gap-2 disabled:opacity-40"
          >
            {verifying ? 'Verifying...' : 'Verify & Analyze'}
          </button>
        </div>

        {result && (
          <div className="netflix-card p-6">
            <div className="flex items-center gap-2 mb-4">
              {result.valid ? (
                <ShieldCheck className="w-6 h-6 text-quantum-green" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-quantum-red" />
              )}
              <h2 className="text-xl font-bold text-white">
                {result.valid ? 'Signature Verified' : 'Verification Failed'}
              </h2>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div>
                <span className="text-gray-500">Risk Level: </span>
                <span
                  className={
                    result.threat.riskLevel === 'LOW'
                      ? 'text-quantum-green'
                      : result.threat.riskLevel === 'MEDIUM'
                      ? 'text-quantum-yellow'
                      : 'text-quantum-red'
                  }
                >
                  {result.threat.riskLevel}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Threat Score: </span>
                <span className="text-white">{result.threat.threatScore}/100</span>
              </div>
              <div>
                <span className="text-gray-500">Text Entropy: </span>
                <span className="text-white">{result.threat.entropy.toFixed(2)} bits/char</span>
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-sm mb-2">Signals</div>
              <ul className="space-y-1 text-sm">
                {result.threat.signals.map((s, i) => (
                  <li key={i} className="text-gray-300">• {s}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              This is plain statistics — hash/signature match plus text
              entropy — not AI or machine learning.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
