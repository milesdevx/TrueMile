'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'truemile-theme';

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', next);
  root.style.colorScheme = next;
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

/**
 * Light/dark toggle in the nav's right slot.
 *
 * Resolution order: an explicit saved choice wins; otherwise the system
 * preference via `prefers-color-scheme`. The matching system preference is
 * followed live until the user makes an explicit choice, at which point that
 * choice is persisted to localStorage and survives reloads. The pre-paint
 * script in the root layout applies the same logic before first paint.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = storedTheme() ?? systemTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);

    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      // An explicit choice (persisted) always wins over the system.
      if (storedTheme()) return;
      const next = systemTheme();
      setTheme(next);
      applyTheme(next);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage disabled — the choice applies for this session only.
    }
  }

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={mounted ? theme === 'light' : undefined}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-dim transition-colors hover:border-dim hover:text-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ground',
        className
      )}
    >
      {mounted && theme === 'light' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
