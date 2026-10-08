/** Small cross-browser wrapper around the Fullscreen API (incl. old WebKit prefixes). */

type FsDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

export function fullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement as FsEl;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

/** True when launched from the home screen as an installed app (already full screen). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return !!(window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: standalone)').matches ||
    nav.standalone);
}

export async function enterFullscreen(): Promise<boolean> {
  const el = document.documentElement as FsEl;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else return false;
  } catch {
    return false;
  }
  // On Android, landscape gives a much bigger play area. Only allowed while fullscreen.
  try {
    const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await o.lock?.('landscape');
  } catch {
    // not supported / not allowed: ignore
  }
  return true;
}

export async function exitFullscreen(): Promise<void> {
  const d = document as FsDoc;
  try {
    if (d.exitFullscreen) await d.exitFullscreen();
    else if (d.webkitExitFullscreen) await d.webkitExitFullscreen();
  } catch {
    // ignore
  }
  try {
    screen.orientation?.unlock?.();
  } catch {
    // ignore
  }
}

export async function toggleFullscreen(): Promise<void> {
  if (isFullscreen()) await exitFullscreen();
  else await enterFullscreen();
}
