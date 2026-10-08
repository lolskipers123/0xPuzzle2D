import { X, Lightbulb, Check } from 'lucide-react';
import { PuzzleLevel } from '../game/types';

interface HintModalProps {
  level: PuzzleLevel;
  onClose: () => void;
}

export function HintModal({ level, onClose }: HintModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="p-4 md:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-100">
                {level.hintTitle}
              </h2>
              <span className="text-xs text-slate-400 font-sans">
                Level {level.id}: {level.title.replace(/^Level \d+: /, '')}
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
          {/* Explanation */}
          <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800 text-slate-200 leading-relaxed">
            {level.hintExplanation}
          </div>

          {/* Key Rules */}
          <div>
            <h3 className="font-bold font-mono text-slate-300 text-xs uppercase tracking-wider mb-2">
              Core Principles
            </h3>
            <ul className="space-y-1.5 font-mono text-slate-400 text-xs">
              {level.hintRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/30 p-2 rounded border border-slate-800/60">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-200">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reference Table if available */}
          {level.hintTable && level.hintTable.length > 0 && (
            <div>
              <h3 className="font-bold font-mono text-slate-300 text-xs uppercase tracking-wider mb-2">
                Conversion Reference
              </h3>
              <div className="bg-slate-950/60 rounded-lg border border-slate-800 overflow-hidden font-mono">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2.5 font-medium">Element</th>
                      <th className="p-2.5 font-medium">Value / Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {level.hintTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-sky-400 font-semibold">{row.key}</td>
                        <td className="p-2.5 text-slate-300">{row.val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Got it, Return to Room
          </button>
        </div>
      </div>
    </div>
  );
}
