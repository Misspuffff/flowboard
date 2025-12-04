import React from 'react';
import { SummarizeIcon } from './icons/SummarizeIcon';

interface SelectionToolbarProps {
  bounds: { top: number; left: number; width: number; };
  onSummarize: () => void;
  isSummarizing: boolean;
  count: number;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ bounds, onSummarize, isSummarizing, count }) => {
  if (count < 2) return null;

  return (
    <div
      className="absolute z-20 flex items-center transition-all duration-200"
      style={{
        left: `${bounds.left + bounds.width / 2}px`,
        top: `${bounds.top - 50}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-surface backdrop-blur-lg border border-border-color rounded-lg shadow-lg p-2 flex items-center gap-4 font-mono text-sm">
        <span className="text-primary-text font-semibold px-2">{count} pins selected</span>
        <div className="w-px h-6 bg-border-color"></div>
        <button
          onClick={onSummarize}
          disabled={isSummarizing}
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold py-2 px-4 rounded-md transition-all active:scale-95 disabled:bg-brand/50 disabled:cursor-wait"
          title="Let's turn these ideas into a summary note."
        >
          <SummarizeIcon className="w-5 h-5" />
          {isSummarizing ? 'Summarizing...' : 'Create Summary Note'}
        </button>
      </div>
    </div>
  );
};

export default SelectionToolbar;