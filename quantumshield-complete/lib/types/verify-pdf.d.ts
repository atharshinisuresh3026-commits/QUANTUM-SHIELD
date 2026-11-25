declare module "@jonz94/verify-pdf" {
  interface CertInfo {
    issuedBy?: string;
    issuedTo?: string;
    validityPeriod?: { start: Date | string; end: Date | string };
    pemCertificate?: string;
    clientCertificate?: boolean;
  }
  interface SignatureInfo {
    certs?: CertInfo;
    signatureMeta?: {
      reason?: string;
      contactInfo?: string;
      location?: string;
      name?: string;
    };
  }
  interface VerifyResult {
    verified: boolean;
    authenticity: boolean;
    integrity: boolean;
    expired: boolean;
    signatures: SignatureInfo[];
  }
  function verifyPDF(buffer: Buffer): VerifyResult;
  export default verifyPDF;
}
