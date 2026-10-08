import { useState } from 'react';
import { X, Lock, CheckCircle, Star, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { PUZZLE_LEVELS } from '../game/levels';
import { PlayerProgress } from '../game/types';
import { sounds } from '../game/audio';

interface LevelSelectModalProps {
  currentLevelId: number;
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function LevelSelectModal({
  currentLevelId,
  progress,
  onSelectLevel,
  onResetProgress,
  onClose,
}: LevelSelectModalProps) {
  const [deniedLevel, setDeniedLevel] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleLevelClick = (levelId: number) => {
    sounds.enableAudioOnGesture();

    // Strict access control: cannot access if previous level is not completed
    if (levelId > progress.unlockedLevel) {
      sounds.playCipherError();
      setDeniedLevel(levelId);
      setTimeout(() => setDeniedLevel(null), 2500);
      return;
    }

    sounds.playTerminalBeep();
    onSelectLevel(levelId);
    onClose();
  };

  const calculateTotalStars = () => {
    let total = 0;
    Object.values(progress.levelStats).forEach((stat) => {
      total += stat.stars || 0;
    });
    return total;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-4 md:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              10
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-100">
                Level Selection (10 Puzzle Chambers)
              </h2>
              <p className="text-xs text-slate-400">
                Linear Access Protocol · Complete each level to unlock the next
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{calculateTotalStars()} / 30 Stars</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning notification for locked access attempt */}
        {deniedLevel !== null && (
          <div className="mx-4 md:mx-6 mt-4 p-3 bg-red-950/70 border border-red-500/50 rounded-lg flex items-center gap-2.5 text-red-200 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              <strong>Access Denied:</strong> Level {deniedLevel} is locked! You cannot gain access until you have finished Level {deniedLevel - 1}.
            </span>
          </div>
        )}

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PUZZLE_LEVELS.map((lvl) => {
            const isUnlocked = lvl.id <= progress.unlockedLevel;
            const stats = progress.levelStats[lvl.id];
            const isCompleted = stats?.completed ?? false;
            const isCurrent = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                onClick={() => handleLevelClick(lvl.id)}
                className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between relative cursor-pointer ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/50'
                    : isUnlocked
                    ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'
                    : 'border-slate-800/50 bg-slate-950/60 opacity-60 hover:border-red-900/40'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-sky-400">
                      LEVEL {lvl.id}
                    </span>

                    {isUnlocked ? (
                      isCompleted ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      ) : (
                        <span className="text-xs text-sky-400 flex items-center gap-1">
                          <Play className="w-3 h-3 fill-sky-400" />
                          <span>Unlocked</span>
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm mb-1 line-clamp-1 font-sans">
                    {lvl.title.replace(/^Level \d+: /, '')}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2 font-sans">
                    {lvl.subtitle}
                  </p>
                </div>

                {/* Card Footer: Stars & Best Stats */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  {isUnlocked ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              (stats?.stars || 0) >= starIdx
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {stats?.bestTime
                          ? `${stats.bestTime}s · ${stats.bestMoves} moves`
                          : 'Not cleared yet'}
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      Requires Level {lvl.id - 1} clearance
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:px-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Progression: Unlocked {progress.unlockedLevel} of 10 Levels
          </div>

          <div>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Progress</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-red-400">Confirm reset?</span>
                <button
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs cursor-pointer font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
