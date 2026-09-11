// Client-side generation of a static, embeddable "Verified on TrueMile" badge.
// The badge is plain SVG with fixed colors so it reads correctly in any external
// listing (Craigslist, Marketplace, a dealership site), independent of theme.

const GROUND = '#15171c';
const PANEL = '#1b1e26';
const LINE = '#31363f';
const BONE = '#ece8df';
const DIM = '#9096a3';
const FAINT = '#5c6270';
const SEAL = '#c9a24a';

const SITE_URL = 'truemile-mu.vercel.app/registry';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortHash(value: string): string {
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

export interface VerificationBadgeOptions {
  commitment: string;
  vehicleId: string;
  verified: boolean;
}

/** Returns a self-contained SVG string. No external assets or fonts. */
export function buildVerificationBadgeSvg({
  commitment,
  vehicleId,
  verified,
}: VerificationBadgeOptions): string {
  const accent = verified ? SEAL : '#d3654f';
  const status = verified ? 'Verified on TrueMile' : 'Not verified';
  const check = verified
    ? `<path d="M262 55.5 l6 6 l12 -13" fill="none" stroke="${GROUND}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`
    : `<path d="M264 49 l16 16 M280 49 l-16 16" fill="none" stroke="${GROUND}" stroke-width="3.2" stroke-linecap="round" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="110" viewBox="0 0 360 110" role="img" aria-label="${escapeXml(status)}">
  <rect x="0.5" y="0.5" width="359" height="109" rx="12" fill="${GROUND}" stroke="${LINE}" />
  <rect x="8" y="8" width="344" height="94" rx="8" fill="${PANEL}" stroke="${LINE}" stroke-dasharray="4 5" />
  <circle cx="278" cy="55" r="26" fill="${accent}" />
  <circle cx="278" cy="55" r="20" fill="none" stroke="${GROUND}" stroke-width="1" opacity="0.35" />
  ${check}
  <text x="28" y="42" fill="${BONE}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700">${escapeXml(status)}</text>
  <text x="28" y="62" fill="${DIM}" font-family="Courier New, monospace" font-size="10">${escapeXml(shortHash(commitment))}</text>
  <text x="28" y="86" fill="${FAINT}" font-family="Courier New, monospace" font-size="9">VIN ${escapeXml(shortHash(vehicleId))} · ${SITE_URL}</text>
</svg>`;
}

export function downloadVerificationBadge(filename: string, svg: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
