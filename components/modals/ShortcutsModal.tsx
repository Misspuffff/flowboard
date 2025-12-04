import React, { useEffect, useRef } from 'react';

interface ShortcutsModalProps {
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
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
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
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

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const modifierName = isMac ? '⌘' : 'Ctrl';

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface backdrop-blur-2xl border border-border-color rounded-2xl shadow-2xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary-text hover:text-primary-text transition-transform active:scale-90"
          aria-label="Close shortcuts"
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
          id="shortcuts-modal-title"
          className="text-xl font-semibold text-primary-text mb-1 flex items-center gap-2"
        >
          Keyboard shortcuts
        </h2>
        <p className="text-sm text-secondary-text mb-4">
          Use these shortcuts to move faster on the board. Shortcuts use {modifierName} on macOS or Ctrl on
          Windows.
        </p>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Canvas & mode
            </h3>
            <ShortcutRow
              label="Undo"
              description="Revert the last change"
              keys={isMac ? ['⌘', 'Z'] : ['Ctrl', 'Z']}
            />
            <ShortcutRow
              label="Redo"
              description="Redo the last undone change"
              keys={isMac ? ['⌘', 'Shift', 'Z'] : ['Ctrl', 'Y']}
            />
            <ShortcutRow
              label="Toggle Flow mode"
              description="Switch between Explore and Flow modes"
              keys={isMac ? ['⌘', 'Shift', 'F'] : ['Ctrl', 'Shift', 'F']}
            />
          </section>

          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Create from anywhere
            </h3>
            <ShortcutRow
              label="New note"
              description="Open the note composer"
              keys={isMac ? ['⌘', 'Shift', 'N'] : ['Ctrl', 'Shift', 'N']}
            />
            <ShortcutRow
              label="Add color"
              description="Open color picker"
              keys={isMac ? ['⌘', 'Shift', 'C'] : ['Ctrl', 'Shift', 'C']}
            />
            <ShortcutRow
              label="Export board"
              description="Open export options"
              keys={isMac ? ['⌘', 'Shift', 'E'] : ['Ctrl', 'Shift', 'E']}
            />
            <ShortcutRow
              label="Paste image from clipboard"
              description="Paste screenshots or images directly onto the board"
              keys={isMac ? ['⌘', 'V'] : ['Ctrl', 'V']}
            />
          </section>

          <section>
            <h3 className="text-xs font-semibold text-tertiary-text uppercase tracking-wide mb-2">
              Power tools
            </h3>
            <ShortcutRow
              label="Open command palette"
              description="Search for commands like ‘Show shortcuts’"
              keys={isMac ? ['⌘', 'K'] : ['Ctrl', 'K']}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

interface ShortcutRowProps {
  label: string;
  description?: string;
  keys: string[];
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ label, description, keys }) => {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary-text truncate">{label}</div>
        {description && (
          <div className="text-xs text-tertiary-text truncate">{description}</div>
        )}
      </div>
      <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
        {keys.map((key, idx) => (
          <kbd
            key={`${key}-${idx}`}
            className="px-1.5 py-0.5 rounded border border-border-color bg-black/40 text-[11px] font-mono text-secondary-text"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
};

export default ShortcutsModal;
