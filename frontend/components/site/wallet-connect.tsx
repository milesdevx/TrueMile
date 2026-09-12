'use client';

import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@/lib/useWallet';
import { WalletProfile, type ProfileAnchor } from '@/components/site/wallet-profile';
import { cn } from '@/lib/utils';

function truncateAddress(address: string): string {
  return `${address.slice(0, 10)}…${address.slice(-4)}`;
}

/**
 * Nav-right wallet slot. Disconnected → "Connect Wallet". Connected → a pill
 * that opens the profile panel; wrong-network gets its own calm danger state.
 * The connected dot pulses exactly once, then sits static.
 */
export function WalletButton({ className }: { className?: string }) {
  const { isConnected, isConnecting, address, justConnected, isWrongNetwork, openConnect } =
    useWallet();
  const [panelOpen, setPanelOpen] = useState(false);
  const [anchor, setAnchor] = useState<ProfileAnchor | null>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  function computeAnchor() {
    const rect = pillRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
  }

  function togglePanel() {
    computeAnchor();
    setPanelOpen((value) => !value);
  }

  useEffect(() => {
    if (!panelOpen) return;
    const update = () => computeAnchor();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [panelOpen]);

  if (isConnected && address) {
    return (
      <div className={cn('relative', className)}>
        <button
          ref={pillRef}
          type="button"
          onClick={togglePanel}
          aria-haspopup="dialog"
          aria-expanded={panelOpen}
          title={isWrongNetwork ? 'Wrong network — open for details' : 'Wallet'}
          className={cn(
            'inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ground',
            isWrongNetwork
              ? 'border-danger/50 bg-danger/10 text-danger hover:border-danger/70'
              : 'border-line bg-panel2/70 text-bone hover:border-dim'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              isWrongNetwork ? 'bg-danger' : 'bg-seal',
              justConnected && !isWrongNetwork && 'dot-confirm'
            )}
          />
          <span className="font-mono text-[11px] tracking-tight">
            {isWrongNetwork ? 'Wrong network' : truncateAddress(address)}
          </span>
        </button>

        <WalletProfile open={panelOpen} onClose={() => setPanelOpen(false)} anchor={anchor} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openConnect}
      disabled={isConnecting}
      className={cn(
        'inline-flex h-8 items-center rounded-md border border-signal/60 bg-transparent px-3 text-xs font-semibold text-signal transition-colors duration-150 hover:bg-signal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ground disabled:opacity-60',
        className
      )}
    >
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
