import React from 'react';
import type { ExperienceMode, FlowBoardResponse } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';

interface AgentPanelProps {
  experienceMode: ExperienceMode;
  analysis: FlowBoardResponse | null;
  isAnalyzing: boolean;
  hasImages: boolean;
  onAnalyzeNow: () => void;
}

const MODE_LABEL: Record<ExperienceMode, string> = {
  manual: 'Manual',
  ai: 'AI',
  hybrid: 'Hybrid',
};

const MODE_TAGLINE: Record<ExperienceMode, string> = {
  manual: 'You drive. No automatic AI responses.',
  ai: 'Agent stays in sync with your canvas.',
  hybrid: 'Blend of manual pins and live AI help.',
};

const AgentPanel: React.FC<AgentPanelProps> = ({
  experienceMode,
  analysis,
  isAnalyzing,
  hasImages,
  onAnalyzeNow,
}) => {
  const hasAnalysis = !!analysis;

  return (
    <aside
      className="absolute right-4 top-20 bottom-6 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col export-hidden"
      aria-label="Flow agent panel"
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-50 font-mono tracking-wide uppercase">
            Flow Agent
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {MODE_TAGLINE[experienceMode]}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
          {MODE_LABEL[experienceMode]}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto text-xs text-slate-200 space-y-4 pr-1">
        {!hasImages && (
          <p className="text-slate-400">
            Pin at least one image to let the agent read your canvas.
          </p>
        )}

        {hasImages && !hasAnalysis && !isAnalyzing && (
          <p className="text-slate-400">
            Ready when you are. Use <span className="font-mono">Refresh</span> or the AI tools on the left.
          </p>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-slate-300">
            <LoaderIcon className="h-4 w-4" />
            <span>Reading the board…</span>
          </div>
        )}

        {hasAnalysis && (
          <>
            <section>
              <h3 className="text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                Skill signal
              </h3>
              <p className="text-slate-300">
                I&apos;m reading this as an
                <span className="font-semibold"> {analysis.skill_inference}</span> exploration.
              </p>
            </section>

            {analysis.do_next.length > 0 && (
              <section>
                <h3 className="text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                  What to do next
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  {analysis.do_next.slice(0, 4).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {analysis.image_suggestions.length > 0 && (
              <section>
                <h3 className="text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                  Suggested images
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  {analysis.image_suggestions.slice(0, 3).map((s) => (
                    <li key={s.card_id}>
                      <span className="font-mono">"{s.prompt}"</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {analysis.tensions.length > 0 && (
              <section>
                <h3 className="text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                  Tensions to explore
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  {analysis.tensions.slice(0, 3).map((tension) => (
                    <li key={tension.name}>
                      <span className="font-semibold">{tension.name}:</span>{' '}
                      {tension.nudge}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      <footer className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onAnalyzeNow}
          disabled={!hasImages || isAnalyzing}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? 'Updating…' : 'Refresh from canvas'}
        </button>
        <span className="text-[10px] text-slate-500 text-right leading-snug">
          In AI &amp; Hybrid modes, the agent auto-refreshes when your images change.
        </span>
      </footer>
    </aside>
  );
};

export default AgentPanel;