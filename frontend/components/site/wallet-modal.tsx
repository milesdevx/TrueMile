'use client';

import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@/lib/useWallet';
import { cn } from '@/lib/utils';

/**
 * Wallet picker — shown only when zero or multiple wallets are detected; a
 * single wallet connects directly without this. The context line reinforces
 * the privacy model at the moment someone might hesitate.
 */
export function WalletModal() {
  const {
    isModalOpen,
    closeConnect,
    availableWallets,
    connect,
    isConnecting,
    error,
    networkId,
  } = useWallet();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [render, setRender] = useState(isModalOpen);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setRender(true);
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setRender(false), 180);
    return () => clearTimeout(timer);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeConnect();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModalOpen, closeConnect]);

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        onClick={closeConnect}
        className={cn(
          'absolute inset-0 cursor-default bg-ground/80 backdrop-blur-sm transition-opacity duration-200',
          shown ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-sm rounded-lg border border-line bg-panel p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] transition duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none',
          shown
            ? 'scale-100 opacity-100'
            : 'scale-[0.98] opacity-0 duration-[180ms] ease-[cubic-bezier(0.4,0,1,1)]'
        )}
      >
        <h2
          id="wallet-modal-title"
          className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-bone"
        >
          Connect a wallet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-dim">
          Required to submit a claim&apos;s proof on-chain — your vehicle data itself
          never leaves this device.
        </p>

        <div className="mt-4 space-y-2">
          {availableWallets.length === 0 ? (
            <p className="rounded-md border border-dashed border-line bg-panel2/40 px-3.5 py-3 text-sm text-faint">
              No Midnight wallet detected. Install Lace or 1AM, then reload this page.
            </p>
          ) : (
            availableWallets.map((wallet) => (
              <button
                key={wallet.rdns}
                type="button"
                onClick={() => connect(wallet.rdns)}
                disabled={isConnecting}
                className="flex w-full items-center gap-3 rounded-md border border-line bg-ground/50 px-3.5 py-2.5 text-left transition-colors hover:border-dim hover:bg-panel2/60 disabled:opacity-60"
              >
                {wallet.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={wallet.icon} alt="" className="h-7 w-7 rounded" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 place-items-center rounded bg-panel2 font-display text-sm font-semibold text-seal"
                  >
                    {wallet.name.slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-bone">
                    {wallet.name}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-faint">
                    {wallet.rdns}
                  </span>
                </span>
                <span className="text-xs font-semibold text-signal">
                  {isConnecting ? 'Connecting…' : 'Connect'}
                </span>
              </button>
            ))
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-danger/50 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line/70 pt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            Network · {networkId}
          </span>
          <button
            type="button"
            onClick={closeConnect}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-dim transition-colors hover:text-bone"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
