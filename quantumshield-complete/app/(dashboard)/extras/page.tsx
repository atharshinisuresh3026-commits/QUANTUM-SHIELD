'use client'

import { useState } from 'react'
import { AlertTriangle, Lock, KeyRound, GitBranch, TreePine, Network } from 'lucide-react'
import { generateRSAKeyPair, rsaSign, rsaVerify } from '../../../lib/classicalCrypto'
import { generateAESKey, aesEncrypt, aesDecrypt, AESEncryptedPayload } from '../../../lib/classicalCrypto'
import { buildMerkleTree, getMerkleProof, verifyMerkleProof, MerkleTree } from '../../../lib/merkle'
import { generateSampleThreats } from '../../../lib/sampleData'
import { trainIsolationForest, anomalyScore } from '../../../lib/ml/isolationForest'
import { trainRandomForest, predictRandomForest, TrainingExample } from '../../../lib/ml/randomForest'

export default function ExtrasPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="netflix-card p-6 border-2 border-yellow-500/60 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-yellow-400">Optional / extra content — not the PS-5 solution</h2>
              <p className="text-sm text-gray-300 mt-2">
                PS-5 explicitly requires threat detection <strong>without AI or machine learning</strong>.
                The Isolation Forest and Random Forest below are real, working ML algorithms — genuinely
                trained and tested on this page — but including them as part of a PS-5 submission would
                directly contradict the problem statement. The <a href="/quantum" className="text-quantum-cyan hover:underline">Quantum QDS page</a> is
                the actual PS-5-compliant solution: Pauli eigenstates, projective measurement, and
                statistical thresholding, with no AI/ML involved.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white">Extras</h1>
        <p className="text-gray-400 -mt-4">
          Real, working implementations of the rest of that algorithm table — genuinely
          tested, not decorative. Each is real; none is claimed to be something it isn't
          (e.g. no "post-quantum" or "blockchain" labels on things that aren't).
        </p>

        <RSASection />
        <AESSection />
        <MerkleSection />
        <IsolationForestSection />
        <RandomForestSection />
      </div>
    </div>
  )
}

function RSASection() {
  const [text, setText] = useState('Sign this message with RSA.')
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null)
  const [signature, setSignature] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleGenerateAndSign() {
    setBusy(true)
    setVerifyResult(null)
    try {
      const { keyPair: kp } = await generateRSAKeyPair()
      setKeyPair(kp)
      const sig = await rsaSign(kp.privateKey, text)
      setSignature(sig)
    } finally {
      setBusy(false)
    }
  }

  async function handleVerify(tamperedText?: string) {
    if (!keyPair || !signature) return
    const valid = await rsaVerify(keyPair.publicKey, tamperedText ?? text, signature)
    setVerifyResult(valid)
  }

  return (
    <section className="netflix-card p-6">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-quantum-cyan" /> RSA (RSASSA-PKCS1-v1_5, 2048-bit)
      </h2>
      <p className="text-sm text-gray-400 mb-4">Real key generation and signing via the browser's native Web Crypto API.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-netflix-black border border-netflix-gray rounded-lg p-3 text-white text-sm mb-3 focus:outline-none focus:border-quantum-cyan"
      />
      <div className="flex flex-wrap gap-3">
        <button onClick={handleGenerateAndSign} disabled={busy} className="netflix-button text-sm disabled:opacity-50">
          {busy ? 'Generating...' : 'Generate key & sign'}
        </button>
        <button onClick={() => handleVerify()} disabled={!signature} className="netflix-button text-sm disabled:opacity-30">
          Verify (correct text)
        </button>
        <button onClick={() => handleVerify(text + ' TAMPERED')} disabled={!signature} className="netflix-button text-sm disabled:opacity-30 bg-red-600">
          Verify (tampered text)
        </button>
      </div>
      {signature && (
        <p className="text-xs text-gray-500 mt-3 break-all">Signature: {signature.slice(0, 64)}...</p>
      )}
      {verifyResult !== null && (
        <p className={`text-sm mt-2 font-medium ${verifyResult ? 'text-quantum-green' : 'text-quantum-red'}`}>
          {verifyResult ? '✓ Signature valid' : '✗ Signature invalid'}
        </p>
      )}
    </section>
  )
}

function AESSection() {
  const [text, setText] = useState('Encrypt this with AES-256-GCM.')
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [payload, setPayload] = useState<AESEncryptedPayload | null>(null)
  const [decrypted, setDecrypted] = useState('')

  async function handleEncrypt() {
    const k = await generateAESKey()
    setKey(k)
    const enc = await aesEncrypt(k, text)
    setPayload(enc)
    setDecrypted('')
  }

  async function handleDecrypt() {
    if (!key || !payload) return
    const dec = await aesDecrypt(key, payload)
    setDecrypted(dec)
  }

  return (
    <section className="netflix-card p-6">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <Lock className="w-5 h-5 text-quantum-cyan" /> AES-256-GCM
      </h2>
      <p className="text-sm text-gray-400 mb-4">Real symmetric encryption via Web Crypto — random 256-bit key, random IV per message.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-netflix-black border border-netflix-gray rounded-lg p-3 text-white text-sm mb-3 focus:outline-none focus:border-quantum-cyan"
      />
      <div className="flex gap-3">
        <button onClick={handleEncrypt} className="netflix-button text-sm">Encrypt</button>
        <button onClick={handleDecrypt} disabled={!payload} className="netflix-button text-sm disabled:opacity-30">Decrypt</button>
      </div>
      {payload && <p className="text-xs text-gray-500 mt-3 break-all">Ciphertext: {payload.ciphertextHex.slice(0, 64)}...</p>}
      {decrypted && (
        <p className="text-sm mt-2 text-quantum-green">
          Decrypted: "{decrypted}" — matches original: {decrypted === text ? 'yes' : 'no'}
        </p>
      )}
    </section>
  )
}

function MerkleSection() {
  const [tree, setTree] = useState<MerkleTree | null>(null)
  const [entries, setEntries] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [proofResult, setProofResult] = useState<boolean | null>(null)
  const [tamperTest, setTamperTest] = useState<boolean | null>(null)

  async function handleBuild() {
    const threats = generateSampleThreats(10)
    const logEntries = threats.map((t) => `${t.id}|${t.name}|${t.severity}|${t.detected}`)
    setEntries(logEntries)
    const t = await buildMerkleTree(logEntries)
    setTree(t)
    setProofResult(null)
    setTamperTest(null)
  }

  async function handleVerify() {
    if (!tree) return
    const proof = getMerkleProof(tree, selectedIndex)
    const valid = await verifyMerkleProof(entries[selectedIndex], proof, tree.root)
    setProofResult(valid)
    const tampered = await verifyMerkleProof(entries[selectedIndex] + 'TAMPERED', proof, tree.root)
    setTamperTest(tampered)
  }

  return (
    <section className="netflix-card p-6">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-quantum-cyan" /> Merkle audit log
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        A real hash tree over log entries — a single root hash commits to every entry.
        (Called an audit log, not "blockchain" — there's no distributed network here.)
      </p>
      <button onClick={handleBuild} className="netflix-button text-sm mb-4">Build tree from 10 sample log entries</button>

      {tree && (
        <>
          <p className="text-xs text-gray-500 break-all mb-3">Root: {tree.root}</p>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="bg-netflix-black border border-netflix-gray rounded px-3 py-2 text-white text-sm"
            >
              {entries.map((e, i) => (
                <option key={i} value={i}>Entry {i}: {e.slice(0, 30)}...</option>
              ))}
            </select>
            <button onClick={handleVerify} className="netflix-button text-sm">Generate & verify proof</button>
          </div>
          {proofResult !== null && (
            <div className="text-sm space-y-1">
              <p className={proofResult ? 'text-quantum-green' : 'text-quantum-red'}>
                {proofResult ? '✓ Real entry verifies against root' : '✗ Verification failed'}
              </p>
              <p className={tamperTest ? 'text-quantum-red' : 'text-quantum-green'}>
                {tamperTest ? '✗ Tampered entry incorrectly verified (bug!)' : '✓ Tampered entry correctly rejected'}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function IsolationForestSection() {
  const [results, setResults] = useState<{ id: string; name: string; score: number }[] | null>(null)

  function handleRun() {
    const threats = generateSampleThreats(60)
    const now = Date.now()
    const features = threats.map((t) => [
      t.affectedSystems,
      Math.round((now - new Date(t.detected).getTime()) / 86400000),
    ])
    const forest = trainIsolationForest(features, 100, 32, 11)
    const scored = threats.map((t, i) => ({
      id: t.id,
      name: t.name,
      score: anomalyScore(forest, features[i]),
    }))
    scored.sort((a, b) => b.score - a.score)
    setResults(scored.slice(0, 5))
  }

  return (
    <section className="netflix-card p-6">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <TreePine className="w-5 h-5 text-quantum-cyan" /> Isolation Forest (anomaly detection)
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Real algorithm, trained from scratch on 60 sample threat entries (features: affected
        systems count, days since detection). Flags the entries that isolate fastest — i.e.
        the outliers.
      </p>
      <button onClick={handleRun} className="netflix-button text-sm mb-4">Run on sample threat data</button>
      {results && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left border-b border-netflix-gray">
              <th className="pb-2">Entry</th>
              <th className="pb-2">Anomaly score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b border-netflix-gray/30">
                <td className="py-2 text-white">{r.name} ({r.id})</td>
                <td className="py-2 text-quantum-cyan font-mono">{r.score.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function RandomForestSection() {
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [total, setTotal] = useState(0)

  function handleRun() {
    const threats = generateSampleThreats(200)
    const severityMap: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 }
    const examples: TrainingExample[] = threats.map((t) => ({
      features: [t.affectedSystems, severityMap[t.severity]],
      label: t.status,
    }))
    const trainSet = examples.slice(0, 160)
    const testSet = examples.slice(160)
    const model = trainRandomForest(trainSet, 40, 8, 5)
    let correct = 0
    for (const ex of testSet) {
      if (predictRandomForest(model, ex.features) === ex.label) correct++
    }
    setAccuracy(correct)
    setTotal(testSet.length)
  }

  return (
    <section className="netflix-card p-6">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <Network className="w-5 h-5 text-quantum-cyan" /> Random Forest (classification)
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Real decision-tree ensemble, trained from scratch to predict a threat's status from
        its severity and affected-systems count. Trained on 160 sample entries, tested on 40
        it never saw.
      </p>
      <button onClick={handleRun} className="netflix-button text-sm mb-4">Train & test on sample data</button>
      {accuracy !== null && (
        <p className="text-sm text-quantum-cyan">
          Test accuracy: {accuracy}/{total} = {((100 * accuracy) / total).toFixed(1)}%
        </p>
      )}
    </section>
  )
}
