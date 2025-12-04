import React, { useState, useEffect, useRef } from 'react';
import { ExportIcon } from '../icons/ExportIcon';
import { LoaderIcon } from '../icons/LoaderIcon';

interface ExportModalProps {
  onClose: () => void;
  onExport: (options: { format: 'png' | 'jpeg'; scale: number; quality: number }) => void;
  isExporting: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport, isExporting }) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.92);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport({ format, scale, quality });
  };
  
  const RadioButton = ({ id, name, value, label, checked, onChange, disabled }: {id: string, name: string, value: any, label: string, checked: boolean, onChange: () => void, disabled?: boolean}) => (
    <div className="flex items-center">
      <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="hidden" />
      <label htmlFor={id} className={`px-4 py-2 rounded-lg transition-colors text-sm ${disabled ? 'cursor-not-allowed bg-surface-accent text-tertiary-text' : `cursor-pointer ${checked ? 'bg-brand text-white' : 'bg-surface-accent hover:bg-black/5 text-primary-text'}`}`}>
        {label}
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 font-sans animate-fade-in-fast" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-surface backdrop-blur-2xl border border-border-color rounded-2xl shadow-2xl p-8 w-full max-w-md relative" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
          onClick={onClose} 
          disabled={isExporting}
          className="absolute top-4 right-4 text-secondary-text hover:text-primary-text transition-transform active:scale-90 disabled:opacity-50"
          aria-label="Close modal"
          title="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 id="modal-title" className="text-2xl font-bold text-primary-text mb-6">Export Board</h2>
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-secondary-text mb-2">Format</label>
                    <div className="flex gap-2 font-mono">
                        <RadioButton id="fmt-png" name="format" value="png" label="PNG" checked={format === 'png'} onChange={() => setFormat('png')} disabled={isExporting} />
                        <RadioButton id="fmt-jpeg" name="format" value="jpeg" label="JPG" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} disabled={isExporting} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-text mb-2">Resolution</label>
                    <div className="flex gap-2 font-mono">
                        <RadioButton id="scale-1" name="scale" value={1} label="1x" checked={scale === 1} onChange={() => setScale(1)} disabled={isExporting} />
                        <RadioButton id="scale-2" name="scale" value={2} label="2x" checked={scale === 2} onChange={() => setScale(2)} disabled={isExporting} />
                        <RadioButton id="scale-4" name="scale" value={4} label="4x" checked={scale === 4} onChange={() => setScale(4)} disabled={isExporting} />
                    </div>
                     <p className="text-xs text-tertiary-text mt-2">2x is recommended for high-quality sharing.</p>
                </div>

                {format === 'jpeg' && (
                    <div className="transition-opacity duration-300">
                        <label htmlFor="quality-slider" className="block text-sm font-medium text-secondary-text mb-2">Quality</label>
                        <div className="flex items-center gap-4">
                            <input
                                id="quality-slider"
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.01"
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                disabled={isExporting}
                                className="w-full h-2 bg-surface-accent rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                            <span className="font-mono text-sm text-primary-text w-12 text-center">{Math.round(quality * 100)}</span>
                        </div>
                    </div>
                )}
            </div>

          <div className="flex justify-end gap-4 mt-8 font-mono text-sm font-medium">
            <button type="button" onClick={onClose} disabled={isExporting} className="bg-surface-accent hover:bg-black/5 text-primary-text py-2 px-6 rounded-lg transition-all active:scale-95 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isExporting} className="bg-brand hover:bg-brand-hover text-white py-2 px-6 rounded-lg transition-all active:scale-95 flex items-center gap-2 disabled:bg-brand/50 disabled:cursor-wait">
              {isExporting ? <LoaderIcon className="w-5 h-5" /> : <ExportIcon className="w-5 h-5" />}
              {isExporting ? 'Exporting...' : 'Export Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;