import React from 'react';
import { RemixesPin as RemixesPinType } from '../../types';
import Tag from '../shared/Tag';
import { XIcon } from '../icons/XIcon';

interface RemixesPinProps {
  pin: RemixesPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddTag: (tag: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

const RemixesPinComponent: React.FC<RemixesPinProps> = ({ pin, onMouseDown, onAddTag, onDelete, isSelected }) => {
  const ringClass = isSelected ? 'ring-2 ring-brand' : '';
  const zIndexClass = isSelected ? 'z-10' : '';
  
  return (
    <div
      data-pin-id={pin.id}
      className={`absolute w-[400px] bg-surface rounded-lg shadow-md cursor-grab active:cursor-grabbing border border-border-color transition-shadow ${ringClass} ${zIndexClass} hover:shadow-lg active:shadow-md`}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.4)' : undefined,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="p-4">
         <div className="flex justify-between items-center mb-3 border-b border-border-color pb-2">
            <h3 className="text-lg font-semibold text-brand">Remixes & Variants</h3>
            <button
                onClick={() => onDelete(pin.id)}
                onMouseDown={e => e.stopPropagation()}
                className="w-7 h-7 bg-surface-accent rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-red-500 hover:text-white transition-all active:scale-90"
                aria-label="Close remixes card"
                title="Close remixes card"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="pr-2 max-h-96 overflow-y-auto space-y-3">
          {pin.remixes.length > 0 ? (
            pin.remixes.map(r => (
              <div key={r.name} className="bg-surface-accent border border-border-color p-3 rounded-lg text-sm">
                <h5 className="font-semibold text-primary-text">{r.name}</h5>
                <p className="text-secondary-text mb-1 text-xs">Lever: <Tag onClick={() => onAddTag(r.lever)} title="Pin as note" category="lever">{r.lever}</Tag></p>
                <ul className="list-disc list-inside text-secondary-text mt-2">
                  {r.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-secondary-text text-sm">No remixes spun up yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemixesPinComponent;