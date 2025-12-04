import React, { useEffect, useRef } from 'react';
import type { ExperienceMode, FlowMode } from '../../types';
import { FLOW_ENVIRONMENTS } from '../../services/flowEnvironments';

interface SettingsModalProps {
  mode: FlowMode;
  isFlowMode: boolean;
  experienceMode: ExperienceMode;
  environmentId: string;
  showImageLabels: boolean;
  onToggleFlowMode: () => void;
  onChangeExperienceMode: (mode: ExperienceMode) => void;
  onChangeEnvironment: (id: string) => void;
  onToggleImageLabels: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  mode,
  isFlowMode,
  experienceMode,
  environmentId,
  showImageLabels,
  onToggleFlowMode,
  onChangeExperienceMode,
  onChangeEnvironment,
  onToggleImageLabels,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const experienceCopy: Record<ExperienceMode, string> = {
    manual: 'You drive. No automatic AI responses.',
    ai: 'Agent stays in sync with your canvas.',
    hybrid: 'Blend of manual pins and live AI help.',
  };

  const experienceOptions: { id: ExperienceMode; label: string; title: string }[] = [
    {
      id: 'manual',
      label: 'Manual',
      title: experienceCopy.manual,
    },
    {
      id: 'ai',
      label: 'AI',
      title: experienceCopy.ai,
    },
    {
      id: 'hybrid',
      label: 'Hybrid',
      title: experienceCopy.hybrid,
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface backdrop-blur-2xl border border-border-color rounded-2xl shadow-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary-text hover:text-primary-text transition-transform active:scale-90"
          aria-label="Close settings"
          title="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2
          id="settings-modal-title"
          className="text-xl font-semibold text-primary-text mb-1 flex items-center gap-2"
        >
          Settings
        </h2>
        <p className="text-sm text-secondary-text mb-4">
          Tweak how FlowBoard looks and behaves. Changes are saved automatically.
        </p>

        <div className="space-y-6 text-sm">
          {/* Environment */}
          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Environment
            </h3>
            <p className="text-xs text-tertiary-text mb-3">
              Choose the lighting and grid vibe for your board.
            </p>
            <div className="space-y-2">
              {FLOW_ENVIRONMENTS.map((env) => {
                const isActive = env.id === environmentId;
                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => onChangeEnvironment(env.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                      isActive
                        ? 'bg-slate-800/90 border-slate-500 text-slate-50'
                        : 'bg-transparent border-border-color/40 text-slate-300 hover:bg-slate-900/70'
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="font-semibold mb-0.5">{env.name}</div>
                    {env.description && (
                      <p className="text-[11px] text-slate-400">{env.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mode */}
          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Mode
            </h3>
            <p className="text-xs text-tertiary-text mb-3">
              Switch between Explore and Flow modes.
            </p>
            <div className="inline-flex rounded-full bg-black/40 border border-border-color/80 p-0.5">
              <button
                type="button"
                onClick={() => {
                  if (mode !== 'explore') onToggleFlowMode();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  mode === 'explore'
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-slate-50'
                }`}
                aria-pressed={mode === 'explore'}
              >
                Explore
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mode !== 'flow') onToggleFlowMode();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isFlowMode
                    ? 'bg-emerald-400 text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-slate-50'
                }`}
                aria-pressed={isFlowMode}
              >
                Flow
              </button>
            </div>
          </section>

          {/* Experience mode */}
          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Agent experience
            </h3>
            <p className="text-xs text-tertiary-text mb-3">
              Control how tightly the AI stays in sync with your canvas.
            </p>
            <div className="flex flex-col gap-2">
              {experienceOptions.map((option) => {
                const isActive = experienceMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChangeExperienceMode(option.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 border-slate-300'
                        : 'bg-black/40 text-slate-200 border-border-color/70 hover:bg-black/60'
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="font-semibold mb-0.5">{option.label}</div>
                    <p className="text-[11px] text-slate-500">{option.title}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Appearance
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onToggleImageLabels}
                className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                  showImageLabels
                    ? 'bg-slate-800/90 border-slate-500 text-slate-50'
                    : 'bg-black/40 border-border-color/70 text-slate-300 hover:bg-black/60'
                }`}
                aria-pressed={showImageLabels}
              >
                <span className="font-medium">Image labels</span>
                <span className="text-[11px] text-slate-400">
                  {showImageLabels ? 'Showing filenames & metadata' : 'Hidden to keep the board clean'}
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
