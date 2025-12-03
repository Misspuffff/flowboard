import React from 'react';
import { DoNextPin as DoNextPinType } from '../../types';
import { XIcon } from '../icons/XIcon';

interface DoNextPinProps {
  pin: DoNextPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

const DoNextPinComponent: React.FC<DoNextPinProps> = ({ pin, onMouseDown, onDelete, isSelected }) => {
  const ringClass = isSelected ? 'ring-2 ring-brand' : '';
  const zIndexClass = isSelected ? 'z-10' : '';
  
  return (
    <div
      data-pin-id={pin.id}
      className={`absolute w-[350px] bg-surface rounded-lg shadow-md cursor-grab active:cursor-grabbing border border-border-color transition-shadow ${ringClass} ${zIndexClass} hover:shadow-lg active:shadow-md`}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.4)' : undefined,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3 border-b border-border-color pb-2">
            <h3 className="text-lg font-semibold text-brand">Do Next</h3>
            <button
                onClick={() => onDelete(pin.id)}
                onMouseDown={e => e.stopPropagation()}
                className="w-7 h-7 bg-surface-accent rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-red-500 hover:text-white transition-all active:scale-90"
                aria-label="Close next steps card"
                title="Close next steps card"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="pr-2 max-h-96 overflow-y-auto">
          {pin.doNext.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-secondary-text bg-surface-accent border border-border-color p-3 rounded-lg space-y-2">
              {pin.doNext.map((task, i) => <li key={i}>{task}</li>)}
            </ul>
          ) : (
             <p className="text-secondary-text text-sm">No next steps queued.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoNextPinComponent;