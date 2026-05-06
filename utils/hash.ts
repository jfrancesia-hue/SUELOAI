/**
 * Genera un hash SHA-256 de cualquier string/objeto
 * Compatible con browser (Web Crypto API) y Node.js (crypto module)
 */
export async function generateHash(data: string | object): Promise<string> {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(text);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const crypto = require('crypto');
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Verifica si un hash corresponde a los datos dados
 */
export async function verifyHash(data: string | object, expectedHash: string): Promise<boolean> {
  const computedHash = await generateHash(data);
  return computedHash === expectedHash;
}

/**
 * Snapshot JSON determinístico para hashear contratos
 * Los campos se ordenan alfabéticamente para garantizar consistencia
 */
export function createContractSnapshot(params: {
  investorName: string;
  investorDni: string;
  projectTitle: string;
  amount: number;
  tokens: number;
  date: string;
}): string {
  const snapshot = {
    amount: params.amount,
    date: params.date,
    investor_dni: params.investorDni,
    investor_name: params.investorName,
    project_title: params.projectTitle,
    tokens: params.tokens,
  };
  return JSON.stringify(snapshot);
}
