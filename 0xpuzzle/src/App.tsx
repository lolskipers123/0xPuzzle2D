import { useEffect, useRef, useState } from 'react';
import { PuzzleEngine } from './game/puzzleEngine';
import { PUZZLE_LEVELS } from './game/levels';
import { PlayerProgress, PuzzleEvaluation } from './game/types';
import { TopNav } from './components/TopNav';
import { GameHUD } from './components/GameHUD';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameVictoryModal } from './components/GameVictoryModal';
import { HintModal } from './components/HintModal';
import { ControlsModal } from './components/ControlsModal';
import { MobileControls } from './components/MobileControls';
import { sounds } from './game/audio';
import { StartScreen } from './components/StartScreen';
import { FullscreenPrompt } from './components/FullscreenPrompt';
import { enterFullscreen, isFullscreen, isStandalone } from './lib/fullscreen';

const STORAGE_KEY = 'hex_binary_puzzle_v1';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PuzzleEngine | null>(null);

  // Player Progression State
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.unlockedLevel === 'number') {
          return {
            unlockedLevel: Math.max(1, Math.min(10, parsed.unlockedLevel)),
            levelStats: parsed.levelStats || {},
          };
        }
      }
    } catch {
      // Fallback
    }
    return {
      unlockedLevel: 1, // Only Level 1 is unlocked initially!
      levelStats: {},
    };
  });

  // Current Level
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    return 1;
  });

  // Realtime Puzzle Engine State
  const [evaluation, setEvaluation] = useState<PuzzleEvaluation>({
    isSolved: false,
    currentValueText: '',
    targetValueText: '',
    matchDetails: '',
    percentMatch: 0,
  });
  const [moves, setMoves] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Touch devices get a one-time start screen: the tap unlocks sound and can enter fullscreen
  const [showStart, setShowStart] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const touch = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    return touch && !isStandalone() && !isFullscreen();
  });

  const handleStart = async (wantFullscreen: boolean) => {
    sounds.enableAudioOnGesture(); // must run inside the tap to unlock audio
    setShowStart(false);
    if (wantFullscreen) await enterFullscreen();
  };

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [clearedLevelStats, setClearedLevelStats] = useState<{ moves: number; time: number; stars: number }>({
    moves: 0,
    time: 0,
    stars: 1,
  });

  // Save progress helper
  const saveProgress = (newProgress: PlayerProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // Storage unavailable
    }
  };

  const currentLevel = PUZZLE_LEVELS.find((l) => l.id === currentLevelId) || PUZZLE_LEVELS[0];

  // Initialize Puzzle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new PuzzleEngine(canvas, currentLevelId);
    engineRef.current = engine;

    engine.onEvaluationChange = (evalResult, movesCount, timeSecs) => {
      setEvaluation(evalResult);
      setMoves(movesCount);
      setTimeElapsed(timeSecs);
    };

    engine.onLevelComplete = (levelId, movesTaken, timeTaken, starsEarned) => {
      setClearedLevelStats({ moves: movesTaken, time: timeTaken, stars: starsEarned });

      // Update progress
      setProgress((prev) => {
        const existing = prev.levelStats[levelId];
        const nextStats = {
          completed: true,
          stars: Math.max(starsEarned, existing?.stars || 0),
          bestMoves: existing ? Math.min(movesTaken, existing.bestMoves) : movesTaken,
          bestTime: existing ? Math.min(timeTaken, existing.bestTime) : timeTaken,
        };

        // Linear unlock: unlock next level if current was the highest unlocked
        const nextUnlocked =
          levelId === prev.unlockedLevel && levelId < 10
            ? levelId + 1
            : prev.unlockedLevel;

        const updated: PlayerProgress = {
          unlockedLevel: nextUnlocked,
          levelStats: {
            ...prev.levelStats,
            [levelId]: nextStats,
          },
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }

        return updated;
      });

      // Show celebration
      if (levelId === 10) {
        setShowVictory(true);
      } else {
        setShowLevelComplete(true);
      }
    };

    engine.start();

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      sounds.enableAudioOnGesture();

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        engine.keys.left = true;
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        engine.keys.right = true;
      } else if (e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        e.preventDefault();
        engine.triggerJump();
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault();
        engine.triggerInteract();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        engine.resetCurrentLevel();
      } else if (e.key === 'Escape') {
        setShowLevelSelect(false);
        setShowHint(false);
        setShowControls(false);
        setShowLevelComplete(false);
        setShowVictory(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        engine.keys.left = false;
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        engine.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      engine.stop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Level Selection with strict lock enforcement
  const handleSelectLevel = (levelId: number) => {
    // You cannot gain access to other levels if you haven't finished previous!
    if (levelId > progress.unlockedLevel) {
      sounds.playCipherError();
      return;
    }

    setCurrentLevelId(levelId);
    if (engineRef.current) {
      engineRef.current.loadLevel(levelId);
    }
  };

  const handleNextLevel = () => {
    setShowLevelComplete(false);
    const nextId = currentLevelId + 1;
    if (nextId <= 10 && nextId <= progress.unlockedLevel) {
      handleSelectLevel(nextId);
    }
  };

  const handleReplayLevel = () => {
    setShowLevelComplete(false);
    if (engineRef.current) {
      engineRef.current.loadLevel(currentLevelId);
    }
  };

  const handleResetLevel = () => {
    if (engineRef.current) {
      engineRef.current.resetCurrentLevel();
    }
  };

  const handleResetAllProgress = () => {
    const fresh: PlayerProgress = {
      unlockedLevel: 1,
      levelStats: {},
    };
    saveProgress(fresh);
    setCurrentLevelId(1);
    if (engineRef.current) {
      engineRef.current.loadLevel(1);
    }
    setShowVictory(false);
    setShowLevelSelect(false);
  };

  return (
    <div className="app-root flex flex-col h-dvh w-full overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Top Header Bar */}
      <TopNav
        currentLevelId={currentLevelId}
        unlockedLevel={progress.unlockedLevel}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenHint={() => setShowHint(true)}
        onOpenControls={() => setShowControls(true)}
        onResetLevel={handleResetLevel}
      />

      {/* Main 2D Canvas Area */}
      <main className="flex-1 min-h-0 relative flex flex-col items-center bg-slate-950 overflow-hidden p-2 sm:p-4 short:p-1">
        <p className="touch-portrait-hint hidden shrink-0 pb-1 text-[11px] font-mono text-slate-500">
          Tip: rotate your phone sideways for a bigger play area
        </p>

        {/* Sizing box: the room is as large as fits while keeping its exact 960:580 ratio */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center [container-type:size]">
          <div
            className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-[960/580]"
            style={{ width: 'min(100cqw, calc(100cqh * 960 / 580), 80rem)' }}
          >
            <canvas
              ref={canvasRef}
              width={960}
              height={580}
              className="game-canvas w-full h-full block object-contain cursor-crosshair"
            />

            <div className="absolute top-3 right-3 hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-slate-400 pointer-events-none">
              <span>Click switches or WASD + [E]</span>
            </div>
          </div>
        </div>

        {!showStart && <FullscreenPrompt />}

        {/* Mobile On-Screen Controls (touch devices only) */}
        <MobileControls engineRef={engineRef} />
      </main>

      {/* Bottom HUD: Live Objectives & Evaluation */}
      <GameHUD
        level={currentLevel}
        evaluation={evaluation}
        moves={moves}
        timeElapsed={timeElapsed}
        onEnterGate={() => {
          if (engineRef.current && evaluation.isSolved) {
            engineRef.current.triggerInteract();
          }
        }}
      />

      {showStart && <StartScreen onStart={handleStart} />}

      {/* Modals */}
      {showLevelSelect && (
        <LevelSelectModal
          currentLevelId={currentLevelId}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onResetProgress={handleResetAllProgress}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showHint && (
        <HintModal
          level={currentLevel}
          onClose={() => setShowHint(false)}
        />
      )}

      {showControls && (
        <ControlsModal
          onClose={() => setShowControls(false)}
        />
      )}

      {showLevelComplete && (
        <LevelCompleteModal
          level={currentLevel}
          moves={clearedLevelStats.moves}
          timeSeconds={clearedLevelStats.time}
          stars={clearedLevelStats.stars}
          hasNextLevel={currentLevelId < 10 && currentLevelId + 1 <= progress.unlockedLevel}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
          onOpenLevelSelect={() => {
            setShowLevelComplete(false);
            setShowLevelSelect(true);
          }}
        />
      )}

      {showVictory && (
        <GameVictoryModal
          progress={progress}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onRestartAll={handleResetAllProgress}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
}
