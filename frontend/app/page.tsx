import { CtaLink } from '@/components/site/cta-link';
import { VerifiedStamp } from '@/components/site/verified-stamp';

function RedactionBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[1.05em] select-none rounded-[2px] bg-redacted/80 ${className ?? ''}`}
    />
  );
}

function RecordField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-baseline gap-x-6 border-b border-border/60 px-5 py-4 last:border-b-0 sm:grid-cols-[128px_1fr] sm:px-6">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-[15px]">{children}</dd>
    </div>
  );
}

function VehicleRecord() {
  return (
    <div className="rounded-lg border border-border/80 bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Vehicle record</p>
          <p className="mt-0.5 font-mono text-[11px] tracking-tight text-muted-foreground">
            No. TM-000041
          </p>
        </div>
        <VerifiedStamp className="h-16 w-16 -rotate-6 sm:h-20 sm:w-20" />
      </div>

      <dl>
        <RecordField label="VIN">
          <RedactionBar className="w-[104px] sm:w-[132px]" />
        </RecordField>
        <RecordField label="Mileage">
          <RedactionBar className="w-[64px] sm:w-[76px]" />
        </RecordField>
        <RecordField label="Accidents">
          <RedactionBar className="w-[44px] sm:w-[52px]" />
        </RecordField>
        <RecordField label="Service">
          <span className="font-mono text-[13.5px] tracking-tight text-foreground">
            Dealer-serviced
          </span>
        </RecordField>
      </dl>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border/60 bg-paper/50 px-5 py-3 text-xs text-muted-foreground sm:px-6">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal" />
          Sealed fields
        </span>
        <span className="font-mono text-[11px] tracking-tight">
          Proof carries no raw values
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-2xl">
          <VehicleRecord />
        </div>

        <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-20">
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-graphite sm:text-6xl">
            Prove what matters. Hide what doesn&apos;t.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            TrueMile verifies mileage, accident, and service claims about a vehicle
            without ever publishing the underlying history. Buyers confirm a claim
            against one sealed on-chain commitment.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href="/seller" variant="amber" size="lg" className="w-full sm:w-auto">
              Submit a claim
            </CtaLink>
            <CtaLink href="/buyer" variant="outline" size="lg" className="w-full sm:w-auto">
              Verify a claim
            </CtaLink>
          </div>

          <p className="mt-7 text-sm text-muted-foreground">
            Built on the Midnight Compact chain. Wave 1 ships proof of claim.
          </p>
        </div>
      </section>

      <section aria-label="For sellers and buyers" className="border-t border-border/80">
        <div className="mx-auto grid w-full max-w-5xl gap-12 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-0">
          <div className="md:pr-14">
            <h2 className="text-2xl font-semibold tracking-tight text-graphite">
              For sellers
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              Submit a claim about your vehicle&apos;s mileage, accident history, and
              service record. Your records never leave this device.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-teal" />
                The record is read only where you hold it
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-teal" />
                A proof is produced without revealing any values
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-teal" />
                Buyers see the verdict, never the data
              </li>
            </ul>
            <CtaLink href="/seller" variant="outline" size="md" className="mt-7">
              Start as a seller
            </CtaLink>
          </div>

          <div className="md:border-l md:border-border md:pl-14">
            <h2 className="text-2xl font-semibold tracking-tight text-graphite">
              For buyers
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              Check a seller&apos;s claim against its on-chain commitment. The full
              record stays sealed until you commit a deposit.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-teal" />
                Paste one hash, get the claim verdict
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-teal" />
                Deposit to unlock the full history
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[1px] bg-teal" />
                Your deposit returns if the claim does not hold
              </li>
            </ul>
            <CtaLink href="/buyer" variant="outline" size="md" className="mt-7">
              Verify as a buyer
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}
