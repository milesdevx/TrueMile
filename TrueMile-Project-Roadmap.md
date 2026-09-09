# Project TrueMile — Development Roadmap
### Private Vehicle History Verification, Built on Midnight

**Program:** Midnight Buildathon (AKINDO WaveHack) · **Total grant pool:** $12,500 across three Waves

---

## 1. Executive Summary

TrueMile allows a vehicle seller to prove that a car's accident, mileage, and service history meets a specific claim — for example, *"no major accidents, under 60,000 miles, dealer-serviced"* — without exposing the full VIN history report to every casual browser. Full detail is unlocked only after a prospective buyer commits to a deposit, aligning access to private data with genuine buying intent.

The privacy guarantee is enforced cryptographically through Midnight's Compact language, not by trust in a platform's access-control policy: the underlying history record never leaves the seller's local environment as raw data. Only a claim result — verified against that private data — is written on-chain.

---

## 2. Official Submission Requirements Compliance

Per the Buildathon's Official Rules, the following must be true at every Wave's Submission Deadline. This table exists so nothing is discovered missing at submission time.

| Requirement | Wave 1 | Wave 2 | Wave 3 |
|---|---|---|---|
| Public GitHub repository link | Required | Required (same repo, continued) | Required (same repo, continued) |
| `midnightntwrk` GitHub label | Required | Required | Required |
| README — project explanation, setup, architecture, Midnight integration, how to test | Required | Required, updated | Required, updated |
| Slide deck (pitch presentation) | Required | Required, updated | Required, final |
| Demo / video pitch | Required | Required, new | Required, final |
| Description of progress completed this Wave | Required | Required | Required |
| Explicit explanation of what changed since the previous submission | N/A (first submission) | **Required** | **Required** |
| Apache License 2.0 on all newly developed/materially extended Midnight-related code | Required | Required | Required |
| At least one Compact contract compiles successfully (Technical Gate) | Required | Required | Required |
| Meaningful Midnight-related functionality, not a mere fork/copy (Technical Gate) | Required | Required | Required |

A missing item in any row is treated as a submission-blocking gap, not a minor omission — several of these (the compiling contract, the `midnightntwrk` tag, and the Wave 2/3 "what changed" explanation) are explicit Technical Gate or Official Rules conditions, and their absence can result in that Wave's submission not being judged at all.

---

## 3. Architectural Priorities

The project is built around three non-negotiable priorities, applied consistently across all three Waves.

### 3.1 High-End, Modern Web UI/UX
- A polished, trustworthy interface is a functional requirement here, not a cosmetic one — this product exists specifically to replace trust in a middleman with trust in a system, and the UI needs to visually communicate that confidence.
- Clear, role-based views (Seller, Buyer) with distinct visual treatment for "claim verified" vs. "full history unlocked" states, so users always understand what they can and cannot currently see.
- Responsive design, accessible by default (proper contrast, keyboard navigation, ARIA labeling on custom components).
- Motion and feedback used purposefully: proof generation and on-chain verification are not instant, so loading and progress states must feel deliberate and trustworthy, not broken.

### 3.2 Robust Security Protocols
- Strict adherence to Midnight's three-layer Compact model: raw vehicle history data is modeled as `witness` (private, local to the seller), never as `ledger` state (public, on-chain).
- Every value derived from `witness` data must pass through an explicit, audited `disclose()` call before it can reach the ledger or a circuit's return value — nothing crosses that boundary implicitly.
- Deposit-gated unlock logic is treated as an access-control feature layered on top of the verification circuit, not a substitute for it — the core privacy guarantee must hold regardless of whether a deposit has been made.
- No wallet credentials, private keys, or proof-server authentication tokens are ever exposed client-side or committed to source control.
- Dependency and contract review at the end of each Wave, not only at final submission.

### 3.3 Optimized Technology Stack
Every tool below was selected for compatibility with both local development and zero-friction Vercel deployment, and for suitability to the actual workload (a ZK-backed dApp with a conventional web frontend).

| Layer | Technology | Rationale |
|---|---|---|
| Smart contract | Compact (Midnight toolchain) | Required by the platform; the only language with native `ledger`/`witness`/`disclose()` primitives |
| Contract testing | `@midnight-ntwrk/compact-runtime` + Vitest | Runs real compiled circuits rather than mocked logic; fast, TypeScript-native |
| Frontend framework | Next.js 15 (App Router) + TypeScript | First-class Vercel support, server/client component separation maps cleanly onto public/private data handling |
| Styling / UI | Tailwind CSS + shadcn/ui | Modern, accessible component primitives without a heavy design-system dependency; fully customizable for a distinct visual identity |
| State management | React Server Components + minimal client state (Zustand where needed) | Avoids over-engineering; keeps private data out of unnecessary global client state |
| Blockchain integration | Midnight TypeScript SDK | Official SDK for wallet connection, transaction submission, and proof coordination |
| Package management | Yarn (workspaces) | Monorepo support for `contracts/` + `frontend/` in one repository |
| Hosting (frontend) | Vercel | Native Next.js support, environment variable management, instant preview deployments |
| Hosting (proof server) | Fly.io / Render (always-on instance) | Vercel cannot run Midnight's long-running proof server process — see §8 |
| Version control | Git + GitHub (public, `midnightntwrk` tagged) | Required by Buildathon submission rules |
| License | Apache License 2.0 | Required for all newly developed Midnight-related code |

---

## 4. Local Development & Vercel Compatibility

### Project Structure
```
truemile/
├── contracts/
│   └── truemile.compact
├── managed/                    # compiler output — gitignored
├── tests/
│   └── truemile.test.ts
├── frontend/                   # Next.js app — Vercel deployment root
│   ├── app/
│   │   ├── seller/page.tsx     # submit claim, generate proof
│   │   ├── buyer/page.tsx      # view claim, commit deposit, unlock history
│   │   └── layout.tsx
│   ├── components/ui/          # shadcn/ui components
│   ├── lib/midnight-client.ts  # SDK wiring
│   ├── package.json
│   └── vercel.json
├── package.json
├── README.md
└── LICENSE
```

### Local Setup
```bash
git clone <repo-url> truemile
cd truemile
yarn install

# Compile the contract
cd contracts
compact compile truemile.compact ../managed/truemile
cd ..

# Run tests against the real compiled circuit
yarn test

# Run the frontend
cd frontend
cp .env.example .env.local
yarn dev   # → http://localhost:3000
```

### Vercel Deployment
- **Root Directory:** `frontend`
- **Framework Preset:** Next.js (auto-detected)
- **Environment variables** (Vercel Dashboard → Settings → Environment Variables):

| Variable | Client-exposed? | Notes |
|---|---|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes | Safe — public by design |
| `NEXT_PUBLIC_MIDNIGHT_RPC_URL` | Yes | Public network endpoint |
| `NEXT_PUBLIC_PROOF_SERVER_URL` | Yes, if endpoint requires no secret | See §8 |
| `PROOF_SERVER_AUTH_TOKEN` | **No — server-only** | Read only in server actions/API routes |

- Redeploy is required after any environment variable change — Vercel does not hot-reload these into a running deployment.
- Production and Preview environments have separate variable scopes; confirm both if using branch previews during development.

---

## 5. Wave 1 — Foundation
**Objective:** Ship one genuinely useful, fully functional feature — the private verification circuit itself — end-to-end, on a real UI, with real tests.

### Core Feature (delivers immediate value)
**Private History Claim Verification.** A seller enters their vehicle's actual accident count, mileage, and service records locally. The system proves — via a real Compact circuit — whether that data satisfies a claim the seller specifies (e.g., "no major accidents AND mileage < 60,000 AND dealer-serviced"), and publishes only the pass/fail result on-chain, tied to a commitment hash of the underlying record. A buyer can independently verify this claim is true without ever seeing the underlying mileage, accident, or service data.

This is a complete, standalone piece of value on its own — a buyer can already trust a seller's claim before any deposit or escrow logic exists — which is why it anchors Wave 1 rather than being deferred to a later Wave.

### Build Prompt
> Implement `truemile.compact` following the three-layer Compact architecture.
> - **Ledger:** `claimCommitments: Map<Bytes<32>, ClaimRecord>` (commitment → {verified: Boolean, timestamp}) — never raw history data.
> - **Witness:** `localVehicleHistory(): VehicleHistory` — accident count, mileage, service record, held locally by the seller.
> - **Circuits:** `submitClaim(claimCriteria: ClaimCriteria): [Bytes<32>]` — evaluates the witness against the criteria, computes a commitment, and `disclose()`s only the commitment and boolean result; `verifyClaim(commitment: Bytes<32>): [Boolean]` — reads the already-public ledger result, no further witness access required.
> - Compile with `compact compile truemile.compact managed/truemile` and confirm zero errors before building the frontend against it.
>
> Build the Seller and Buyer views with the tech stack in §3.3 and §4, styled per the UI/UX principles in §3.1, and write tests (via `@midnight-ntwrk/compact-runtime`) covering: a claim that passes, a claim that fails on one criterion, and an assertion that raw history data never appears in ledger state or emitted data.

### Wave 1 Deliverables
- [ ] `truemile.compact` compiles with zero errors
- [ ] Vehicle history modeled as `witness`; ledger holds only commitment + boolean + timestamp
- [ ] `submitClaim` and `verifyClaim` implemented and tested against real compiled circuits
- [ ] Seller view (submit claim) and Buyer view (verify claim) live, connected via SDK
- [ ] UI follows §3.1 (role-based views, clear verified/unverified states, accessible, responsive)
- [ ] Public GitHub repo, Apache 2.0, tagged `midnightntwrk`
- [ ] README covering architecture, setup, and how to test
- [ ] Slide deck link, demo video link
- [ ] Live Vercel deployment, tested from a device other than the dev machine

---

## 6. Wave 2 — Expansion
**Objective:** Add the deposit-gated disclosure mechanism and harden the verification logic — the feature that gives the product its full name and business model.

### Build Prompt
> Extend `truemile.compact` and the application without disturbing the Wave 1 verification guarantee.
> - Add `commitDeposit(commitment: Bytes<32>, buyerId: Bytes<32>): []` and `unlockHistory(commitment: Bytes<32>): [Boolean]` — the latter checks a deposit has been committed before permitting a follow-on off-chain data release (the *decision* to unlock is on-chain and verifiable; the actual detailed history transfer can occur through an authenticated off-chain channel once the on-chain gate passes).
> - Add revocation/expiry: a claim can be marked stale after a configurable number of rounds, requiring re-verification — accounts for a vehicle's condition changing after the original claim was made.
> - Extend the criteria schema to support multiple independent claims per vehicle (e.g., separate claims for mileage, accident history, and service history) rather than one bundled boolean, giving buyers more granular trust signals.
>
> Update the UI with deposit flow, unlock-state visualization, and claim-expiry indicators, consistent with the visual design system established in Wave 1. Add tests for the deposit gate, expiry logic, and multi-claim schema; confirm no Wave 1 regressions. Update the README, deck, and demo video with an explicit "what changed since Wave 1" section. Redeploy to Vercel with the updated contract address.

### Wave 2 Deliverables
- [ ] `commitDeposit` / `unlockHistory` implemented, deposit correctly gates unlock decision
- [ ] Claim expiry/staleness logic implemented and tested
- [ ] Multi-claim schema (separate mileage/accident/service claims) implemented
- [ ] UI: deposit flow, unlock-state visualization, expiry indicators
- [ ] Full regression test pass (Wave 1 + Wave 2 tests)
- [ ] "What changed since Wave 1" documented in README and deck
- [ ] New demo video showing the full commit → unlock flow
- [ ] Vercel redeployed with the current contract address, verified live

---

## 7. Wave 3 — Maturity
**Objective:** Harden for production readiness and build the business case for real-world adoption (dealerships, marketplaces, escrow services).

### Build Prompt
> Conduct a full security and UX audit rather than adding speculative new features.
> - Re-review every `disclose()` boundary in the contract for correctness.
> - If warranted, add issuer trust weighting: a `sealed` registry of which inspection/service-record sources are recognized as authoritative, so a claim also communicates *how* the underlying data was sourced — scoped tightly, and only if it represents genuinely new functionality this Wave.
> - Complete a full UI/UX polish pass: onboarding for first-time sellers and buyers, consistent error handling for every failure mode introduced across all three Waves, and a demo flow usable by a stranger with no explanation.
> - Write the business viability case: target adopters (independent dealerships, peer-to-peer marketplaces, escrow/title services), the concrete harm avoided (VIN history report costs, information asymmetry fraud), and a realistic six-month adoption plan.
> - Finalize the slide deck and demo video for investor/accelerator-level review, and produce the "what changed since Wave 2" summary plus the full three-Wave narrative arc.
> - Perform a final clean-checkout Technical Gate re-verification: recompile, retest, redeploy, and reconfirm repo, license, tag, README, deck, video, and live Vercel URL are all current before the Submission Deadline.

### Wave 3 Deliverables
- [ ] Full `disclose()` security audit complete
- [ ] Optional issuer trust-weighting feature added and scoped (if included)
- [ ] Full UI/UX polish pass, stranger-testable
- [ ] Business viability section: named target adopters, concrete value proposition, six-month adoption plan
- [ ] Final slide deck and demo video, investor-ready
- [ ] "What changed since Wave 2" + full three-Wave arc documented
- [ ] Clean-checkout Technical Gate re-verified
- [ ] Live Vercel deployment re-verified functional and current

---

## 8. Cross-Wave Risk Notes
- The deposit/unlock mechanism (Wave 2) is access control layered on top of the verification circuit — it is not itself the privacy guarantee, and Engineering scoring should not be allowed to drift toward payment logic at the expense of the core ZK circuit's correctness.
- A Vercel-hosted frontend cannot run Midnight's proof server directly; it must run on an always-on host and be reachable from the live deployment throughout each Wave's judging period.
- Every Wave's Technical Gate re-applies independently — a regression introduced while adding a later Wave's feature can disqualify that Wave regardless of prior progress.
