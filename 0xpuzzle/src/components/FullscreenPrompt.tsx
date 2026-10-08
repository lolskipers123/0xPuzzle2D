import { useEffect, useRef, useState } from 'react';
import { Maximize, X } from 'lucide-react';
import { enterFullscreen, fullscreenSupported, isFullscreen } from '../lib/fullscreen';

/**
 * Browsers never allow fullscreen without a tap, so rotating the phone alone can't do it.
 * Instead, after rotating to landscape this (1) shows a small "Tap for fullscreen" pill and
 * (2) enters fullscreen on the player's very next touch, so just starting to play does it.
 */
export function FullscreenPrompt() {
  const supported = fullscreenSupported();
  const isTouch = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false);

  const [landscape, setLandscape] = useState(() => window.matchMedia?.('(orientation: landscape)').matches ?? false);
  const [fs, setFs] = useState(() => isFullscreen());
  const [dismissed, setDismissed] = useState(false);
  const armed = useRef(false); // only auto-enter right after a rotation to landscape

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)');
    const onRotate = () => {
      setLandscape(mq.matches);
      if (mq.matches && !isFullscreen()) {
        armed.current = true;
        setDismissed(false);
      }
    };
    mq.addEventListener('change', onRotate);

    const onFs = () => {
      setFs(isFullscreen());
      armed.current = false; // once the player has entered or left fullscreen, stop auto-entering
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      mq.removeEventListener('change', onRotate);
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  // The next touch after rotating counts as the gesture that lets us go fullscreen.
  // (For touch input, browsers treat pointerup, not pointerdown, as the activating event.)
  useEffect(() => {
    if (!supported || !isTouch || !landscape || fs) return;
    const onUp = () => {
      if (!armed.current) return;
      armed.current = false;
      void enterFullscreen();
    };
    window.addEventListener('pointerup', onUp, { capture: true });
    return () => window.removeEventListener('pointerup', onUp, { capture: true });
  }, [supported, isTouch, landscape, fs]);

  if (!supported || !isTouch || !landscape || fs || dismissed) return null;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-sky-500 text-slate-950 shadow-xl font-mono text-xs font-bold">
      <button
        onClick={() => void enterFullscreen()}
        className="flex items-center gap-1.5 pl-3 pr-2 py-2 min-h-10"
      >
        <Maximize className="w-4 h-4" />
        Tap for fullscreen
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="size-10 flex items-center justify-center rounded-full"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
