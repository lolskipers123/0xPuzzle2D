import { Trophy, Star, RotateCcw, Grid, Sparkles, CheckCircle2 } from 'lucide-react';
import { PlayerProgress } from '../game/types';

interface GameVictoryModalProps {
  progress: PlayerProgress;
  onOpenLevelSelect: () => void;
  onRestartAll: () => void;
  onClose: () => void;
}

export function GameVictoryModal({
  progress,
  onOpenLevelSelect,
  onRestartAll,
  onClose,
}: GameVictoryModalProps) {
  let totalStars = 0;
  let totalTime = 0;
  let totalMoves = 0;

  Object.values(progress.levelStats).forEach((s) => {
    totalStars += s.stars || 0;
    totalTime += s.bestTime || 0;
    totalMoves += s.bestMoves || 0;
  });

  const formatTotalTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-lg max-h-[94dvh] overflow-y-auto p-6 short:p-4 md:p-8 flex flex-col items-center text-center shadow-2xl font-mono relative">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
          <Trophy className="w-8 h-8 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>All 10 Levels Completed!</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2 font-mono">
          MASTER LOGICIAN
        </h2>

        <p className="text-xs text-slate-400 mb-6 font-sans max-w-sm">
          You conquered every binary, hexadecimal, and boolean logic puzzle chamber. The Master Citadel Core has been fully decrypted.
        </p>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-6 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500 mb-1 text-[11px]">TOTAL STARS</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold text-base">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{totalStars}/30</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500 mb-1 text-[11px]">BEST TIME</span>
            <span className="text-base font-bold text-slate-200">
              {formatTotalTime(totalTime)}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-slate-500 mb-1 text-[11px]">TOTAL MOVES</span>
            <span className="text-base font-bold text-slate-200">{totalMoves}</span>
          </div>
        </div>

        {/* Master Badges Earned */}
        <div className="w-full p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-left mb-6 text-xs font-sans">
          <div className="font-bold text-sky-400 font-mono mb-2">
            CONQUERED PROTOCOLS:
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>4-Bit & 8-Bit Binary</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hexadecimal Dials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Boolean AND / OR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bitwise XOR Cipher</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hex RGB Colors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Binary Half-Adder</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          <button
            onClick={() => {
              onClose();
              onOpenLevelSelect();
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Grid className="w-4 h-4" />
            <span>Review Level Select</span>
          </button>

          <button
            onClick={onRestartAll}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
}
