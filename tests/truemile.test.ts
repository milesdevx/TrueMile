import { describe, it, expect, beforeAll } from 'vitest';
import { createRuntime } from '@midnight-ntwrk/compact-runtime';
import { join } from 'path';

const CONTRACT_PATH = join(__dirname, '..', 'managed', 'truemile', 'truemile.compact.js');

describe('TrueMile Wave 1 contract', () => {
  let runtime: any;

  beforeAll(async () => {
    // The compiled contract must exist before tests run.
    runtime = await createRuntime(CONTRACT_PATH);
  });

  it('passes a claim when all criteria are met', async () => {
    const history = {
      accidents: [],
      mileage: 54000,
      serviceEvents: [
        { dealer: true, date: 100 },
        { dealer: true, date: 200 },
        { dealer: false, date: 300 },
      ],
    };

    const criteria = {
      maxMajorAccidents: 0,
      maxMileage: 60000,
      minDealerServiceRatio: 50,
    };

    const [commitment] = await runtime.circuits.submitClaim(criteria, { localVehicleHistory: history });
    const [verified] = await runtime.circuits.verifyClaim(commitment);

    expect(verified).toBe(true);
  });

  it('fails a claim when mileage is too high', async () => {
    const history = {
      accidents: [],
      mileage: 75000,
      serviceEvents: [{ dealer: true, date: 100 }],
    };

    const criteria = {
      maxMajorAccidents: 0,
      maxMileage: 60000,
      minDealerServiceRatio: 50,
    };

    const [commitment] = await runtime.circuits.submitClaim(criteria, { localVehicleHistory: history });
    const [verified] = await runtime.circuits.verifyClaim(commitment);

    expect(verified).toBe(false);
  });

  it('does not place raw history data on the ledger', async () => {
    const history = {
      accidents: [],
      mileage: 54000,
      serviceEvents: [{ dealer: true, date: 100 }],
    };

    const criteria = {
      maxMajorAccidents: 0,
      maxMileage: 60000,
      minDealerServiceRatio: 50,
    };

    await runtime.circuits.submitClaim(criteria, { localVehicleHistory: history });

    const ledgerState = JSON.stringify(runtime.ledger);
    expect(ledgerState).not.toContain('54000');
    expect(ledgerState).not.toContain('serviceEvents');
    expect(ledgerState).not.toContain('accidents');
  });
});
