// Client-side generation of a static, embeddable "Verified on TrueMile" badge.
// The badge is plain SVG with fixed colors so it reads correctly in any external
// listing (Craigslist, Marketplace, a dealership site), independent of theme.
// Exports are rasterized to JPEG via canvas, since most listing sites won't
// accept an SVG upload.

const GROUND = '#20242d';
const PANEL = '#272c36';
const LINE = '#414855';
const BONE = '#d8d4cb';
const DIM = '#a2a8b4';
const FAINT = '#8b93a1';
const SEAL = '#c9a24a';

const SITE_URL = 'truemile-mu.vercel.app/registry';

const BADGE_WIDTH = 360;
const BADGE_HEIGHT = 110;

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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE_WIDTH}" height="${BADGE_HEIGHT}" viewBox="0 0 ${BADGE_WIDTH} ${BADGE_HEIGHT}" role="img" aria-label="${escapeXml(status)}">
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not render the badge image.'));
    image.src = src;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the badge image.'))),
      'image/jpeg',
      quality
    );
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Rasterizes the badge SVG to a JPEG (no alpha) and downloads it. `scale` of 2
 * keeps the text crisp on high-density displays.
 */
export async function downloadVerificationBadgeJpg(
  filename: string,
  svg: string,
  scale = 2
): Promise<void> {
  if (typeof window === 'undefined') return;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const width = image.naturalWidth || BADGE_WIDTH;
    const height = image.naturalHeight || BADGE_HEIGHT;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable in this browser.');

    // JPEG has no alpha channel — fill first so rounded corners aren't black.
    context.fillStyle = GROUND;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const jpeg = await canvasToJpeg(canvas, 0.92);
    triggerDownload(jpeg, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
