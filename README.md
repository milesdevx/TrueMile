<div align="center">

# TrueMile

**Prove what matters. Hide what doesn't.**

Privacy-preserving vehicle history verification, built on [Midnight](https://midnight.network).

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Compact](https://img.shields.io/badge/Compact-compiles-C98A2C.svg)]()
[![Built with Midnight](https://img.shields.io/badge/built%20with-Midnight-1F6F63.svg)](https://midnight.network)

**[Live App](https://truemile-mu.vercel.app) · [Demo Video](#) · [Slide Deck](#)**

</div>

---

## What It Does

A seller proves a vehicle's mileage, accident history, and service record meet a specific claim — e.g. *"no major accidents, under 60,000 miles, dealer-serviced"* — without exposing the underlying VIN history report to every casual browser. A buyer verifies the claim is cryptographically true, then commits a deposit to unlock the full record *(Wave 2)*.

> **Why it's private:** the seller's actual history data never leaves their local environment. It's modeled as `witness` data in Midnight's Compact language — only a verified pass/fail claim, tied to a commitment hash, is written to the public `ledger`. Nothing crosses that boundary without an explicit `disclose()` call.

## Live Demo

| | |
|---|---|
| 🚀 **Live App** | [truemile-mu.vercel.app](https://truemile-mu.vercel.app) |
| 🎥 **Demo Video** | *(add your YouTube/Loom/Drive link)* |
| 📊 **Slide Deck** | *(add your Google Slides/Canva link)* |

## How It Works

```
  SELLER                                          BUYER
    │                                                │
    │  1. Enter real mileage/accident/               │
    │     service data locally (witness)             │
    ▼                                                │
  submitClaim(criteria)                              │
    │                                                │
    │  2. Circuit checks data against claim,          │
    │     discloses only (commitment, result)         │
    ▼                                                ▼
  ┌─────────────────────────────────────┐   verifyClaim(commitment)
  │  LEDGER (public)                      │◄────────┘
  │  commitment → { verified, timestamp } │
  └─────────────────────────────────────┘
                                                      │
                                                      │  (Wave 2) Buyer commits
                                                      ▼      deposit
                                              commitDeposit(commitment)
                                                      │
                                                      │  (Wave 2) Full history
                                                      ▼      unlocks
                                              unlockHistory(commitment)
```

> **Wave 1 status:** the hosted app runs a deterministic in-browser simulation of this flow (`frontend/lib/midnight-client.ts`) — claims are evaluated locally, keyed by a SHA-256 commitment in a session registry. The Compact circuit above is the production target; wiring the SDK + proof server is the next integration step.

## Architecture

| Layer | Location | Holds |
|---|---|---|
| `ledger` | On-chain, public | Claim commitments, verified status, timestamps — never raw history data |
| `witness` | Off-chain, local to seller | The actual mileage, accident count, and service record |
| `circuit` | Compiled, ZK-proven | Evaluates witness against claim criteria, `disclose()`s only the result |

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contract | Compact (Midnight toolchain) — `contracts/truemile.compact` |
| Contract testing | `@midnight-ntwrk/compact-runtime` + Vitest |
| Frontend | Next.js 15 (App Router, static export) + TypeScript |
| Styling | Tailwind CSS + custom "Sealed Title" design system |
| Blockchain integration | Midnight TypeScript SDK *(planned — Wave 1 simulates it)* |
| Hosting (frontend) | Vercel — [truemile-mu.vercel.app](https://truemile-mu.vercel.app) |
| Hosting (proof server) | Fly.io / Render *(planned — Wave 2)* |
| License | Apache License 2.0 |

## Getting Started

```bash
# Clone and install (npm workspaces — one lockfile at the root)
git clone https://github.com/milesdevx/TrueMile.git
cd TrueMile
npm install

# Run the frontend (Wave 1 needs no Midnight node or env vars)
npm run dev        # → http://localhost:3000

# Production static export
npm run build      # → frontend/dist
```

> **Contract toolchain (optional, for Wave 1 circuit work):** `compact compile` and `@midnight-ntwrk/compact-runtime` come from the Midnight registry. With them installed:

```bash
npm run compile    # contracts → managed/truemile
npm test           # vitest against the compiled circuits
```

## Testing

```bash
npm test
```

Runs the contract suite against the **real compiled Compact circuits** via `@midnight-ntwrk/compact-runtime` — covering a passing claim, a claim that fails on one criterion, and an assertion that raw history data never appears in ledger state. *(Requires the Midnight toolchain and a prior `npm run compile`; see above.)*

## What Changed This Wave (Wave 1)

- Compact `submitClaim` / `verifyClaim` circuits with full privacy model (`witness` data, explicit `disclose()`)
- Seller/Buyer Next.js app — "Sealed Title" document-style UI with redaction motif and verified-stamp moment
- Deterministic local simulation of the proof flow so the UI ships end-to-end today
- Deployed to Vercel: [truemile-mu.vercel.app](https://truemile-mu.vercel.app)

## Roadmap

| Wave | Focus |
|---|---|
| Wave 1 ✅ | Core claim submission and verification circuit, Seller/Buyer views |
| Wave 2 | Deposit-gated history unlock, claim expiry, multi-claim schema |
| Wave 3 | Security audit, issuer trust weighting, business viability, final polish |

## License

Licensed under the [Apache License 2.0](./LICENSE).
