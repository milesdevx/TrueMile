'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

/**
 * Network id is environment-driven so redeploying to a different network is an
 * env-var change, not a code change. 'undeployed' for local, 'preprod' deployed.
 */
export const MIDNIGHT_NETWORK_ID =
  process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID ?? 'preprod';

const LAST_WALLET_KEY = 'truemile_last_wallet';
const ACTIVITY_KEY_PREFIX = 'truemile_activity_';

/**
 * Personal, per-wallet activity. Kept client-side and keyed by the connected
 * address — deliberately never read from chain state, since a public
 * "who verified what" record would leak the linkage TrueMile prevents.
 * The type union is already open-ended so Waves 2/3 add rows without a rebuild.
 */
export type WalletActivityType =
  | 'claim_submitted'
  | 'claim_verified'
  | 'deposit_committed'
  | 'history_unlocked'
  | 'attestation_received';

export interface WalletActivity {
  id: string;
  type: WalletActivityType;
  commitment?: string;
  timestamp: number;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  connectedApi: ConnectedAPI | null;
  address: string | null;
  connectedNetworkId: string | null;
  walletId: string | null;
  error: string | null;
}

export interface WalletContextValue extends WalletState {
  networkId: string;
  isWrongNetwork: boolean;
  availableWallets: InitialAPI[];
  isModalOpen: boolean;
  /** True briefly after a successful connect, for the one-time dot pulse. */
  justConnected: boolean;
  activity: WalletActivity[];
  openConnect: () => void;
  closeConnect: () => void;
  connect: (walletId: string) => Promise<void>;
  reconnect: () => void;
  disconnect: () => void;
  recordActivity: (type: WalletActivityType, commitment?: string) => void;
}

const INITIAL_STATE: WalletState = {
  isConnected: false,
  isConnecting: false,
  connectedApi: null,
  address: null,
  connectedNetworkId: null,
  walletId: null,
  error: null,
};

const WalletContext = createContext<WalletContextValue | null>(null);

/** Non-alarming, non-leaking copy — never surface a raw thrown error. */
function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : '';
  if (/reject|declin|cancel|den(y|ied)|dismiss/i.test(message)) {
    return 'Connection request was dismissed. Try again when you’re ready.';
  }
  if (/not found|missing|install|undefined/i.test(message)) {
    return 'No Midnight wallet detected. Install Lace or 1AM, then try again.';
  }
  if (/disconnect|status|network/i.test(message)) {
    return 'Your wallet isn’t ready. Open it, make sure it’s on the right network, then try again.';
  }
  return 'Couldn’t connect to your wallet. Please try again.';
}

/**
 * Wallets inject their InitialAPI under an arbitrary key in `window.midnight`
 * (often a UUID) — `rdns` is the wallet's identifier, not the object key. So we
 * always scan the values and match on `rdns`; never index by `rdns`.
 */
function walletEntries(): InitialAPI[] {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.values(window.midnight).filter(Boolean);
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** One entry per wallet, preferring the highest API version it injects. */
function discoverWallets(): InitialAPI[] {
  const byRdns = new Map<string, InitialAPI>();
  for (const wallet of walletEntries()) {
    const existing = byRdns.get(wallet.rdns);
    if (!existing || compareVersions(wallet.apiVersion, existing.apiVersion) > 0) {
      byRdns.set(wallet.rdns, wallet);
    }
  }
  return Array.from(byRdns.values());
}

function findWallet(rdns: string): InitialAPI | undefined {
  const wallets = walletEntries();
  return wallets.find((wallet) => wallet.rdns === rdns) ?? (wallets.length === 1 ? wallets[0] : undefined);
}

function activityStorageKey(address: string): string {
  return `${ACTIVITY_KEY_PREFIX}${address}`;
}

function loadActivity(address: string): WalletActivity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(activityStorageKey(address));
    return raw ? (JSON.parse(raw) as WalletActivity[]) : [];
  } catch {
    return [];
  }
}

function saveActivity(address: string, items: WalletActivity[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(activityStorageKey(address), JSON.stringify(items));
  } catch {
    // Storage disabled — activity stays in memory for this session.
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE);
  const [availableWallets, setAvailableWallets] = useState<InitialAPI[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [activity, setActivity] = useState<WalletActivity[]>([]);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshWallets = useCallback(() => {
    setAvailableWallets(discoverWallets());
  }, []);

  const establish = useCallback(async (walletId: string) => {
    const wallet = typeof window !== 'undefined' ? findWallet(walletId) : undefined;
    if (!wallet) throw new Error('wallet not found');

    const connectedApi = await wallet.connect(MIDNIGHT_NETWORK_ID);
    const status = await connectedApi.getConnectionStatus();
    if (status.status !== 'connected') {
      throw new Error(`wallet status: ${status.status}`);
    }
    const shielded = await connectedApi.getShieldedAddresses();
    const address = shielded.shieldedAddress;

    setState({
      isConnected: true,
      isConnecting: false,
      connectedApi,
      address,
      connectedNetworkId: status.networkId,
      walletId,
      error: null,
    });
    setActivity(loadActivity(address));

    try {
      localStorage.setItem(LAST_WALLET_KEY, walletId);
    } catch {
      // Storage disabled — the choice just won't persist.
    }

    setJustConnected(true);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setJustConnected(false), 700);
  }, []);

  const connect = useCallback(
    async (walletId: string) => {
      setState((s) => ({ ...s, isConnecting: true, error: null }));
      try {
        await establish(walletId);
        setModalOpen(false);
      } catch (err) {
        setState({ ...INITIAL_STATE, error: friendlyError(err) });
      }
    },
    [establish]
  );

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(LAST_WALLET_KEY);
    } catch {
      // ignore
    }
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    setJustConnected(false);
    setActivity([]);
    setState(INITIAL_STATE);
  }, []);

  const reconnect = useCallback(() => {
    const walletId = state.walletId;
    if (!walletId) {
      setModalOpen(true);
      return;
    }
    void connect(walletId);
  }, [connect, state.walletId]);

  const openConnect = useCallback(() => {
    const wallets = discoverWallets();
    setAvailableWallets(wallets);
    setState((s) => ({ ...s, error: null }));

    // Exactly one wallet: connect directly, no need for a picker.
    if (wallets.length === 1) {
      void connect(wallets[0].rdns);
      return;
    }
    setModalOpen(true);
  }, [connect]);

  const closeConnect = useCallback(() => setModalOpen(false), []);

  const recordActivity = useCallback(
    (type: WalletActivityType, commitment?: string) => {
      const address = state.address;
      if (!address) return;
      const entry: WalletActivity = {
        id: makeId(),
        type,
        commitment,
        timestamp: Date.now(),
      };
      setActivity((prev) => {
        const next = [entry, ...prev];
        saveActivity(address, next);
        return next;
      });
    },
    [state.address]
  );

  // Wallet extensions can inject after first paint; refresh on mount, focus,
  // and visibility so a late-injecting wallet still appears.
  useEffect(() => {
    refreshWallets();
    const onFocus = () => refreshWallets();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const timer = setTimeout(refreshWallets, 800);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      clearTimeout(timer);
    };
  }, [refreshWallets]);

  // Persist across reloads: silently reconnect to the last wallet, if present.
  useEffect(() => {
    let cancelled = false;
    let walletId: string | null = null;
    try {
      walletId = localStorage.getItem(LAST_WALLET_KEY);
    } catch {
      walletId = null;
    }
    if (!walletId) return;

    setState((s) => ({ ...s, isConnecting: true }));
    establish(walletId)
      .catch(() => {
        if (cancelled) return;
        try {
          localStorage.removeItem(LAST_WALLET_KEY);
        } catch {
          // ignore
        }
        setState(INITIAL_STATE);
      })
      .finally(() => {
        if (!cancelled) setState((s) => ({ ...s, isConnecting: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [establish]);

  useEffect(
    () => () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    },
    []
  );

  const isWrongNetwork =
    state.isConnected &&
    state.connectedNetworkId !== null &&
    state.connectedNetworkId !== MIDNIGHT_NETWORK_ID;

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      networkId: MIDNIGHT_NETWORK_ID,
      isWrongNetwork,
      availableWallets,
      isModalOpen,
      justConnected,
      activity,
      openConnect,
      closeConnect,
      connect,
      reconnect,
      disconnect,
      recordActivity,
    }),
    [
      state,
      isWrongNetwork,
      availableWallets,
      isModalOpen,
      justConnected,
      activity,
      openConnect,
      closeConnect,
      connect,
      reconnect,
      disconnect,
      recordActivity,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
