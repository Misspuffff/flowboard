import React, { useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TextIcon } from './icons/TextIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { DnaIcon } from './icons/DnaIcon';
import { SuggestImageIcon } from './icons/SuggestImageIcon';
import { RemixIcon } from './icons/RemixIcon';
import { DoNextIcon } from './icons/DoNextIcon';
import { StyleguideIcon } from './icons/StyleguideIcon';

interface FABProps {
    isAnalyzing: boolean;
    onAddText: () => void;
    onAddColor: () => void;
    // FIX: Replaced onAnalyzeBoard with granular analysis handlers.
    onAnalyzeDna: () => void;
    onAnalyzeStyleGuide: () => void;
    onAnalyzeSuggestions: () => void;
    onAnalyzeRemixes: () => void;
    onAnalyzeDoNext: () => void;
}

const FloatingActionButton: React.FC<FABProps> = ({ 
    isAnalyzing, 
    onAddText, 
    onAddColor,
    // FIX: Destructure new granular handlers.
    onAnalyzeDna,
    onAnalyzeStyleGuide,
    onAnalyzeSuggestions,
    onAnalyzeRemixes,
    onAnalyzeDoNext,
}) => {
    // Figma/Miro-style: persistent left toolbar instead of radial FAB
    const actionButtons = [
        { icon: <UploadIcon />, label: 'Image', title: 'Pin an image from your computer', action: () => document.getElementById('file-input-global')?.click(), disabled: false },
        { icon: <TextIcon />, label: 'Note', title: 'Add a text note to the board', action: onAddText, disabled: false },
        { icon: <PaletteIcon />, label: 'Color', title: 'Add a color swatch to the board', action: onAddColor, disabled: false },
        { icon: <DnaIcon />, label: 'DNA', title: 'Analyze the board\'s creative DNA', action: onAnalyzeDna, disabled: isAnalyzing },
        { icon: <StyleguideIcon />, label: 'Style', title: 'Generate a style guide from the board', action: onAnalyzeStyleGuide, disabled: isAnalyzing },
        { icon: <SuggestImageIcon />, label: 'Ideas', title: 'Get AI-powered image suggestions', action: onAnalyzeSuggestions, disabled: isAnalyzing },
        { icon: <RemixIcon />, label: 'Remix', title: 'Generate creative remixes and variants', action: onAnalyzeRemixes, disabled: isAnalyzing },
        { icon: <DoNextIcon />, label: 'Next', title: 'Get suggestions for what to do next', action: onAnalyzeDoNext, disabled: isAnalyzing },
    ];

    return (
        <div className="absolute inset-y-0 left-4 z-30 flex items-center pointer-events-none export-hidden">
            <div className="flex flex-col gap-2 bg-[#111827]/80 border border-black/30 rounded-2xl shadow-2xl px-2 py-3 pointer-events-auto">
                {actionButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={btn.action}
                        disabled={btn.disabled}
                        className="group flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        aria-label={btn.title}
                        title={isAnalyzing && btn.disabled ? 'Riffing on ideas...' : btn.title}
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/20">
                            {btn.icon}
                        </div>
                        <span className="font-mono uppercase tracking-wide hidden sm:inline">
                            {isAnalyzing && btn.disabled ? 'Riff…' : btn.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FloatingActionButton;