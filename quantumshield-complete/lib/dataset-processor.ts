import Papa from 'papaparse'

export interface SignatureData {
  id: string
  timestamp: number
  signature_type: 'RSA' | 'Dilithium' | 'SPHINCS+' | 'Hybrid'
  is_legitimate: boolean
  entropy: number
  signing_time_ms: number
  threat_score: number
}

export class DatasetProcessor {
  private static instance: DatasetProcessor
  private signatureData: SignatureData[] = []
  private isLoaded = false

  private constructor() {}

  static getInstance(): DatasetProcessor {
    if (!DatasetProcessor.instance) {
      DatasetProcessor.instance = new DatasetProcessor()
    }
    return DatasetProcessor.instance
  }

  async loadDataset() {
    if (this.isLoaded) return
    try {
      const res = await fetch('/datasets/signature_info.csv')
      const text = await res.text()
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          this.signatureData = results.data as SignatureData[]
          this.isLoaded = true
        },
      })
    } catch {
      this.generateSyntheticData()
    }
  }

  generateSyntheticData() {
    for (let i = 0; i < 5000; i++) {
      const isLegitimate = Math.random() > 0.1
      this.signatureData.push({
        id: `SIG_${i}`,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        signature_type: (['RSA', 'Dilithium', 'SPHINCS+', 'Hybrid'] as const)[
          Math.floor(Math.random() * 4)
        ],
        is_legitimate: isLegitimate,
        entropy: isLegitimate ? 6.5 + Math.random() : 8 + Math.random() * 0.5,
        signing_time_ms: isLegitimate ? 30 + Math.random() * 50 : Math.random() * 10,
        threat_score: isLegitimate ? Math.random() * 30 : 60 + Math.random() * 40,
      })
    }
    this.isLoaded = true
  }

  getStatistics() {
    const total = this.signatureData.length
    const legitimate = this.signatureData.filter((s) => s.is_legitimate).length
    return {
      total,
      legitimate,
      threatened: total - legitimate,
      legitimateRate: total ? ((legitimate / total) * 100).toFixed(2) + '%' : '0%',
    }
  }
}

export const datasetProcessor = DatasetProcessor.getInstance()
