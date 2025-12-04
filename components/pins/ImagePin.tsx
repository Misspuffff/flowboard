import React, { useState, useEffect } from 'react';
import { ImagePin, LinkSide, ResizeCorner } from '../../types';
import { XIcon } from '../icons/XIcon';
import ResizeHandle from '../shared/ResizeHandle';
import LinkHandle from '../shared/LinkHandle';

interface ImagePinProps {
  pin: ImagePin;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, corner: ResizeCorner) => void;
  onStartLinking: (e: React.MouseEvent<HTMLDivElement>, side: LinkSide) => void;
  onUpdatePin: (id: string, updates: Partial<ImagePin>) => void;
  isDragging?: boolean;
  isResizing?: boolean;
  isSelected?: boolean;
  showLabel?: boolean;
}

const ImagePinComponent: React.FC<ImagePinProps> = ({ pin, onMouseDown, onDelete, onResizeMouseDown, onStartLinking, onUpdatePin, isDragging, isResizing, isSelected, showLabel = true }) => {
  const ringClass = isSelected 
    ? 'ring-2 ring-brand' 
    : isResizing ? 'ring-2 ring-brand' : '';
  const zIndexClass = isDragging || isResizing || isSelected ? 'z-10' : '';

  const effectiveName = pin.displayName ?? pin.file.name;
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(effectiveName);

  // Metadata tooltip: original name, resolution, source
  const metaParts: string[] = [];
  if (effectiveName) {
    metaParts.push(`Name: ${effectiveName}`);
  }
  if (pin.file?.name && pin.file.name !== effectiveName) {
    metaParts.push(`Original: ${pin.file.name}`);
  }
  if (pin.imageWidth && pin.imageHeight) {
    metaParts.push(`Resolution: ${pin.imageWidth}×${pin.imageHeight}`);
  }
  if (pin.source) {
    metaParts.push(
      `Source: ${pin.source === 'generated' ? 'Generated image' : 'Uploaded image'}`
    );
  }
  const hoverTooltip = metaParts.join('\n');

  // Keep local draft in sync if the backing name changes externally (e.g. hydration)
  useEffect(() => {
    setDraftName(effectiveName);
  }, [effectiveName]);

  const handleLabelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Allow focusing the input without starting a drag on the pin
    e.stopPropagation();
  };

  const handleLabelDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const commitName = () => {
    const trimmed = draftName.trim();
    const nextDisplayName = trimmed && trimmed !== pin.file.name ? trimmed : undefined;
    onUpdatePin(pin.id, { displayName: nextDisplayName });
    setIsEditing(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDraftName(effectiveName);
      setIsEditing(false);
    }
  };

  return (
    <div
      data-pin-id={pin.id}
      className={`absolute bg-surface overflow-hidden shadow-md transform-gpu transition-shadow duration-200 cursor-grab active:cursor-grabbing group border border-border-color
        ${ringClass} ${zIndexClass}
        ${isDragging ? 'scale-105 shadow-xl' : 'hover:shadow-lg active:shadow-md'}
      `}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        width: `${pin.width}px`,
        height: `${pin.height}px`,
        boxShadow: isSelected 
            ? '0 0 15px rgba(59, 130, 246, 0.4)' 
            : undefined,
      }}
      onMouseDown={onMouseDown}
    >
      <img src={pin.url} alt={effectiveName} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      {showLabel && (
      <div 
        className="absolute bottom-0 left-0 right-0 p-2 pt-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto flex items-center gap-1"
          onMouseDown={handleLabelMouseDown}
          onDoubleClick={handleLabelDoubleClick}
          title={hoverTooltip}
        >
          {isEditing ? (
            <input
              autoFocus
              className="w-full bg-black/40 text-white text-xs font-mono rounded px-1 py-0.5 outline-none border border-white/40 focus:border-brand/80 focus:ring-0 placeholder:text-white/50"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              onBlur={commitName}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="relative max-w-full">
              <p
                className="text-white text-xs font-mono whitespace-nowrap overflow-hidden text-ellipsis pr-4 cursor-text"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {effectiveName}
              </p>
              {/* fade-out gradient on the right edge to soften truncation */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/80 to-transparent" />
            </div>
          )}
        </div>
      </div>
      )}
      <button
        onClick={() => onDelete(pin.id)}
        onMouseDown={e => e.stopPropagation()}
        className="absolute top-1 right-1 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 active:bg-red-400 active:scale-95"
        aria-label="Delete pin"
        title="Delete pin"
      >
        <XIcon className="w-4 h-4" />
      </button>
      <ResizeHandle position="top-left" onMouseDown={(e) => onResizeMouseDown(e, 'top-left')} />
      <ResizeHandle position="top-right" onMouseDown={(e) => onResizeMouseDown(e, 'top-right')} />
      <ResizeHandle position="bottom-left" onMouseDown={(e) => onResizeMouseDown(e, 'bottom-left')} />
      <ResizeHandle position="bottom-right" onMouseDown={(e) => onResizeMouseDown(e, 'bottom-right')} />
      <LinkHandle position="top" onMouseDown={(e) => onStartLinking(e, 'top')} />
      <LinkHandle position="right" onMouseDown={(e) => onStartLinking(e, 'right')} />
      <LinkHandle position="bottom" onMouseDown={(e) => onStartLinking(e, 'bottom')} />
      <LinkHandle position="left" onMouseDown={(e) => onStartLinking(e, 'left')} />
    </div>
  );
};

export default ImagePinComponent;
