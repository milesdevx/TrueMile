import Link from 'next/link';
import { StatusChip } from '@/components/site/status-chip';

export const metadata = {
  title: 'How to use TrueMile — User manual',
  description:
    'Step-by-step guide to submitting, verifying, and browsing vehicle-history claims on TrueMile.',
};

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'before-you-begin', label: 'Before you begin' },
  { id: 'connect-wallet', label: 'Connecting a wallet' },
  { id: 'sellers', label: 'For sellers' },
  { id: 'buyers', label: 'For buyers' },
  { id: 'registry', label: 'The claims registry' },
  { id: 'badge', label: 'Downloading a badge' },
  { id: 'appearance', label: 'Light & dark mode' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'best-practices', label: 'Best practices' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'limits', label: 'Wave 1 limitations' },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-line/70 pt-9 first:border-t-0 first:pt-0"
    >
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.06em] text-bone">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-dim">{children}</div>
    </section>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-3">{children}</ol>;
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-lg border border-line/80 bg-panel px-4 py-3.5">
      <span className="font-display text-xl font-semibold leading-none text-seal">{n}</span>
      <div className="min-w-0">
        <p className="font-medium text-bone">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-dim">{children}</p>
      </div>
    </li>
  );
}

function Callout({
  tone = 'sealed',
  label,
  children,
}: {
  tone?: 'sealed' | 'signal' | 'seal' | 'danger';
  label: string;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    sealed: 'border-sealed/40 bg-sealed/10 text-sealed',
    signal: 'border-signal/40 bg-signal/10 text-signal',
    seal: 'border-seal/40 bg-seal/10 text-seal',
    danger: 'border-danger/40 bg-danger/10 text-danger',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[tone]}`}>
      <p className="font-display text-xs font-semibold uppercase tracking-[0.14em]">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-dim">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-sealed"
          />
          <span className="text-dim">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Problem({ symptom, fix }: { symptom: string; fix: string }) {
  return (
    <div className="rounded-lg border border-line/80 bg-panel px-4 py-3.5">
      <p className="text-sm font-medium text-bone">{symptom}</p>
      <p className="mt-1 text-sm leading-relaxed text-dim">{fix}</p>
    </div>
  );
}

export default function DocPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
      <Link
        href="/"
        className="text-sm text-dim underline decoration-line underline-offset-4 transition-colors hover:text-bone"
      >
        Back to TrueMile
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-semibold uppercase leading-none tracking-[0.02em] text-bone sm:text-5xl">
          How to use TrueMile
        </h1>
        <StatusChip tone="faint" label="Wave 1 manual" />
      </div>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">
        The complete walkthrough: what the product does, how to submit and verify a
        claim, how to read the registry, and how to fix the problems people hit
        most. Written for a first-time visitor.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-12">
        <nav aria-label="Manual sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 border-l border-line/70 pl-4 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block py-1 text-dim transition-colors hover:text-bone"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-2xl space-y-10">
          <Section id="introduction" title="Introduction">
            <p>
              TrueMile lets a seller prove a claim about a vehicle&apos;s history —
              for example &ldquo;no major accidents, under 60,000 miles,
              dealer-serviced&rdquo; — without publishing the underlying report. A
              buyer confirms the claim against a single public commitment while the
              detailed history stays sealed.
            </p>
            <p>
              The privacy guarantee comes from the flow itself. Your raw history is
              read only where you hold it; only a pass/fail result and a commitment
              hash are ever shared. That is why the vehicle record card shows sealed
              fields, and why the registry contains hashes and verdicts rather than
              reports.
            </p>
            <Callout tone="signal" label="Wave 1 status">
              In this Wave, the claim is evaluated in your browser as a documented
              local evaluation while the on-chain circuit wiring lands. The result
              panel states this explicitly. Wallet connection is real and is required
              to run the claim actions.
            </Callout>
          </Section>

          <Section id="before-you-begin" title="Before you begin">
            <Bullets
              items={[
                'A modern browser — Chrome, Edge, Firefox, Brave, or Safari.',
                'No wallet is required at all. Submitting, verifying, and browsing all work without one.',
                'A Midnight wallet extension (Lace or 1AM) is optional — connect one only if you want to.',
                'If you do connect, keep it on the network shown in the app (preprod by default).',
              ]}
            />
            <Callout tone="sealed" label="Wallet is optional">
              Everything in Wave 1 works without a wallet: browse the landing page and
              registry, submit a claim, and verify a commitment. Connecting is a
              convenience that associates activity with your address and readies the
              on-chain flows; it is never required.
            </Callout>
          </Section>

          <Section id="connect-wallet" title="Connecting a wallet">
            <Steps>
              <Step n="01" title="Click Connect Wallet">
                Find it in the top-right of the navigation bar. If exactly one wallet
                is detected, TrueMile connects directly. If several are present, a
                short picker lists them.
              </Step>
              <Step n="02" title="Approve in your wallet">
                Your wallet extension opens and asks you to approve the connection.
                Approve it to continue. If you dismiss it, you will see
                &ldquo;Connection request was dismissed&rdquo; and can simply try
                again.
              </Step>
              <Step n="03" title="Check the connected pill">
                The button becomes a pill showing your shortened address with a gold
                dot. The dot pulses once on connection, then stays still.
              </Step>
              <Step n="04" title="Open your profile">
                Click the pill to see your full address (click to copy), the current
                network, your personal activity, and a Disconnect link. Everything in
                this panel is stored only on your device.
              </Step>
            </Steps>
            <Callout tone="sealed" label="Stays connected">
              TrueMile remembers your last wallet and restores the connected state on
              your next visit without contacting the wallet — so refreshing never
              prompts you to reconnect. The wallet is only contacted when you submit
              or verify a claim. Your preference is cleared only when you choose
              Disconnect.
            </Callout>
          </Section>

          <Section id="sellers" title="For sellers — submit a private claim">
            <Steps>
              <Step n="01" title="Open the Sellers page">
                Use the Sellers tab in the navigation, or the &ldquo;Submit a
                claim&rdquo; button on the landing page.
              </Step>
              <Step n="02" title="Connect a wallet only if you want to (optional)">
                Submitting works with no wallet connected. If you do connect one, your
                activity is recorded to your address — and your vehicle data still
                never leaves the device.
              </Step>
              <Step n="03" title="Enter your private history">
                Type your VIN (kept private), mileage, major accidents, dealer
                services, and total services. A dashboard-style odometer previews the
                mileage as you type.
              </Step>
              <Step n="04" title="Set the claim you want to prove">
                Choose the maximum mileage, the maximum number of major accidents, and
                the minimum dealer-serviced percentage your history must satisfy.
              </Step>
              <Step n="05" title="Generate the claim">
                Press &ldquo;Generate verified claim&rdquo;. A seal traces itself in
                and fills as the claim is processed; the status text updates with each
                real step.
              </Step>
              <Step n="06" title="Share the commitment">
                A verified claim shows a public commitment hash and the vehicle
                identity. Copy the commitment and send it to buyers. You can also
                download an embeddable badge (see below).
              </Step>
            </Steps>
            <p>
              If the claim does not hold, the seal stays unstamped and the panel tells
              you the history did not satisfy the criteria — adjust the bounds and
              generate again.
            </p>
          </Section>

          <Section id="buyers" title="For buyers — verify a claim">
            <Steps>
              <Step n="01" title="Open the Buyers page">
                Use the Buyers tab in the navigation, or &ldquo;Verify a claim&rdquo;
                on the landing page.
              </Step>
              <Step n="02" title="Connect a wallet only if you want to (optional)">
                Verification works with no wallet connected. If you connect one, the
                verified result is recorded to your address.
              </Step>
              <Step n="03" title="Paste the commitment">
                Enter the 64-character hash the seller gave you. Not sure yet? Press
                &ldquo;Use an example claim&rdquo; to load a working sample instantly —
                no setup required.
              </Step>
              <Step n="04" title="Verify">
                Press &ldquo;Verify commitment&rdquo;. A seal traces and fills with the
                result.
              </Step>
              <Step n="05" title="Read the verdict">
                A gold VERIFIED seal means the commitment matched an issued claim.
                Otherwise you will see &ldquo;No valid claim found&rdquo; — recheck the
                hash.
              </Step>
            </Steps>
            <Callout tone="signal" label="Shortcut">
              On larger screens you can verify from anywhere using the small commitment
              field in the navigation bar. Type or paste a hash, press Enter, and the
              field indicates the verdict.
            </Callout>
            <Callout tone="sealed" label="Unlock comes later">
              A verified result shows a disabled &ldquo;Unlock full history&rdquo;
              control marked &ldquo;Coming in Wave 2&rdquo;. Deposit-gated unlocking is
              not available in Wave 1.
            </Callout>
          </Section>

          <Section id="registry" title="The claims registry">
            <p>
              The homepage &ldquo;Recent verifications&rdquo; section and the{' '}
              <Link href="/registry" className="text-seal underline decoration-seal/40 underline-offset-4">
                full registry page
              </Link>{' '}
              list public claim commitments, their verdicts, vehicle-identity hashes,
              schema version, and timestamps. This data is public by design and needs
              no wallet.
            </p>
            <Bullets
              items={[
                'A gold check marks a verified claim; a red cross marks one that did not hold.',
                'Hashes are shown shortened for readability — the full value is in the tooltip.',
                'New rows animate in only while you are watching; the initial list renders at rest, like a public record should.',
              ]}
            />
          </Section>

          <Section id="badge" title="Downloading a badge">
            <p>
              After a claim verifies, the result panel offers{' '}
              <span className="text-bone">Download embeddable badge (JPG)</span>. It
              produces a fixed-color badge — &ldquo;Verified on TrueMile&rdquo;, the
              shortened commitment and vehicle ID, and the registry address — sized for
              a marketplace listing or a for-sale post.
            </p>
            <Bullets
              items={[
                'The badge is a JPG so listing sites that reject SVG will accept it.',
                'It is generated on your device; nothing is uploaded.',
                'Anyone can re-check the claim by pasting the commitment on the Buyers page.',
              ]}
            />
          </Section>

          <Section id="appearance" title="Light & dark mode">
            <p>
              Use the sun/moon button in the navigation bar to switch themes. On your
              first visit TrueMile follows your system preference; once you choose a
              theme explicitly, that choice is remembered and reapplied on every
              reload.
            </p>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            <div className="space-y-3">
              <Problem
                symptom="“No Midnight wallet detected.”"
                fix="Install Lace or 1AM, then reload the page. If it is already installed, make sure the extension is enabled and unlocked."
              />
              <Problem
                symptom="Clicking Connect Wallet seems to do nothing."
                fix="Your wallet is probably locked or waiting behind another window. Open the extension, unlock it, and try again."
              />
              <Problem
                symptom="The pill says “Wrong network.”"
                fix="Open your wallet, switch to the network shown in the app (preprod by default), then click the pill and press Reconnect."
              />
              <Problem
                symptom="“Connection request was dismissed.”"
                fix="The approval prompt was closed. Click Connect Wallet again and approve the request."
              />
              <Problem
                symptom="Verification says “No valid claim found.”"
                fix="Check the commitment character for character — copy it rather than retyping. In Wave 1, commitments issued in a different browser are not available; use “Use an example claim” to confirm the flow works."
              />
              <Problem
                symptom="The result says the claim is “not yet on-chain.”"
                fix="Expected in Wave 1. The claim is evaluated locally while the on-chain circuit wiring is completed; the wallet connection itself is real."
              />
              <Problem
                symptom="The theme toggle does not persist."
                fix="Your browser may be blocking local storage (private mode or strict settings). The toggle still works for the current session."
              />
              <Problem
                symptom="The badge will not download."
                fix="Canvas or download permissions may be blocked. Try a different browser or disable strict shields for this site."
              />
            </div>
          </Section>

          <Section id="best-practices" title="Best practices">
            <Bullets
              items={[
                'Copy the commitment hash instead of retyping it — one wrong character changes the result.',
                'Keep your VIN private. Share only the commitment; it reveals nothing about the vehicle.',
                'Re-run a claim after changing the criteria so the commitment matches the claim you are advertising.',
                'Use the registry to confirm a commitment resolves before you send it to a buyer.',
                'Check the network shown in your profile before any deposit flows arrive in Wave 2.',
                'Leave your wallet unlocked during a session to keep reconnects instant.',
              ]}
            />
          </Section>

          <Section id="glossary" title="Glossary">
            <dl className="space-y-3 text-sm">
              {[
                ['Commitment', 'A hash that stands in for a claim. Sharing it lets others verify the result without exposing the data.'],
                ['Witness', 'Private data held only on your device — your raw vehicle history.'],
                ['Ledger', 'Public, on-chain data. TrueMile writes only a verdict and a commitment here.'],
                ['Sealed', 'Shown as hidden. Teal marks data that stays private.'],
                ['Seal', 'The gold mark of a verified, public result.'],
                ['Vehicle identity', 'A commitment to the VIN that claims attach to, so history can build over time.'],
                ['Registry', 'The public list of commitments and verdicts.'],
                ['Schema version', 'A tag on each record so future claim types can be added without breaking older entries.'],
              ].map(([term, definition]) => (
                <div key={term} className="border-b border-line/60 pb-3 last:border-b-0">
                  <dt className="text-bone">{term}</dt>
                  <dd className="mt-0.5 text-dim">{definition}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="limits" title="Wave 1 limitations">
            <Callout tone="danger" label="Be aware">
              The honest current limits, so nothing surprises you:
            </Callout>
            <Bullets
              items={[
                'Claims are evaluated in your browser, not yet on the Midnight ledger.',
                'The registry is local to this browser, so commitments issued elsewhere do not appear.',
                'Wave 1 exposes one bundled verdict; per-criterion results and multi-claim records arrive in Wave 2.',
                'Deposit-gated history unlock is not available yet.',
                'A wallet is optional: submitting and verifying work with none connected.',
              ]}
            />
            <p>
              When the circuit wiring lands, the same wallet connection and the same
              flows are reused — only the proof step becomes on-chain.
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
}
