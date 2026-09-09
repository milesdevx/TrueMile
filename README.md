# TrueMile

Privacy-preserving vehicle history verification on Midnight. A seller proves accident, mileage, and service claims about a vehicle without ever publishing the underlying history; a buyer confirms the claim against one sealed commitment.

Built with **Compact** (the smart contract), **Next.js 15** (App Router), and **Tailwind CSS**. Wave 1 ships the full UI and a deterministic in-browser simulation of the proof flow.

## What is TrueMile?

TrueMile lets a vehicle seller prove that their car meets specific history criteria — for example:

> "No major accidents, under 60,000 miles, and dealer-serviced."

The seller's raw vehicle history never leaves their device. A zero-knowledge proof built in Midnight's Compact language verifies the claim locally and writes only a commitment hash and boolean result on-chain. Buyers verify that result without seeing the underlying report.

> **Wave 1 status:** `frontend/lib/midnight-client.ts` simulates the proof flow locally — claims are evaluated in the browser, keyed by a SHA-256 commitment stored in an in-session registry. Nothing is written to a ledger yet, and a claim can only be verified in the same browser session that issued it. Replace the simulated `submitClaim` / `verifyClaim` functions with real Midnight SDK + proof-server calls to go live.

## Project structure

```
truemile/
├── contracts/
│   └── truemile.compact          # Wave 1 verification circuit
├── managed/                       # Compiler output (gitignored)
├── tests/
│   └── truemile.test.ts          # Circuit tests (needs Midnight toolchain)
├── frontend/                      # Next.js 15 app (npm workspace)
│   ├── app/
│   │   ├── layout.tsx            # Root layout, fonts, header/footer
│   │   ├── page.tsx              # Landing: "redacted document" hero
│   │   ├── icon.svg              # Stamp favicon (ink monochrome)
│   │   ├── seller/page.tsx       # Submit a private claim
│   │   └── buyer/page.tsx        # Verify a claim by commitment
│   ├── components/
│   │   ├── site/                 # Brand + chrome (logo, header, footer, CTAs)
│   │   └── ui/                   # Button, Input, Card, Badge primitives
│   ├── lib/
│   │   ├── midnight-client.ts    # Midnight SDK abstraction (Wave 1 stub)
│   │   └── utils.ts              # cn(), number parsing helpers
│   ├── app/globals.css           # Design tokens + stamp animation
│   ├── next.config.js            # Static export → dist/
│   └── tailwind.config.ts
├── package.json                   # npm workspace root
└── vitest.config.ts
```

## Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Compact (Midnight) — `contracts/truemile.compact` |
| Contract tests | `@midnight-ntwrk/compact-runtime` + Vitest (needs Midnight registry packages) |
| Frontend | Next.js 15 (App Router, static export) + TypeScript |
| Styling | Tailwind CSS + custom "Sealed Title" design system |
| Fonts | Inter Tight (grotesk) + JetBrains Mono (data readouts only), self-hosted via `next/font` |
| Package manager | npm workspaces |
| Hosting | Any static host — `next build` emits `frontend/dist` |

## Design system

Visual identity: **"The Sealed Title"** — real vehicle-document iconography, not generic tech/blockchain visuals. Redaction bars are the visual language for privacy; the only bold color is the amber verification stamp; monospace is reserved strictly for machine values (VINs, mileage, hashes).

| Token | Hex | Role |
|---|---|---|
| Paper | `#EDE7D9` | Primary light surface |
| Ink | `#14171F` | Dark surface / monochrome logo |
| Graphite | `#2A2E37` | Text on Paper |
| Verified Amber | `#C98A2C` | Verification stamp, confirmed states, primary CTA |
| Vault Teal | `#1F6F63` | Privacy / sealed-state cues |
| Redacted Grey | `#9C978C` | Blur / block-out bars over private fields |

Brand assets in `frontend/components/site/truemile-logo.tsx`:

```tsx
<TrueMileLogo />                                    // header lockup
<TrueMileMark className="h-10 w-10" />              // stamp-only icon
<TrueMileMark className="h-16 w-16" tone="ink" />   // monochrome / watermark
```

`app/icon.svg` is the ink favicon. The stamp-press animation runs once on load and is disabled under `prefers-reduced-motion`.

## Local setup

Prerequisites: Node.js 18.18+ and npm. The static export is plain HTML/CSS/JS — no Midnight node or environment variables are needed for Wave 1.

```bash
# 1. Install workspace dependencies (from the repo root)
npm install

# 2. Run the frontend
npm run dev          # → http://localhost:3000
```

Other root scripts:

```bash
npm run build        # static export of the frontend → frontend/dist
npm run test         # contract tests (requires the compiled contract, see below)
npm run compile      # contracts: compact compile truemile.compact ../managed/truemile
```

Open [http://localhost:3000](http://localhost:3000).

### Contract tests (when you have the Midnight toolchain)

`tests/truemile.test.ts` exercises the compiled circuit: a claim that passes, a claim that fails on mileage, and an assertion that raw history never reaches ledger state. These tests need `compact` and `@midnight-ntwrk/compact-runtime` installed from the Midnight registry, plus the compiler output in `managed/` (gitignored). Run once both are present:

```bash
npm run compile
npm test
```

## Wave 1 features

- **Seller view** (`/seller`): enter private history and claim criteria, generate a claim. Inputs are validated and bounded client-side; history never leaves the browser.
- **Buyer view** (`/buyer`): verify a claim by its 64-character hex commitment.
- **Privacy model:** raw accident, mileage, and service data is a `witness` in the contract and never written to the ledger — only the commitment and boolean result are.

## Known limitations (Wave 1)

- The claim simulation is per browser session; reloads clear issued claims.
- Commitments are produced by the browser, not by a Compact circuit (demo only — see `midnight-client.ts`).
- `frontend/components/ui/card.tsx` and `badge.tsx` are currently unused by pages and kept as primitives for the next wave.
- Remaining `npm audit` items are dev-chain advisories (esbuild/vite) and `sharp`; upgrade when the Midnight starter template allows.

## Deployment

`next build` produces a fully static site in `frontend/dist` — deploy that folder to any static host (Vercel, Netlify, S3, etc.). `frontend/vercel.json` points Vercel at `frontend/dist`; set the project root directory to `frontend`.

A live deployment also requires a long-running proof server and the Midnight network; Vercel cannot host that process.

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
