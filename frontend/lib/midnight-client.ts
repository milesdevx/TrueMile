// TrueMile Midnight client stub for Wave 1
//
// This module abstracts the connection to the Midnight network and proof server.
// For Wave 1, it provides a deterministic local simulation of the verification
// flow so the UI can be built and tested without a live proof server:
//
//  - submitClaim()  evaluates the claim locally and records the result in a
//                   registry keyed by a commitment.
//  - verifyClaim()  resolves a commitment against that registry only. Unknown
//                   commitments verify as false, mirroring "not on the ledger".
//  - listClaims()   exposes the registry, which stands in for the public
//                   claimCommitments map until the SDK wiring lands.
//
// The data model is already shaped for later Waves even though Wave 1 only
// exposes a bundled verdict: each claim carries an array of per-criterion
// checks, a vehicle-identity commitment, a timestamp, and a schemaVersion.
// Wave 2's multi-claim schema and Wave 3's issuer weighting can then extend
// this shape instead of replacing it.
//
// Registry entries persist to localStorage so the registry page reflects the
// browser's real history. In production, replace these functions with calls to
// the Midnight TypeScript SDK and a long-running proof server, and drop the
// local registry in favour of the on-chain ledger.

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

export type ClaimKey = 'mileage' | 'accidents' | 'service';

export interface ClaimCheck {
  key: ClaimKey;
  label: string;
  passed: boolean;
}

export interface ClaimRecord {
  commitment: string;
  /** Commitment to the vehicle's VIN — the stable identity claims attach to. */
  vehicleId: string;
  verified: boolean;
  /** Per-criterion results. Wave 1 shows one bundled badge; Wave 2 shows these. */
  checks: ClaimCheck[];
  timestamp: number;
  schemaVersion: 'v1';
}

export interface ClaimResult {
  commitment: string;
  vehicleId: string;
  verified: boolean;
  checks: ClaimCheck[];
  timestamp: number;
  schemaVersion: 'v1';
}

/**
 * Real stages of the local proof flow, surfaced so the UI can show what is
 * actually happening instead of a generic "Loading…". When the Midnight SDK
 * lands these become proof-server / network milestones.
 */
export type SubmitStage = 'evaluating' | 'hashing' | 'committing';
export type VerifyStage = 'reading' | 'resolving';

export interface SubmitClaimOptions {
  vin?: string;
  onStage?: (stage: SubmitStage) => void;
}

export interface VerifyClaimOptions {
  onStage?: (stage: VerifyStage) => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY = 'truemile-registry-v1';

/** Deterministic 64-hex digest. A real deployment commits inside the circuit. */
function commitmentHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 + c, 0x85ebca6b);
    h3 = Math.imul(h3 ^ (c + i), 0xc2b2ae35);
    h4 = Math.imul(h4 + (c ^ i), 0x27d4eb2f);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h1 ^ h4) + hex(h2 ^ h3) + hex(h1 + h3) + hex(h2 + h4);
}

function vehicleCommitment(vin: string): string {
  return commitmentHash(`vehicle:${vin.trim().toUpperCase()}`);
}

function evaluateClaim(
  history: VehicleHistory,
  criteria: ClaimCriteria
): { verified: boolean; checks: ClaimCheck[] } {
  const majorAccidents = history.accidents.filter(
    (a) => a.severity === 'Major' || a.severity === 'Total'
  ).length;

  const dealerServices = history.serviceEvents.filter((s) => s.dealer).length;
  const totalServices = history.serviceEvents.length;

  const checks: ClaimCheck[] = [
    { key: 'mileage', label: 'Under max mileage', passed: history.mileage <= criteria.maxMileage },
    {
      key: 'accidents',
      label: 'Within accident limit',
      passed: majorAccidents <= criteria.maxMajorAccidents,
    },
    {
      key: 'service',
      label: 'Meets dealer-service ratio',
      passed:
        totalServices > 0 &&
        (dealerServices * 100) / totalServices >= criteria.minDealerServiceRatio,
    },
  ];

  return { verified: checks.every((check) => check.passed), checks };
}

// In-session stand-in for the on-chain ledger.
const registry = new Map<string, ClaimRecord>();

let initialized = false;

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(registry.values())));
  } catch {
    // Storage disabled — the registry just won't survive a reload.
  }
}

function hydrate() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw) as ClaimRecord[];
    for (const record of stored) {
      if (record?.commitment && !registry.has(record.commitment)) {
        registry.set(record.commitment, record);
      }
    }
  } catch {
    // Corrupt or unavailable storage — start from the seeded example only.
  }
}

// A deterministic example so a first-time visitor can verify something real
// with zero setup (the sandbox mode).
const EXAMPLE_VIN = '1HGBH41JXMN109186';
const EXAMPLE_HISTORY: VehicleHistory = {
  accidents: [],
  mileage: 54000,
  serviceEvents: [
    { dealer: true, date: 100 },
    { dealer: true, date: 100 },
    { dealer: true, date: 100 },
    { dealer: false, date: 100 },
  ],
};
const EXAMPLE_CRITERIA: ClaimCriteria = {
  maxMajorAccidents: 0,
  maxMileage: 60000,
  minDealerServiceRatio: 50,
};
const EXAMPLE_COMMITMENT = commitmentHash(
  JSON.stringify({
    vin: EXAMPLE_VIN,
    history: EXAMPLE_HISTORY,
    criteria: EXAMPLE_CRITERIA,
  })
);

function seedExample() {
  const { verified, checks } = evaluateClaim(EXAMPLE_HISTORY, EXAMPLE_CRITERIA);
  registry.set(EXAMPLE_COMMITMENT, {
    commitment: EXAMPLE_COMMITMENT,
    vehicleId: vehicleCommitment(EXAMPLE_VIN),
    verified,
    checks,
    timestamp: Date.now(),
    schemaVersion: 'v1',
  });
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  hydrate();
  if (!registry.has(EXAMPLE_COMMITMENT)) seedExample();
}

export async function submitClaim(
  history: VehicleHistory,
  criteria: ClaimCriteria,
  options: SubmitClaimOptions = {}
): Promise<ClaimResult> {
  ensureInitialized();
  const vin = options.vin ?? '';

  // In production this would call the Compact proof server via the Midnight SDK.
  options.onStage?.('evaluating');
  await wait(700);

  const { verified, checks } = evaluateClaim(history, criteria);

  options.onStage?.('hashing');
  await wait(300);
  const commitmentInput = JSON.stringify({ vin, history, criteria });
  const commitment = commitmentHash(commitmentInput);

  options.onStage?.('committing');
  const record: ClaimRecord = {
    commitment,
    vehicleId: vehicleCommitment(vin),
    verified,
    checks,
    timestamp: Date.now(),
    schemaVersion: 'v1',
  };
  registry.set(commitment, record);
  persist();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('truemile:claim-issued'));
  }
  await wait(300);

  return record;
}

export async function verifyClaim(
  commitmentValue: string,
  options: VerifyClaimOptions = {}
): Promise<ClaimResult | { commitment: string; verified: false }> {
  ensureInitialized();

  // In production this would query the on-chain ledger state via the Midnight SDK.
  options.onStage?.('reading');
  await wait(300);

  const commitment = commitmentValue.trim().toLowerCase();

  options.onStage?.('resolving');
  await wait(300);

  const record = registry.get(commitment);
  if (!record) return { commitment, verified: false };
  return record;
}

export function listClaims(): ClaimRecord[] {
  ensureInitialized();
  return Array.from(registry.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export interface RegistryStats {
  total: number;
  verified: number;
  failed: number;
  accidentFree: number;
  vehicles: number;
  verifiedPercent: number;
  accidentFreePercent: number;
}

/** Aggregate counts only — nothing here is tied to an individual record. */
export function getRegistryStats(): RegistryStats {
  ensureInitialized();
  const records = Array.from(registry.values());
  const total = records.length;
  const verified = records.filter((record) => record.verified).length;
  const accidentFree = records.filter((record) =>
    record.checks.some((check) => check.key === 'accidents' && check.passed)
  ).length;
  const vehicles = new Set(records.map((record) => record.vehicleId)).size;
  const percent = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return {
    total,
    verified,
    failed: total - verified,
    accidentFree,
    vehicles,
    verifiedPercent: percent(verified),
    accidentFreePercent: percent(accidentFree),
  };
}

export function getExampleCommitment(): string {
  ensureInitialized();
  return EXAMPLE_COMMITMENT;
}

/** The stable vehicle-identity commitment (a VIN commitment) claims attach to. */
export function vehicleIdentity(vin: string): string {
  return vehicleCommitment(vin);
}

export function isValidCommitment(value: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(value.trim());
}
