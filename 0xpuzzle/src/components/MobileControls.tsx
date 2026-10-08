import { RefObject, PointerEvent as ReactPointerEvent, useEffect } from 'react';
import { ArrowUp, HandMetal } from 'lucide-react';
import { AnalogStick } from './AnalogStick';
import { PuzzleEngine } from '../game/puzzleEngine';

interface MobileControlsProps {
  engineRef: RefObject<PuzzleEngine | null>;
}

type TapAction = 'jump' | 'interact';

const BTN =
  'size-14 short:size-12 rounded-2xl border backdrop-blur-md flex items-center justify-center shadow-xl ' +
  'select-none touch-none transition-transform active:scale-95';

/**
 * On-screen controls for touch devices: an analog stick on the left, interact + jump on
 * the right. Uses Pointer Events (not separate touch + mouse handlers) so a single tap
 * never fires twice, and so the stick can be held while jumping (multi-touch). The engine is read from a ref at event time, so the buttons
 * work as soon as the engine exists.
 */
export function MobileControls({ engineRef }: MobileControlsProps) {
  const buzz = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
  };

  const releaseAll = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.keys.left = false;
    engine.keys.right = false;
    engine.analogX = 0;
  };

  // Never leave the player "stuck walking" if the page is hidden or the phone is rotated mid-press.
  useEffect(() => {
    const onHide = () => releaseAll();
    window.addEventListener('blur', onHide);
    window.addEventListener('orientationchange', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('blur', onHide);
      window.removeEventListener('orientationchange', onHide);
      document.removeEventListener('visibilitychange', onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (action: TapAction) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const engine = engineRef.current;
      if (!engine) return;
      buzz();
      if (action === 'jump') engine.triggerJump();
      else engine.triggerInteract();
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div className="touch-controls shrink-0 w-full items-end justify-between gap-3 px-3 pt-2 pb-1 select-none">
      {/* Left hand: analog stick */}
      <AnalogStick
        onChange={(x) => {
          const engine = engineRef.current;
          if (engine) engine.analogX = x;
        }}
      />

      {/* Right hand: interact + jump */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          {...tap('interact')}
          className={`${BTN} flex-col bg-slate-900/80 active:bg-emerald-500/80 border-slate-700 text-emerald-400 text-[10px] font-bold font-mono`}
          aria-label="Interact"
        >
          <HandMetal className="w-5 h-5 mb-0.5" />
          <span>[E]</span>
        </button>
        <button
          {...tap('jump')}
          className={`${BTN} bg-sky-600 active:bg-sky-500 border-sky-400 text-white`}
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
