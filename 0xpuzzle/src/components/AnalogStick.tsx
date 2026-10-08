import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

interface AnalogStickProps {
  /** Called with the horizontal tilt, -1 (full left) .. 1 (full right). 0 on release. */
  onChange: (x: number) => void;
}

/**
 * A virtual analog joystick. Drag the knob anywhere inside the base circle; the farther
 * you push it, the faster the player walks. Uses pointer capture so the drag keeps
 * working even when the finger slides outside the circle, and it ignores other fingers
 * (so you can hold the stick and tap jump at the same time).
 */
export function AnalogStick({ onChange }: AnalogStickProps) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const reset = () => {
    activeId.current = null;
    setKnob({ x: 0, y: 0 });
    setActive(false);
    onChange(0);
  };

  // Never leave the stick "stuck" if the page is hidden or the phone is rotated mid-drag.
  useEffect(() => {
    window.addEventListener('blur', reset);
    window.addEventListener('orientationchange', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      window.removeEventListener('blur', reset);
      window.removeEventListener('orientationchange', reset);
      document.removeEventListener('visibilitychange', reset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (e: ReactPointerEvent<HTMLDivElement>) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const radius = rect.width / 2;
    const maxTravel = radius * 0.62; // how far the knob may move from centre
    let dx = e.clientX - (rect.left + radius);
    let dy = e.clientY - (rect.top + radius);
    const dist = Math.hypot(dx, dy);
    if (dist > maxTravel) {
      dx = (dx / dist) * maxTravel;
      dy = (dy / dist) * maxTravel;
    }
    setKnob({ x: dx, y: dy });
    onChange(dx / maxTravel);
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeId.current !== null) return;
    e.preventDefault();
    activeId.current = e.pointerId;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setActive(true);
    if (navigator.vibrate) navigator.vibrate(8);
    update(e);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activeId.current) return;
    update(e);
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activeId.current) return;
    reset();
  };

  return (
    <div
      ref={baseRef}
      role="slider"
      aria-label="Move stick"
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={Math.round((knob.x / 40) * 100) / 100}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onLostPointerCapture={onUp}
      onContextMenu={(e) => e.preventDefault()}
      className={`pointer-events-auto relative size-28 short:size-24 shrink-0 rounded-full border-2 touch-none select-none backdrop-blur-md transition-colors ${
        active ? 'border-sky-400/80 bg-sky-500/10' : 'border-slate-600 bg-slate-900/70'
      }`}
    >
      {/* Direction hints */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">◀</span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">▶</span>
      {/* Knob */}
      <div
        className={`absolute left-1/2 top-1/2 size-12 short:size-10 rounded-full border shadow-xl ${
          active ? 'bg-sky-500 border-sky-300' : 'bg-slate-700 border-slate-500'
        }`}
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          transition: active ? 'none' : 'transform 120ms ease-out',
        }}
      />
    </div>
  );
}
