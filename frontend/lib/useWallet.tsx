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
const SESSION_KEY = 'truemile_session_v1';
const ACTIVITY_KEY_PREFIX = 'truemile_activity_';

/** How long to wait for a wallet extension to inject before giving up. */
const WALLET_WAIT_MS = 2500;
/** Shorter grace when the user explicitly clicks Connect (modal still opens after). */
const DISCOVERY_WAIT_MS = 400;
const WALLET_POLL_MS = 100;

/**
 * Personal, per-wallet activity. Kept client-side and keyed by the connected
 * address — deliberately never read from chain state, since a public
 * "who verified what" record would leak the linkage TrueMile prevents.
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
  /**
   * Returns a live ConnectedAPI, establishing one on demand. Restored sessions
   * hold no live API, so the wallet is only contacted when an action needs it —
   * never on page load.
   */
  ensureConnected: () => Promise<ConnectedAPI | null>;
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  return (
    wallets.find((wallet) => wallet.rdns === rdns) ??
    (wallets.length === 1 ? wallets[0] : undefined)
  );
}

/**
 * Wait for a specific wallet to be injected. Extensions (and the DApp
 * connector) can attach `window.midnight` after first paint, so reconnect must
 * not treat "not there yet" as "gone" — that was clearing the stored choice and
 * forcing a reconnect prompt on reload.
 */
async function waitForWallet(rdns: string, timeoutMs: number): Promise<InitialAPI | undefined> {
  const deadline = Date.now() + timeoutMs;
  let wallet = findWallet(rdns);
  while (!wallet && Date.now() < deadline) {
    await sleep(WALLET_POLL_MS);
    wallet = findWallet(rdns);
  }
  return wallet;
}

async function waitForAnyWallet(timeoutMs: number): Promise<InitialAPI[]> {
  const deadline = Date.now() + timeoutMs;
  let wallets = discoverWallets();
  while (wallets.length === 0 && Date.now() < deadline) {
    await sleep(WALLET_POLL_MS);
    wallets = discoverWallets();
  }
  return wallets;
}

function sameWallets(a: InitialAPI[], b: InitialAPI[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((wallet, i) => wallet.rdns === b[i].rdns && wallet.apiVersion === b[i].apiVersion);
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

/**
 * A remembered session: enough to restore the connected UI instantly on reload
 * without calling `connect()` (which is what prompts the wallet). No keys or
 * live API are ever stored — only the public address, wallet id, and network.
 */
interface WalletSession {
  walletId: string;
  address: string;
  networkId: string;
  savedAt: number;
}

function loadSession(): WalletSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WalletSession>;
    if (
      typeof parsed.walletId === 'string' &&
      typeof parsed.address === 'string' &&
      parsed.address.length > 0
    ) {
      return {
        walletId: parsed.walletId,
        address: parsed.address,
        networkId: typeof parsed.networkId === 'string' ? parsed.networkId : MIDNIGHT_NETWORK_ID,
        savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession(session: WalletSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage disabled — the session just won't be restored next load.
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE);
  const [availableWallets, setAvailableWallets] = useState<InitialAPI[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [activity, setActivity] = useState<WalletActivity[]>([]);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Monotonic attempt id — a newer connect/disconnect supersedes older awaits. */
  const attemptRef = useRef(0);
  /** In-flight connect per wallet, so StrictMode / rapid clicks never double-prompt. */
  const inflight = useRef<Map<string, Promise<ConnectedAPI | null>>>(new Map());

  /** Only update wallet state when the discovered set actually changed. */
  const refreshWallets = useCallback(() => {
    const wallets = discoverWallets();
    setAvailableWallets((prev) => (sameWallets(prev, wallets) ? prev : wallets));
  }, []);

  /**
   * Connects to one wallet. Deduped per wallet id: concurrent callers share a
   * single `wallet.connect` (one approval prompt), and the result is discarded
   * if a newer attempt or a disconnect happened meanwhile.
   */
  const establish = useCallback((walletId: string): Promise<ConnectedAPI | null> => {
    const existing = inflight.current.get(walletId);
    if (existing) return existing;

    const task = (async (): Promise<ConnectedAPI | null> => {
      const attempt = ++attemptRef.current;

      const wallet = await waitForWallet(walletId, WALLET_WAIT_MS);
      if (attempt !== attemptRef.current) return null;
      if (!wallet) throw new Error('wallet not found');

      const connectedApi = await wallet.connect(MIDNIGHT_NETWORK_ID);
      if (attempt !== attemptRef.current) return null;

      // Status and address are independent — fetch them in parallel to cut a
      // full round-trip off the connect path.
      const [status, shielded] = await Promise.all([
        connectedApi.getConnectionStatus(),
        connectedApi.getShieldedAddresses(),
      ]);
      if (attempt !== attemptRef.current) return null;
      if (status.status !== 'connected') {
        throw new Error(`wallet status: ${status.status}`);
      }

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

      // Remember the session so the next reload restores the connected UI
      // without calling connect() and re-prompting the wallet.
      saveSession({ walletId, address, networkId: status.networkId, savedAt: Date.now() });
      try {
        localStorage.setItem(LAST_WALLET_KEY, walletId);
      } catch {
        // Storage disabled — the choice just won't persist.
      }

      setJustConnected(true);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setJustConnected(false), 700);
      return connectedApi;
    })();

    inflight.current.set(walletId, task);
    const clear = () => {
      if (inflight.current.get(walletId) === task) inflight.current.delete(walletId);
    };
    task.then(clear, clear);
    return task;
  }, []);

  const connect = useCallback(
    async (walletId: string) => {
      setState((s) => ({ ...s, isConnecting: true, error: null }));
      try {
        const connectedApi = await establish(walletId);
        // A live connection means any cached/optimistic session is now real.
        if (connectedApi) {
          setJustConnected(true);
          setModalOpen(false);
        }
      } catch (err) {
        clearSession();
        setState({ ...INITIAL_STATE, error: friendlyError(err) });
      }
    },
    [establish]
  );

  const disconnect = useCallback(() => {
    // Supersede any in-flight connect so it can't revive the session.
    attemptRef.current += 1;
    inflight.current.clear();
    clearSession();
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

  const openConnect = useCallback(() => {
    void (async () => {
      setState((s) => ({ ...s, error: null }));
      const wallets = await waitForAnyWallet(DISCOVERY_WAIT_MS);
      setAvailableWallets((prev) => (sameWallets(prev, wallets) ? prev : wallets));

      // Exactly one wallet: connect directly, no need for a picker.
      if (wallets.length === 1) {
        await connect(wallets[0].rdns);
        return;
      }
      setModalOpen(true);
    })();
  }, [connect]);

  const closeConnect = useCallback(() => setModalOpen(false), []);

  /**
   * Used by actions (submit/verify): reuse the live API if we have one, otherwise
   * establish it now. This is the only place a restored session touches the
   * wallet, so the authorization prompt happens at the point of action rather
   * than on every page load.
   */
  const ensureConnected = useCallback(async (): Promise<ConnectedAPI | null> => {
    if (state.connectedApi) return state.connectedApi;
    if (!state.walletId) {
      openConnect();
      return null;
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const connectedApi = await establish(state.walletId);
      if (!connectedApi) {
        setState((s) => (s.isConnected ? s : { ...s, isConnecting: false }));
      }
      return connectedApi;
    } catch (err) {
      clearSession();
      setState({ ...INITIAL_STATE, error: friendlyError(err) });
      return null;
    }
  }, [establish, openConnect, state.connectedApi, state.walletId]);

  const reconnect = useCallback(() => {
    const walletId = state.walletId;
    if (!walletId) {
      setModalOpen(true);
      return;
    }
    void connect(walletId);
  }, [connect, state.walletId]);

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
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refreshWallets]);

  // While the picker is open with nothing found, keep polling for injection.
  useEffect(() => {
    if (!isModalOpen || availableWallets.length > 0) return;
    const interval = setInterval(refreshWallets, 500);
    return () => clearInterval(interval);
  }, [isModalOpen, availableWallets.length, refreshWallets]);

  // Restore a remembered session on load WITHOUT calling the wallet. The
  // connector has no session probe, so calling connect() here is exactly what
  // made the wallet ask to reconnect on every refresh. We paint the connected
  // UI from the cached session and only contact the wallet at the point of
  // action (see ensureConnected).
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setState({
        isConnected: true,
        isConnecting: false,
        connectedApi: null,
        address: session.address,
        connectedNetworkId: session.networkId,
        walletId: session.walletId,
        error: null,
      });
      setActivity(loadActivity(session.address));
      return;
    }

    // Back-compat with a wallet id saved before sessions were cached: keep the
    // id so the next action can reconnect lazily, but don't connect now.
    let walletId: string | null = null;
    try {
      walletId = localStorage.getItem(LAST_WALLET_KEY);
    } catch {
      walletId = null;
    }
    if (walletId) setState((s) => ({ ...s, walletId }));
  }, []);

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
      ensureConnected,
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
      ensureConnected,
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
