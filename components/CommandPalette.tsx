import React, { useEffect, useMemo, useRef, useState } from 'react';

interface CommandPaletteProps {
  onClose: () => void;
  onShowShortcuts: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  keywords?: string;
  action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onShowShortcuts }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'shortcuts',
        label: 'Show keyboard shortcuts',
        description: 'Open the Help / Shortcuts menu',
        keywords: 'help shortcuts keys keyboard',
        action: onShowShortcuts,
      },
    ],
    [onShowShortcuts]
  );

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) => {
      const haystack = `${cmd.label} ${cmd.description ?? ''} ${cmd.keywords ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [commands, query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCommandClick = (command: CommandItem) => {
    command.action();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredCommands.length === 0) return;
    const command = filteredCommands[0];
    handleCommandClick(command);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-surface backdrop-blur-2xl border border-border-color shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="border-b border-border-color/60 bg-black/20">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-3 text-sm text-primary-text placeholder:text-tertiary-text outline-none"
            placeholder="Type a command… (e.g., shortcuts)"
            aria-label="Search commands"
          />
        </form>
        <div className="max-h-72 overflow-y-auto bg-surface/80">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-3 text-xs text-tertiary-text">No commands match that search.</div>
          ) : (
            <ul className="py-1 text-sm">
              {filteredCommands.map((cmd) => (
                <li key={cmd.id}>
                  <button
                    type="button"
                    onClick={() => handleCommandClick(cmd)}
                    className="w-full px-4 py-2 flex flex-col items-start text-left text-primary-text hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                  >
                    <span className="text-sm font-medium">{cmd.label}</span>
                    {cmd.description && (
                      <span className="text-[11px] text-tertiary-text mt-0.5">{cmd.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-color/60 bg-black/30 text-[11px] text-tertiary-text font-mono">
          <span>Press Esc to close</span>
          <span>
            Open with <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border-color bg-black/40">Cmd</kbd><span>+</span><kbd className="px-1.5 py-0.5 rounded border border-border-color bg-black/40">K</kbd></span> /{' '}
            <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border-color bg-black/40">Ctrl</kbd><span>+</span><kbd className="px-1.5 py-0.5 rounded border border-border-color bg-black/40">K</kbd></span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
