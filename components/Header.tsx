import React, { useState, useEffect } from 'react';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { ExportIcon } from './icons/ExportIcon';
import { AppearanceIcon } from './icons/AppearanceIcon';

interface HeaderProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onExport: () => void;
    isFlowMode: boolean;
    onToggleFlowMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onUndo, onRedo, canUndo, canRedo, onExport, isFlowMode, onToggleFlowMode
}) => {
  const [modifierSymbol, setModifierSymbol] = useState('Ctrl');
  const [redoShortcut, setRedoShortcut] = useState('Ctrl+Y');

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setModifierSymbol(isMac ? '⌘' : 'Ctrl');
    setRedoShortcut(isMac ? '⌘+Shift+Z' : 'Ctrl+Y');
  }, []);

  return (
    <header className="p-3 sm:p-4 bg-[#020617]/95 backdrop-blur-xl border-b border-black/40 shadow-[0_1px_0_rgba(15,23,42,0.9)]">
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
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/80 text-[11px]">
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
                onClick={onToggleFlowMode}
                className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${
                  isFlowMode
                    ? 'text-emerald-100 bg-emerald-500/20 border-emerald-400/80 hover:bg-emerald-500/30'
                    : 'text-slate-100 bg-slate-800/80 border-slate-700/80 hover:bg-slate-700'
                }`}
                aria-pressed={isFlowMode}
                aria-label="Toggle Flow Mode (Cmd/Ctrl+Shift+F)"
                title={isFlowMode ? 'Flow mode on — toggle off (⌘/Ctrl+Shift+F)' : 'Enter flow mode (⌘/Ctrl+Shift+F)'}
            >
                <AppearanceIcon className="w-4 h-4" aria-hidden="true" />
                <span className="font-semibold">Flow</span>
            </button>
             <div className="w-px h-6 bg-slate-700/80 mx-1 sm:mx-2"></div>
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
    </header>
  );
};

export default Header;