'use client'

import { useState } from 'react'
import { FileSignature, CheckCircle, Copy } from 'lucide-react'
import { signDocument, SignedDocument } from '../../../lib/crypto'

export default function SignPage() {
  const [text, setText] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [result, setResult] = useState<SignedDocument | null>(null)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  const handleSign = async () => {
    setError('')
    if (!text.trim()) return
    if (!passphrase) {
      setError('Enter a passphrase — it\'s what makes this a real signature rather than just a hash.')
      return
    }
    setSigning(true)
    try {
      const signed = await signDocument(text, passphrase)
      setResult(signed)
    } finally {
      setSigning(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Sign Document</h1>
        <p className="text-gray-400 mb-8">
          Paste or type text below. It's hashed with SHA-256 and signed with
          HMAC-SHA256 using your passphrase — entirely in your browser.
        </p>

        <div className="netflix-card p-6 mb-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste document text here..."
            rows={8}
            className="w-full bg-netflix-black border border-netflix-gray rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-quantum-cyan"
          />

          <div>
            <label className="block text-sm text-gray-400 mb-2">Passphrase</label>
            <div className="flex items-center gap-2 rounded-lg border border-netflix-gray bg-netflix-black px-3 focus-within:border-quantum-cyan">
              <span className="text-lg" aria-hidden="true">🔒</span>
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Used to derive your signing key"
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
            onClick={handleSign}
            disabled={signing || !text.trim()}
            className="netflix-button inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSignature className="w-5 h-5" />
            {signing ? 'Signing...' : 'Sign Document'}
          </button>
        </div>

        {result && (
          <div className="netflix-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-quantum-green" />
              <h2 className="text-xl font-bold text-white">Signature Created</h2>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Algorithm" value={result.algorithm} />
              <Row label="Document Hash (SHA-256)" value={result.documentHash} mono />
              <Row label="Signature (HMAC-SHA256)" value={result.signature} mono />
              <Row label="Key Fingerprint" value={result.keyFingerprint} mono />
              <Row label="Signed At" value={new Date(result.signedAt).toLocaleString()} />
            </div>

            <button
              onClick={copyResult}
              className="mt-4 flex items-center gap-2 text-sm text-quantum-cyan hover:text-white"
            >
              <Copy className="w-4 h-4" /> Copy signature JSON
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Copy this JSON along with your original text and passphrase,
              then head to Verify to check it — try editing the text first to
              see tamper detection in action.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className={`text-white break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  )
}
