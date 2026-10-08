import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Music, HelpCircle, RotateCcw, Grid, Lightbulb, Maximize, Minimize } from 'lucide-react';
import { sounds } from '../game/audio';
import { fullscreenSupported, isFullscreen, toggleFullscreen } from '../lib/fullscreen';

interface TopNavProps {
  currentLevelId: number;
  unlockedLevel: number;
  onOpenLevelSelect: () => void;
  onOpenHint: () => void;
  onOpenControls: () => void;
  onResetLevel: () => void;
}

export function TopNav({
  currentLevelId,
  unlockedLevel,
  onOpenLevelSelect,
  onOpenHint,
  onOpenControls,
  onResetLevel,
}: TopNavProps) {
  const [soundOn, setSoundOn] = useState(sounds.soundEnabled);
  const [musicOn, setMusicOn] = useState(sounds.musicEnabled);

  const [fs, setFs] = useState(false);
  const canFs = fullscreenSupported();
  useEffect(() => {
    const sync = () => setFs(isFullscreen());
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const toggleSound = () => {
    sounds.enableAudioOnGesture();
    const next = sounds.toggleSound();
    setSoundOn(next);
  };

  const toggleMusic = () => {
    sounds.enableAudioOnGesture();
    const next = sounds.toggleMusic();
    setMusicOn(next);
  };

  return (
    <header className="h-14 short:h-11 shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-2 sm:px-4 md:px-6 gap-1 flex items-center justify-between select-none z-30">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-2 group text-left cursor-pointer"
          title="Open Level Select"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-sm group-hover:border-sky-400 transition-colors">
            0x
          </div>
          <div className="hidden sm:block">
            <span className="font-bold tracking-tight text-slate-100 text-sm md:text-base font-mono">
              0xPUZZLE
            </span>
            <span className="hidden md:inline text-xs text-slate-400 font-mono ml-2">
              · 2D Binary & Hex
            </span>
          </div>
        </button>
      </div>

      {/* Center Navigation Zone */}
      <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 min-w-0">
        <button
          onClick={onOpenLevelSelect}
          className="min-h-10 short:min-h-9 px-2.5 sm:px-3 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Grid className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-sky-400" />
          <span>Levels<span className="hidden sm:inline"> ({unlockedLevel}/10)</span></span>
        </button>

        <button
          onClick={onOpenHint}
          className="min-h-10 short:min-h-9 px-2.5 sm:px-3 rounded-lg text-xs font-mono font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Open Binary/Hex Hint (H)"
          aria-label="Hint"
        >
          <Lightbulb className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Hint</span>
        </button>

        <button
          onClick={onResetLevel}
          className="min-h-10 short:min-h-9 px-2.5 sm:px-3 rounded-lg text-xs font-mono font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Reset Level (R)"
          aria-label="Reset level"
        >
          <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Controls & Audio Zone */}
      <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
        {canFs && (
          <button
            onClick={() => {
              sounds.enableAudioOnGesture();
              toggleFullscreen();
            }}
            className="size-10 short:size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title={fs ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={fs ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fs ? <Minimize className="w-4 h-4 text-sky-400" /> : <Maximize className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={onOpenControls}
          className="size-10 short:size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Controls Guide"
          aria-label="Controls guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={toggleSound}
          className="size-10 short:size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
          aria-label="Toggle sound effects"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={toggleMusic}
          className="size-10 short:size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={musicOn ? 'Stop Chiptune BGM' : 'Start Chiptune BGM'}
          aria-label="Toggle music"
        >
          <Music className={`w-4 h-4 ${musicOn ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
        </button>
      </div>
    </header>
  );
}
