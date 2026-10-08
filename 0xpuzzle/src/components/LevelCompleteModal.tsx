import { Star, ArrowRight, RotateCcw, Grid, CheckCircle2 } from 'lucide-react';
import { PuzzleLevel } from '../game/types';

interface LevelCompleteModalProps {
  level: PuzzleLevel;
  moves: number;
  timeSeconds: number;
  stars: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelSelect: () => void;
}

export function LevelCompleteModal({
  level,
  moves,
  timeSeconds,
  stars,
  hasNextLevel,
  onNextLevel,
  onReplayLevel,
  onOpenLevelSelect,
}: LevelCompleteModalProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-xl w-full max-w-lg max-h-[94dvh] overflow-y-auto p-6 short:p-4 flex flex-col items-center text-center shadow-2xl font-mono">
        {/* Celebration Header Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
          Puzzle Chamber Cleared!
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-1">
          {level.title}
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-sans">
          {level.subtitle}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 transition-all ${
                stars >= starIdx
                  ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500 mb-1">MOVES TAKEN</span>
            <span className="text-lg font-bold text-slate-200">{moves}</span>
            <span className="text-[11px] text-slate-500">Par: {level.parMoves} moves</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500 mb-1">TIME TAKEN</span>
            <span className="text-lg font-bold text-slate-200">{formatTime(timeSeconds)}</span>
            <span className="text-[11px] text-slate-500">Par: {level.parTime}s</span>
          </div>
        </div>

        {/* Concept Educational Recap */}
        <div className="w-full p-3.5 bg-slate-950/40 rounded-lg border border-slate-800/80 text-left mb-6 font-sans">
          <div className="text-xs font-bold text-sky-400 font-mono mb-1">
            LOGIC DEBRIEF:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {level.hintExplanation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full sm:flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-sky-500/20"
            >
              <span>Next Level {level.id + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLevelSelect}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>View All 10 Levels</span>
              <Grid className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onReplayLevel}
              className="flex-1 sm:flex-initial p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Replay Level"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={onOpenLevelSelect}
              className="flex-1 sm:flex-initial p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Level Select"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
