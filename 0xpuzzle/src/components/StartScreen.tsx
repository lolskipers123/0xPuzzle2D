import { Maximize, Play, Smartphone, Volume2 } from 'lucide-react';
import { fullscreenSupported } from '../lib/fullscreen';

interface StartScreenProps {
  onStart: (fullscreen: boolean) => void;
}

/**
 * Shown once on touch devices. Tapping a button is the user gesture browsers require to
 * (1) unlock sound and (2) enter fullscreen, so both happen with one tap.
 */
export function StartScreen({ onStart }: StartScreenProps) {
  const canFullscreen = fullscreenSupported();

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-4 py-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center text-sky-400 text-2xl font-bold">
          0x
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">0xPUZZLE</h1>
          <p className="text-xs text-slate-400 mt-1">Binary &amp; Hex puzzle platformer</p>
        </div>

        {canFullscreen ? (
          <button
            onClick={() => onStart(true)}
            className="w-full min-h-12 px-4 py-3 rounded-xl bg-sky-500 active:bg-sky-400 text-slate-950 font-bold flex items-center justify-center gap-2"
          >
            <Maximize className="w-5 h-5" />
            Play Fullscreen
          </button>
        ) : null}

        <button
          onClick={() => onStart(false)}
          className={`w-full min-h-12 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
            canFullscreen
              ? 'bg-slate-800 active:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-sky-500 active:bg-sky-400 text-slate-950'
          }`}
        >
          <Play className="w-5 h-5" />
          {canFullscreen ? 'Play in Browser' : 'Play'}
        </button>

        <div className="text-[11px] text-slate-500 flex flex-col gap-1.5 items-center">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> Best in landscape: turn your phone sideways
          </span>
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" /> Sound on: check your phone isn&apos;t on silent
          </span>
          {!canFullscreen && (
            <span className="max-w-[18rem] leading-snug mt-1 text-slate-400">
              For full screen on iPhone: tap Share, then &quot;Add to Home Screen&quot;, and open the game from your home screen.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
