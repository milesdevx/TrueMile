// TrueMile Midnight client stub for Wave 1
//
// This module abstracts the connection to the Midnight network and proof server.
// For Wave 1, it provides a deterministic local simulation of the verification
// flow so the UI can be built and tested without a live proof server:
//
//  - submitClaim()  evaluates the claim locally and records the result in an
//                   in-session registry keyed by a SHA-256 commitment.
//  - verifyClaim()  resolves a commitment against that registry only. Unknown
//                   commitments verify as false, mirroring "not on the ledger".
//
// The registry lives in the browser session, so seller and buyer flows must
// run in the same tab. In production, replace these functions with calls to
// the Midnight TypeScript SDK and a long-running proof server, and drop the
// session registry in favour of the on-chain ledger.

export interface VehicleHistory {
  accidents: { severity: 'None' | 'Minor' | 'Major' | 'Total'; date: number }[];
  mileage: number;
  serviceEvents: { dealer: boolean; date: number }[];
}

export interface ClaimCriteria {
  maxMajorAccidents: number;
  maxMileage: number;
  minDealerServiceRatio: number;
}

export interface ClaimResult {
  commitment: string;
  verified: boolean;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const encoder = new TextEncoder();

function normalizeCommitment(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Deterministic SHA-256 commitment for the simulation.
 *
 * Uses the Web Crypto API when available (browser / secure context) and falls
 * back to a non-cryptographic hash for non-secure contexts. A real deployment
 * must generate the commitment inside the Compact circuit instead.
 */
async function digestCommitment(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(input));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    h1 = (Math.imul(h1, 31) + char) | 0;
    h2 = (Math.imul(h2, 33) + input.charCodeAt(input.length - 1 - i)) | 0;
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `${toHex(h1)}${toHex(h2)}`.padEnd(64, '0');
}

function evaluateClaim(history: VehicleHistory, criteria: ClaimCriteria): boolean {
  const majorAccidents = history.accidents.filter(
    (a) => a.severity === 'Major' || a.severity === 'Total'
  ).length;

  const dealerServices = history.serviceEvents.filter((s) => s.dealer).length;
  const totalServices = history.serviceEvents.length;

  const mileageOk = history.mileage <= criteria.maxMileage;
  const accidentOk = majorAccidents <= criteria.maxMajorAccidents;
  const serviceRatioOk =
    totalServices > 0 && (dealerServices * 100) / totalServices >= criteria.minDealerServiceRatio;

  return mileageOk && accidentOk && serviceRatioOk;
}

// In-session stand-in for the on-chain ledger.
const issuedCommitments = new Map<string, boolean>();

export async function submitClaim(
  history: VehicleHistory,
  criteria: ClaimCriteria
): Promise<ClaimResult> {
  // In production this would call the Compact proof server via the Midnight SDK.
  await wait(1200);

  const verified = evaluateClaim(history, criteria);
  const commitmentInput = JSON.stringify({ history, criteria });
  const commitment = await digestCommitment(commitmentInput);
  issuedCommitments.set(commitment, verified);

  return { commitment, verified };
}

export async function verifyClaim(commitmentValue: string): Promise<ClaimResult> {
  // In production this would query the on-chain ledger state via the Midnight SDK.
  await wait(600);

  const commitment = normalizeCommitment(commitmentValue);
  const verified = issuedCommitments.get(commitment) ?? false;
  return { commitment, verified };
}

export function isValidCommitment(value: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(value.trim());
}
