import { CtaLink } from '@/components/site/cta-link';
import { ClaimsRegistry } from '@/components/site/claims-registry';
import { RegistryStatsBar } from '@/components/site/registry-stats';
import { StatusChip } from '@/components/site/status-chip';
import { VehicleRecordCard } from '@/components/site/vehicle-record-card';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter history locally',
    body: 'You type mileage, accident, and service details. They are read only where you hold them — never published.',
    accent: 'border-t-sealed',
    tone: 'text-sealed',
  },
  {
    step: '02',
    title: 'Circuit proves the claim',
    body: 'The claim is evaluated against your private record. Only a pass/fail result and a commitment reach the ledger.',
    accent: 'border-t-signal',
    tone: 'text-signal',
  },
  {
    step: '03',
    title: 'Buyer verifies the commitment',
    body: 'A buyer checks the public result against one hash. The full history stays sealed behind it.',
    accent: 'border-t-seal',
    tone: 'text-seal',
  },
] as const;

function FlowArrow() {
  return (
    <span aria-hidden="true" className="text-line">
      &rarr;
    </span>
  );
}

function RoleList({ tone, items }: { tone: 'sealed' | 'seal'; items: string[] }) {
  const dot = tone === 'sealed' ? 'bg-sealed' : 'bg-seal';
  return (
    <ul className="mt-5 space-y-2.5 text-sm text-dim">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] ${dot}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-line" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.26em] text-faint">
            Private vehicle history
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-line" />
        </div>

        <div className="fade-up mx-auto mt-7 max-w-2xl">
          <VehicleRecordCard />
        </div>

        <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-16">
          <h1 className="mx-auto max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[0.01em] text-bone sm:text-7xl">
            Prove what matters.
            <br />
            <span className="text-seal">Hide what doesn&apos;t.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-dim">
            TrueMile verifies mileage, accident, and service claims about a vehicle
            without ever publishing the underlying history. Buyers confirm a claim
            against one sealed on-chain commitment.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href="/seller" variant="signal" size="lg" className="w-full sm:w-auto">
              Submit a claim
            </CtaLink>
            <CtaLink href="/buyer" variant="outline" size="lg" className="w-full sm:w-auto">
              Verify a claim
            </CtaLink>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
            <StatusChip tone="sealed" label="Witness · local" showBorder={false} />
            <FlowArrow />
            <StatusChip tone="faint" label="Circuit · proof" showBorder={false} />
            <FlowArrow />
            <StatusChip tone="seal" label="Ledger · public result" showBorder={false} />
          </div>
        </div>
      </section>

      <RegistryStatsBar />

      <section aria-label="For sellers and buyers" className="border-t border-line/80">
        <div className="mx-auto grid w-full max-w-5xl gap-12 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-0">
          <div className="md:pr-14">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-bone">
                For sellers
              </h2>
              <StatusChip tone="sealed" label="Data stays sealed" />
            </div>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-dim">
              Submit a claim about your vehicle&apos;s mileage, accident history, and
              service record. Your records never leave this device.
            </p>
            <RoleList
              tone="sealed"
              items={[
                'The record is read only where you hold it',
                'A proof is produced without revealing any values',
                'Buyers see the verdict, never the data',
              ]}
            />
            <CtaLink href="/seller" variant="outline" size="md" className="mt-7">
              Start as a seller
            </CtaLink>
          </div>

          <div className="md:border-l md:border-line md:pl-14">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-bone">
                For buyers
              </h2>
              <StatusChip tone="seal" label="Result becomes public" />
            </div>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-dim">
              Check a seller&apos;s claim against its on-chain commitment. The full
              record stays sealed until you commit a deposit.
            </p>
            <RoleList
              tone="seal"
              items={[
                'Paste one hash, get the claim verdict',
                'Deposit to unlock the full history',
                'Your deposit returns if the claim does not hold',
              ]}
            />
            <CtaLink href="/buyer" variant="outline" size="md" className="mt-7">
              Verify as a buyer
            </CtaLink>
          </div>
        </div>
      </section>

      <section aria-label="How it works" className="border-t border-line/80">
        <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-bone">
            How it works
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-dim">
            The witness → circuit → ledger split, without the narration.
          </p>

          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <li
                key={item.step}
                className={`rounded-lg border border-line/80 border-t-2 bg-panel px-5 py-5 ${item.accent}`}
              >
                <p className={`font-display text-2xl font-semibold leading-none ${item.tone}`}>
                  {item.step}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-[0.06em] text-bone">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dim">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Recent verifications" className="border-t border-line/80">
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-bone">
            Recent verifications
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-dim">
            A read-only record of claim commitments and verdicts. This is public
            data by design — the underlying history is not.
          </p>
          <ClaimsRegistry limit={4} showLink className="mt-7" />
        </div>
      </section>
    </>
  );
}
