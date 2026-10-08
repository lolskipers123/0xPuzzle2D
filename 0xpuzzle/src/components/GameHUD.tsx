import { Clock, MousePointer, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { PuzzleLevel, PuzzleEvaluation } from '../game/types';

interface GameHUDProps {
  level: PuzzleLevel;
  evaluation: PuzzleEvaluation;
  moves: number;
  timeElapsed: number;
  onEnterGate: () => void;
}

export function GameHUD({ level, evaluation, moves, timeElapsed, onEnterGate }: GameHUDProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="shrink-0 bg-slate-900/90 border-t border-slate-800 p-3 short:py-1.5 short:px-3 md:px-6 select-none font-mono">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row short:flex-row items-center justify-between gap-3 short:gap-2 text-xs">
        {/* Left: Level Goal & Title */}
        <div className="w-full md:w-auto short:flex-1 min-w-0 flex flex-col gap-1 short:gap-0">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-bold text-slate-100 text-sm tracking-wide">
              {level.title}
            </span>
            <span className="text-slate-500 short:hidden">·</span>
            <span className="text-slate-400 short:hidden">{level.subtitle}</span>
          </div>
          <div className="text-slate-300 font-sans text-xs short:line-clamp-2">
            <span className="font-semibold text-sky-400 font-mono">TARGET:</span> {level.targetDescription}
          </div>
        </div>

        {/* Center: Live Evaluation Bar */}
        <div className="w-full md:w-auto flex-1 max-w-md short:p-1.5 bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5 short:gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              VALUE: <strong className="text-slate-200">{evaluation.currentValueText || '...'}</strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              GOAL: <strong className="text-sky-300">{evaluation.targetValueText || '...'}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] truncate flex items-center gap-1.5">
              {evaluation.isSolved ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-semibold">BARRIER DEACTIVATED!</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-400 truncate">{evaluation.matchDetails}</span>
                </>
              )}
            </div>

            {evaluation.isSolved && (
              <button
                onClick={onEnterGate}
                className="px-3 py-2 short:py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors animate-pulse"
                title="Enter exit gate to clear level"
              >
                <Sparkles className="w-3 h-3" />
                <span>Complete Level</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Telemetry (Moves & Time) */}
        <div className="w-full md:w-auto short:w-auto flex items-center justify-between md:justify-end short:justify-end gap-4 short:gap-3 text-slate-400 text-xs">
          <div className="flex items-center gap-1.5" title="Number of switches flipped or dials turned">
            <MousePointer className="w-3.5 h-3.5 text-slate-500" />
            <span>MOVES:</span>
            <span className="text-slate-200 font-bold">{moves}</span>
            <span className="text-slate-600">/ par {level.parMoves}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Elapsed time">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>TIME:</span>
            <span className="text-slate-200 font-bold">{formatTime(timeElapsed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
