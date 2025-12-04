import React, { useState, useEffect } from 'react';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { ExportIcon } from './icons/ExportIcon';
import { AppearanceIcon } from './icons/AppearanceIcon';
import type { FlowMode, FlowEnvironment, ExperienceMode } from '../types';
import { FLOW_ENVIRONMENTS } from '../services/flowEnvironments';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  isFlowMode: boolean;
  mode: FlowMode;
  environment: FlowEnvironment;
  experienceMode: ExperienceMode;
  onToggleFlowMode: () => void;
  onChangeEnvironment: (id: string) => void;
  onChangeExperienceMode: (mode: ExperienceMode) => void;
}

const Header: React.FC<HeaderProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  isFlowMode,
  mode,
  environment,
  experienceMode,
  onToggleFlowMode,
  onChangeEnvironment,
  onChangeExperienceMode,
}) => {
  const [modifierSymbol, setModifierSymbol] = useState('Ctrl');
  const [redoShortcut, setRedoShortcut] = useState('Ctrl+Y');
  const [isEnvPopoverOpen, setEnvPopoverOpen] = useState(false);

  const experienceOptions: { id: ExperienceMode; label: string; title: string }[] = [
    {
      id: 'manual',
      label: 'Manual',
      title: 'Only show manually curated tools (no AI helpers).',
    },
    {
      id: 'ai',
      label: 'AI',
      title: 'Emphasize AI helpers powered by your current canvas.',
    },
    {
      id: 'hybrid',
      label: 'Hybrid',
      title: 'Use both manual tools and AI helpers.',
    },
  ];

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setModifierSymbol(isMac ? '⌘' : 'Ctrl');
    setRedoShortcut(isMac ? '⌘+Shift+Z' : 'Ctrl+Y');
  }, []);

  return (
    <header className="relative p-3 sm:p-4 bg-[#020617]/95 backdrop-blur-xl border-b border-black/40 shadow-[0_1px_0_rgba(15,23,42,0.9)]">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
            FB
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-semibold text-slate-50 font-display truncate">
              FlowBoard
            </h1>
            <span className="text-[11px] sm:text-xs font-normal text-slate-400 font-sans truncate">
              Infinite canvas for your design explorations
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs sm:text-sm text-slate-200">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/80 text-[11px]">
            <span className="text-slate-400">Undo</span>
            <span className="font-semibold text-slate-100">{modifierSymbol}+Z</span>
            <span className="mx-1 text-slate-700">•</span>
            <span className="text-slate-400">Redo</span>
            <span className="font-semibold text-slate-100">{redoShortcut}</span>
          </div>
          <button
            onClick={onExport}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-slate-100 bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/80"
            aria-label="Export board as image"
            title="Export board as image"
          >
            <ExportIcon className="w-4 h-4" aria-hidden="true" />
            <span className="font-semibold">Export</span>
          </button>
          <button
            onClick={() => setEnvPopoverOpen((prev) => !prev)}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all border text-slate-100 bg-slate-800/80 border-slate-700/80 hover:bg-slate-700"
            aria-label="Choose flow environment"
            title={`Environment: ${environment.name}`}
          >
            <AppearanceIcon className="w-4 h-4" aria-hidden="true" />
            <span className="font-semibold hidden xl:inline max-w-[140px] truncate">
              {environment.name}
            </span>
          </button>
          <div className="hidden xl:flex items-center gap-1 px-1 py-1 rounded-full bg-slate-900/80 border border-slate-700/80">
            {experienceOptions.map((option) => {
              const isActive = experienceMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChangeExperienceMode(option.id)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wide transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                  aria-pressed={isActive}
                  title={option.title}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={onToggleFlowMode}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${
              isFlowMode
                ? 'text-emerald-100 bg-emerald-500/20 border-emerald-400/80 hover:bg-emerald-500/30'
                : 'text-slate-100 bg-slate-800/80 border-slate-700/80 hover:bg-slate-700'
            }`}
            aria-pressed={isFlowMode}
            aria-label="Toggle Flow Mode (Cmd/Ctrl+Shift+F)"
            title={
              isFlowMode
                ? 'Flow mode on — toggle off (⌘/Ctrl+Shift+F)'
                : 'Enter flow mode (⌘/Ctrl+Shift+F)'
            }
          >
            <span className="font-semibold">Flow</span>
          </button>
          <div className="w-px h-6 bg-slate-700/80 mx-1 sm:mx-2" />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed text-slate-100 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 active:scale-95"
            aria-label={`Undo (${modifierSymbol}+Z)`}
            title={`Undo (${modifierSymbol}+Z)`}
          >
            <UndoIcon className="w-4 h-4" aria-hidden="true" />
            <span className="font-semibold hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed text-slate-100 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 active:scale-95"
            aria-label={`Redo (${redoShortcut})`}
            title={`Redo (${redoShortcut})`}
          >
            <span className="font-semibold hidden sm:inline">Redo</span>
            <RedoIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {isEnvPopoverOpen && (
        <div className="absolute right-4 top-16 z-40 export-hidden">
          <div className="w-72 bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
                Flow environment
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-400 font-mono">
                {mode === 'flow' ? 'Flow' : 'Explore'}
              </span>
            </div>
            {FLOW_ENVIRONMENTS.map((env) => {
              const isActive = env.id === environment.id;
              return (
                <button
                  key={env.id}
                  onClick={() => {
                    onChangeEnvironment(env.id);
                    setEnvPopoverOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border border-slate-600 text-slate-50'
                      : 'bg-transparent border border-transparent text-slate-300 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="font-semibold mb-0.5">{env.name}</div>
                  {env.description && (
                    <p className="text-[11px] text-slate-400">{env.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
