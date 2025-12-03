import React, { useState } from 'react';
import { BoardDnaPin as BoardDnaPinType } from '../../types';
import Tag from '../shared/Tag';
import { XIcon } from '../icons/XIcon';
import TagActionPopover from '../shared/TagActionPopover';

interface BoardDnaPinProps {
  pin: BoardDnaPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddColor: (hex: string) => void;
  onAddTag: (tag: string) => void;
  onAddTagAsTagPin: (tag: string, category: 'form' | 'material') => void;
  onGenerateFromTag: (tag: string) => void;
  isGeneratingFromTag: boolean;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

interface PopoverData {
  tag: string;
  category: 'form' | 'material';
  position: { top: number; left: number };
}

const BoardDnaPinComponent: React.FC<BoardDnaPinProps> = ({ pin, onMouseDown, onAddColor, onAddTag, onAddTagAsTagPin, onGenerateFromTag, isGeneratingFromTag, onDelete, isSelected }) => {
  const { dna } = pin;
  const ringClass = isSelected ? 'ring-2 ring-brand' : '';
  const zIndexClass = isSelected ? 'z-10' : '';
  
  const [popoverData, setPopoverData] = useState<PopoverData | null>(null);

  const handleTagClick = (event: React.MouseEvent<HTMLButtonElement>, tag: string, category: 'form' | 'material') => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverData({
      tag,
      category,
      position: {
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      },
    });
  };

  const handlePopoverGenerate = () => {
    if (popoverData) {
        onGenerateFromTag(popoverData.tag);
    }
    setPopoverData(null);
  };

  const handlePopoverAddNote = () => {
    if (popoverData) {
        onAddTag(popoverData.tag);
    }
    setPopoverData(null);
  };

  const handlePopoverAddTagPin = () => {
    if (popoverData) {
      onAddTagAsTagPin(popoverData.tag, popoverData.category);
    }
    setPopoverData(null);
  };


  return (
    <>
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
          <div className="p-4 relative font-sans">
              <div className="flex justify-between items-center mb-3 border-b border-border-color pb-2">
                  <h3 className="text-lg font-semibold text-brand">Board DNA</h3>
                  <button
                      onClick={() => onDelete(pin.id)}
                      onMouseDown={e => e.stopPropagation()}
                      className="w-7 h-7 bg-surface-accent rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-red-500 hover:text-white transition-all active:scale-90"
                      aria-label="Close DNA card"
                      title="Close DNA card"
                  >
                      <XIcon className="w-4 h-4" />
                  </button>
              </div>
              <div className="space-y-3 text-sm pr-2 max-h-96 overflow-y-auto">
                  <div>
                      <strong className="text-secondary-text block mb-1 font-medium">Palette:</strong>
                      <div className="flex flex-wrap gap-2">
                          {dna.palette.map(p => (
                              <button
                                  key={p}
                                  style={{backgroundColor: p}}
                                  className="w-6 h-6 rounded-full border border-black/10 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface"
                                  title={`Pin ${p} to board`}
                                  aria-label={`Pin color ${p} to board`}
                                  onClick={() => onAddColor(p)}
                                  onMouseDown={e => e.stopPropagation()}
                              />
                          ))}
                      </div>
                  </div>
                  <div>
                      <strong className="text-secondary-text block mb-1 font-medium">Forms:</strong>
                      <div className="flex flex-wrap">
                          {dna.forms.map(f => <Tag key={f} onClick={(e) => handleTagClick(e, f, 'form')} title="Interact with this tag" category="form">{f}</Tag>)}
                      </div>
                  </div>
                  <div>
                      <strong className="text-secondary-text block mb-1 font-medium">Materials:</strong>
                      <div className="flex flex-wrap">
                          {dna.textures_materials.map(t => <Tag key={t} onClick={(e) => handleTagClick(e, t, 'material')} title="Interact with this tag" category="material">{t}</Tag>)}
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {popoverData && (
        <TagActionPopover
          tag={popoverData.tag}
          position={popoverData.position}
          isGenerating={isGeneratingFromTag}
          onPinTag={handlePopoverAddTagPin}
          onPinAsNote={handlePopoverAddNote}
          onGenerate={handlePopoverGenerate}
          onClose={() => setPopoverData(null)}
        />
      )}
    </>
  );
};

export default BoardDnaPinComponent;