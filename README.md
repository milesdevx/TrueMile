<div align="center">

# 🔏 Project TrueMile
### Development Roadmap — Private Vehicle History Verification, Built on Midnight

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Built with Midnight](https://img.shields.io/badge/built%20with-Midnight-1F6F63.svg)](https://midnight.network)
[![Grant Pool](https://img.shields.io/badge/Grant%20Pool-%2412%2C500-C98A2C.svg)]()
[![Status](https://img.shields.io/badge/Wave%201-in%20progress-9C978C.svg)]()

**[Live App](https://truemile-mu.vercel.app) · [Repo](https://github.com/milesdevx/TrueMile)**

</div>

---

> *"Prove what matters. Hide what doesn't."*
>
> TrueMile lets a seller prove a vehicle's mileage, accident, and service history meets a specific claim — e.g. **"no major accidents, under 60,000 miles, dealer-serviced"** — without exposing the underlying VIN report to every casual browser. A buyer verifies the claim is cryptographically true, then commits a deposit to unlock the full record.
>
> The privacy guarantee is enforced by cryptography, not platform policy: the seller's raw history data never leaves their local environment. Only a verified pass/fail claim, tied to a commitment hash, ever touches the public ledger.

## 🗺️ Roadmap at a Glance

```
  ●━━━━━━━━━━━━━━━━━━━━━●━ ─ ─ ─ ─ ─ ─ ●─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─○
  WAVE 1                 WAVE 2                          WAVE 3
  Foundation              Expansion                        Maturity
  $3,500                  $4,000                           $5,000
  🔎 Verify a claim       🔐 Deposit-gated unlock          🛡️ Audit + adoption
```

| | Wave 1 — Foundation | Wave 2 — Expansion | Wave 3 — Maturity |
|---|---|---|---|
| **Grant Pool** | $3,500 | $4,000 | $5,000 |
| **Core Deliverable** | Claim verification circuit | Deposit-gated unlock | Security audit + business case |
| **Status** | 🟢 In progress | ⚪ Planned | ⚪ Planned |

---

## 📋 Table of Contents
1. [Official Submission Requirements Compliance](#1-official-submission-requirements-compliance)
2. [Architectural Priorities](#2-architectural-priorities)
3. [Local Development & Vercel Compatibility](#3-local-development--vercel-compatibility)
4. [🌊 Wave 1 — Foundation](#4-🌊-wave-1--foundation)
5. [🌊 Wave 2 — Expansion](#5-🌊-wave-2--expansion)
6. [🌊 Wave 3 — Maturity](#6-🌊-wave-3--maturity)
7. [Cross-Wave Risk Notes](#7-cross-wave-risk-notes)

---

## 1. Official Submission Requirements Compliance

Per the Buildathon's Official Rules, the following must be true at every Wave's Submission Deadline. This table exists so nothing is discovered missing at submission time.

| Requirement | 🌊 Wave 1 | 🌊 Wave 2 | 🌊 Wave 3 |
|---|:---:|:---:|:---:|
| Public GitHub repository link | ✅ | ✅ | ✅ |
| `midnightntwrk` GitHub label | ✅ | ✅ | ✅ |
| README — explanation, setup, architecture, Midnight integration, how to test | ✅ | ✅ updated | ✅ updated |
| Slide deck (pitch presentation) | ✅ | ✅ updated | ✅ final |
| Demo / video pitch | ✅ | ✅ new | ✅ final |
| Description of progress this Wave | ✅ | ✅ | ✅ |
| Explicit "what changed since last Wave" | — | ✅ **required** | ✅ **required** |
| Apache 2.0 on all new/extended Midnight code | ✅ | ✅ | ✅ |
| **Technical Gate:** contract compiles | ✅ | ✅ | ✅ |
| **Technical Gate:** meaningful, original functionality | ✅ | ✅ | ✅ |

> ⚠️ **A missing item in any row is a submission-blocking gap, not a minor omission.** The compiling contract, the `midnightntwrk` tag, and the Wave 2/3 "what changed" explanation are explicit Technical Gate / Official Rules conditions — their absence can mean that Wave isn't judged at all.

---

## 2. Architectural Priorities

Three non-negotiable priorities, applied consistently across all three Waves.

### 🎨 2.1 High-End, Modern Web UI/UX
- A polished, trustworthy interface is functional here, not cosmetic — the product replaces trust in a middleman with trust in a system, and the UI has to *look* like that's true.
- Distinct role-based views (**Seller** / **Buyer**) with clear visual treatment for "claim verified" vs. "full history unlocked" states.
- Responsive, accessible by default — contrast, keyboard navigation, ARIA labeling on custom components.
- Motion used purposefully: proof generation and on-chain verification aren't instant, so loading states must feel deliberate, not broken.

### 🔒 2.2 Robust Security Protocols
- Strict adherence to Midnight's three-layer Compact model — raw vehicle history is `witness` (private, local), **never** `ledger` (public, on-chain).
- Every value derived from `witness` data passes through an explicit, audited `disclose()` call before reaching the ledger — nothing crosses that boundary implicitly.
- Deposit-gated unlock is access control *layered on top of* the verification circuit, not a substitute for it — the core privacy guarantee holds regardless of deposit status.
- No wallet credentials, private keys, or proof-server tokens exposed client-side or committed to source control.
- Dependency and contract review at the end of every Wave, not just at final submission.

### ⚙️ 2.3 Optimized Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Smart contract | Compact (Midnight toolchain) | Native `ledger`/`witness`/`disclose()` primitives |
| Contract testing | `@midnight-ntwrk/compact-runtime` + Vitest | Runs real compiled circuits, not mocks |
| Frontend | Next.js 15 (App Router) + TypeScript | First-class Vercel support |
| Styling | Tailwind CSS + custom design system | Accessible primitives, distinct visual identity |
| Blockchain integration | Midnight TypeScript SDK | Wallet connection, tx submission, proof coordination |
| Package management | npm workspaces | One lockfile, `contracts/` + `frontend/` monorepo |
| Hosting (frontend) | Vercel | Native Next.js support, env var management |
| Hosting (proof server) | Fly.io / Render | Vercel can't run a long-running proof server — see [§7](#7-cross-wave-risk-notes) |
| License | Apache License 2.0 | Required for all new Midnight-related code |

---

## 3. Local Development & Vercel Compatibility

### Project Structure
```
truemile/
├── contracts/
│   └── truemile.compact
├── managed/                    # compiler output — gitignored
├── tests/
│   └── truemile.test.ts
├── frontend/                   # Next.js app — static export to frontend/dist
│   ├── app/
│   │   ├── page.tsx            # landing — document-style hero
│   │   ├── seller/page.tsx     # submit claim, generate proof
│   │   ├── buyer/page.tsx      # verify claim by commitment
│   │   └── layout.tsx          # fonts, site header/footer
│   ├── components/             # site brand/chrome + ui primitives
│   ├── lib/midnight-client.ts  # Midnight SDK wiring (Wave 1: local simulation)
│   ├── package.json
│   └── next.config.js          # output: 'export', trailingSlash
├── vercel.json                 # deploy config at repo root
├── package.json
├── README.md
└── LICENSE
```

### 🖥️ Local Setup
```bash
git clone https://github.com/milesdevx/TrueMile.git
cd TrueMile
npm install

# Run the frontend (Wave 1 needs no Midnight node or env vars)
npm run dev           # → http://localhost:3000

# Contract toolchain (from the Midnight registry): compile then test
npm run compile       # contracts → managed/truemile
npm test              # vitest against the real compiled circuit
```

### ▲ Vercel Deployment
The project deploys as a **static export** (`npm run build` → `frontend/dist`). Live at [truemile-mu.vercel.app](https://truemile-mu.vercel.app).

- **Root Directory:** *(repo root — the `vercel.json` at the root supplies everything)*
- **Framework Preset:** Other
- **Build Command:** `npm run build` · **Output Directory:** `frontend/dist` · **Install:** `npm install`

| Variable | Client-exposed? | Notes |
|---|:---:|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ✅ | Safe — public by design |
| `NEXT_PUBLIC_MIDNIGHT_RPC_URL` | ✅ | Public network endpoint |
| `NEXT_PUBLIC_PROOF_SERVER_URL` | ✅ if endpoint needs no secret | See [§7](#7-cross-wave-risk-notes) |
| `PROOF_SERVER_AUTH_TOKEN` | ❌ server-only | Requires non-static hosting (API routes/server actions) — planned with the Wave 2 SDK integration |

> 💡 Wave 1 defines no env vars — the proof flow is a deterministic local simulation until the Midnight SDK wiring lands. Redeploy is required after any environment variable change — Vercel does not hot-reload these. Production and Preview have separate variable scopes; confirm both if using branch previews.

---

## 4. 🌊 Wave 1 — Foundation
**Grant pool: $3,500** · **Objective:** ship one genuinely useful, fully functional feature — the private verification circuit itself — end-to-end, on a real UI, with real tests.

### ✨ Core Feature (delivers immediate value)
**Private History Claim Verification.** A seller enters their vehicle's actual accident count, mileage, and service records locally. The system proves — via a real Compact circuit — whether that data satisfies a claim the seller specifies, and publishes only the pass/fail result on-chain, tied to a commitment hash. A buyer can independently verify this claim without ever seeing the underlying data.

This is complete, standalone value on its own — a buyer can already trust a seller's claim before any deposit or escrow logic exists — which is why it anchors Wave 1 rather than being deferred.

### 🔧 Build Prompt
> Implement `truemile.compact` following the three-layer Compact architecture.
> - **Ledger:** `claimCommitments: Map<Bytes<32>, ClaimRecord>` (commitment → {verified: Boolean, timestamp}) — never raw history data.
> - **Witness:** `localVehicleHistory(): VehicleHistory` — accident count, mileage, service record, held locally by the seller.
> - **Circuits:** `submitClaim(claimCriteria: ClaimCriteria): [Bytes<32>]` — evaluates the witness, computes a commitment, `disclose()`s only the commitment + boolean; `verifyClaim(commitment: Bytes<32>): [Boolean]` — reads the already-public ledger result, no further witness access needed.
> - Compile with `compact compile truemile.compact managed/truemile` and confirm zero errors before building the frontend.
>
> Build the Seller and Buyer views per [§2.3](#-23-optimized-technology-stack) and [§2.1](#-21-high-end-modern-web-uiux), and write tests covering: a passing claim, a claim failing one criterion, and an assertion that raw history data never appears in ledger state.

### ✅ Wave 1 Deliverables
- [ ] `truemile.compact` compiles with zero errors
- [ ] Vehicle history modeled as `witness`; ledger holds only commitment + boolean + timestamp
- [ ] `submitClaim` and `verifyClaim` implemented and tested against real compiled circuits
- [ ] Seller view + Buyer view live, connected via SDK
- [ ] UI follows [§2.1](#-21-high-end-modern-web-uiux) (role-based, clear states, accessible, responsive)
- [ ] Public GitHub repo, Apache 2.0, tagged `midnightntwrk`
- [ ] README covering architecture, setup, how to test
- [ ] Slide deck link, demo video link
- [ ] Live Vercel deployment, tested from a device other than the dev machine

---

## 5. 🌊 Wave 2 — Expansion
**Grant pool: $4,000** · **Objective:** add the deposit-gated disclosure mechanism and harden verification — the feature behind the product's actual business model.

### 🔧 Build Prompt
> Extend `truemile.compact` without disturbing the Wave 1 verification guarantee.
> - Add `commitDeposit(commitment, buyerId): []` and `unlockHistory(commitment): [Boolean]` — the *decision* to unlock is on-chain and verifiable; detailed history transfer happens off-chain once the gate passes.
> - Add expiry: a claim goes stale after a configurable number of rounds, requiring re-verification.
> - Extend the criteria schema to support **multiple independent claims** per vehicle (mileage / accident / service, separately) instead of one bundled boolean.
>
> Update the UI with a deposit flow, unlock-state visualization, and expiry indicators. Add tests for the deposit gate, expiry, and multi-claim schema; confirm zero Wave 1 regressions. Update README/deck/video with an explicit **"what changed since Wave 1"** section. Redeploy to Vercel with the updated contract address.

### ✅ Wave 2 Deliverables
- [ ] `commitDeposit` / `unlockHistory` implemented, deposit correctly gates unlock
- [ ] Claim expiry/staleness logic implemented and tested
- [ ] Multi-claim schema implemented
- [ ] UI: deposit flow, unlock-state visualization, expiry indicators
- [ ] Full regression pass (Wave 1 + Wave 2 tests)
- [ ] "What changed since Wave 1" documented in README and deck
- [ ] New demo video showing the full commit → unlock flow
- [ ] Vercel redeployed with the current contract address, verified live

---

## 6. 🌊 Wave 3 — Maturity
**Grant pool: $5,000** · **Objective:** harden for production readiness and build the business case for real-world adoption.

### 🔧 Build Prompt
> Conduct a full security and UX audit rather than adding speculative new features.
> - Re-review every `disclose()` boundary in the contract for correctness.
> - If warranted, add issuer trust weighting: a `sealed` registry of recognized inspection/service-record sources — scoped tightly, only if genuinely new this Wave.
> - Complete a full UI/UX polish pass: onboarding, consistent error handling for every failure mode, a demo a stranger can complete unaided.
> - Write the business viability case: target adopters (independent dealerships, P2P marketplaces, escrow/title services), the concrete harm avoided, a realistic six-month adoption plan.
> - Finalize the deck and video for investor/accelerator-level review; produce **"what changed since Wave 2"** plus the full three-Wave arc.
> - Final clean-checkout Technical Gate re-verification: recompile, retest, redeploy, reconfirm repo/license/tag/README/deck/video/URL all current.

### ✅ Wave 3 Deliverables
- [ ] Full `disclose()` security audit complete
- [ ] Optional issuer trust-weighting added and scoped (if included)
- [ ] Full UI/UX polish pass, stranger-testable
- [ ] Business viability: named target adopters, value proposition, six-month plan
- [ ] Final slide deck and demo video, investor-ready
- [ ] "What changed since Wave 2" + full three-Wave arc documented
- [ ] Clean-checkout Technical Gate re-verified
- [ ] Live Vercel deployment re-verified functional and current

---

## 7. Cross-Wave Risk Notes

| ⚠️ Risk | Why it matters |
|---|---|
| Deposit/unlock (Wave 2) treated as *the* privacy guarantee | It's access control layered on the circuit — Engineering scoring shouldn't drift toward payment logic over ZK correctness |
| Proof server hosted on Vercel | Won't work — Vercel can't run a long-running process. Host it separately (Fly.io/Render) and keep it reachable through each judging period |
| Technical Gate assumed "passed once, passed forever" | It re-applies **every Wave** — a regression introduced while adding a later feature can disqualify that Wave regardless of prior progress |

<div align="center">

---

**[🚀 Live App](https://truemile-mu.vercel.app)** · **[📦 Repository](https://github.com/milesdevx/TrueMile)**

</div>
