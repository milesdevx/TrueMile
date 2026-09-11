'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet, type WalletActivityType } from '@/lib/useWallet';
import { cn } from '@/lib/utils';

function truncateAddress(address: string): string {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function shortHash(value: string): string {
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TYPE_LABEL: Record<WalletActivityType, string> = {
  claim_submitted: 'Claim submitted',
  claim_verified: 'Claim verified',
  deposit_committed: 'Deposit committed',
  history_unlocked: 'History unlocked',
  attestation_received: 'Attestation received',
};

const TYPE_TONE: Record<WalletActivityType, string> = {
  claim_submitted: 'text-sealed',
  claim_verified: 'text-seal',
  deposit_committed: 'text-signal',
  history_unlocked: 'text-seal',
  attestation_received: 'text-seal',
};

function TypeIcon({ type }: { type: WalletActivityType }) {
  const common = {
    viewBox: '0 0 24 24',
    className: cn('h-4 w-4 shrink-0', TYPE_TONE[type]),
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (type) {
    case 'claim_submitted':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v4h4M10 12h6M10 16h6" />
        </svg>
      );
    case 'claim_verified':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
      );
    case 'deposit_committed':
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="12" rx="2" />
          <path d="M4 11h16M12 7V5" />
        </svg>
      );
    case 'history_unlocked':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 7.5-2" />
        </svg>
      );
    case 'attestation_received':
      return (
        <svg {...common}>
          <path d="M12 3l2 4 4 .5-3 3 .8 4L12 12.5 8.2 14.5 9 10.5 6 7.5 10 7z" />
        </svg>
      );
    default:
      return null;
  }
}

export interface ProfileAnchor {
  top: number;
  right: number;
}

interface WalletProfileProps {
  open: boolean;
  onClose: () => void;
  anchor: ProfileAnchor | null;
}

/**
 * Opens from the connected pill: dropdown on desktop, slide-up sheet on mobile.
 * Rendered through a portal because the blurred header is a containing block
 * for fixed positioning. Activity is private to the wallet and client-side.
 */
export function WalletProfile({ open, onClose, anchor }: WalletProfileProps) {
  const { address, networkId, isWrongNetwork, activity, reconnect, disconnect } = useWallet();
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setRender(true);
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setRender(false), 180);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    activity.forEach((entry) => seen.current.add(entry.id));
  }, [activity]);

  if (!render || !address || typeof document === 'undefined') return null;

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — the address still selects normally.
    }
  }

  const desktopPosition =
    isDesktop && anchor ? { top: anchor.top, right: anchor.right } : undefined;

  const panel = (
    <>
      <button
        type="button"
        aria-label="Close wallet panel"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-ground/70 backdrop-blur-sm transition-opacity duration-200 sm:hidden',
          shown ? 'opacity-100' : 'opacity-0'
        )}
      />

      <div
        role="dialog"
        aria-label="Wallet"
        style={desktopPosition}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl border border-line bg-panel p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] transition duration-[240ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          isDesktop && 'inset-x-auto bottom-auto w-80 rounded-lg',
          shown
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0 duration-[180ms] ease-[cubic-bezier(0.4,0,1,1)]'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={copyAddress}
            title="Copy address"
            className="group flex min-w-0 items-center gap-2 text-left"
          >
            <code className="truncate font-mono text-[12px] text-bone">
              {truncateAddress(address)}
            </code>
            <span
              className={cn(
                'shrink-0 text-[11px] font-medium text-seal transition-opacity duration-150',
                copied ? 'opacity-100' : 'opacity-0'
              )}
              aria-live="polite"
            >
              Copied
            </span>
          </button>
          <span className="shrink-0 rounded-[4px] border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            {isWrongNetwork ? 'mismatch' : networkId}
          </span>
        </div>

        {isWrongNetwork && (
          <div className="mt-4 rounded-md border border-danger/50 bg-danger/10 px-3 py-2.5">
            <p className="text-sm text-danger">Wrong network</p>
            <p className="mt-1 text-xs leading-relaxed text-dim">
              Switch to {networkId} in your wallet, then reconnect.
            </p>
            <button
              type="button"
              onClick={reconnect}
              className="mt-2.5 rounded-md border border-danger/50 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10"
            >
              Reconnect
            </button>
          </div>
        )}

        <div className="mt-5">
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            My activity
          </h3>

          {activity.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-dim">
              No activity yet — submit or verify a claim to see it here.
            </p>
          ) : (
            <ul className="mt-3 space-y-1">
              {activity.map((entry) => {
                const isNew = !seen.current.has(entry.id);
                return (
                  <li
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2 py-2',
                      isNew && 'fade-up'
                    )}
                  >
                    <TypeIcon type={entry.type} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-bone">{TYPE_LABEL[entry.type]}</span>
                      {entry.commitment && (
                        <span className="block truncate font-mono text-[11px] text-faint">
                          {shortHash(entry.commitment)}
                        </span>
                      )}
                    </span>
                    <time
                      dateTime={new Date(entry.timestamp).toISOString()}
                      className="shrink-0 font-mono text-[10px] text-faint"
                    >
                      {formatTimestamp(entry.timestamp)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 border-t border-line/70 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              disconnect();
            }}
            className="text-sm text-dim underline decoration-line underline-offset-4 transition-colors hover:text-bone"
          >
            Disconnect
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(panel, document.body);
}
