import { X, Keyboard, MousePointer, ShieldCheck, Binary, Cpu } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export function ControlsModal({ onClose }: ControlsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="p-4 md:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-100">
                Controls & Puzzle Mechanics
              </h2>
              <span className="text-xs text-slate-400 font-sans">
                2D Navigation & Binary/Hex Interactions
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 font-sans text-xs">
          {/* Movement Table */}
          <div>
            <h3 className="font-bold font-mono text-slate-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-sky-400" />
              <span>Keyboard & Touch Controls</span>
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Move Left / Right</span>
                <span className="text-sky-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  A / D or Arrow Keys
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Jump / Double Jump</span>
                <span className="text-sky-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  W / Space / Up Arrow
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Interact Nearby Switch / Dial</span>
                <span className="text-emerald-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  E or Enter
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Direct Click / Tap On Screen</span>
                <span className="text-amber-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                  <MousePointer className="w-3 h-3" />
                  <span>Click any switch or dial</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Quick Hint / Reset</span>
                <span className="text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  H (Hint) / R (Reset)
                </span>
              </div>
            </div>
          </div>

          {/* Game Rules & Progression */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold font-mono text-sky-400 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>10-Level Linear Progression Rules</span>
            </h4>
            <p className="text-slate-300 leading-relaxed font-sans">
              You must finish each puzzle level in sequence. Future levels remain locked with an error alert until the preceding level’s exit portal is entered.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-sky-400" />
                <span>Base-2 (0b): Powers of 2</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Base-16 (0x): 0-9 & A-F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-500 font-mono">© 2026 JM · MIT License</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
