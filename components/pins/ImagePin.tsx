import React from 'react';
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
  isDragging?: boolean;
  isResizing?: boolean;
  isSelected?: boolean;
}

const ImagePinComponent: React.FC<ImagePinProps> = ({ pin, onMouseDown, onDelete, onResizeMouseDown, onStartLinking, isDragging, isResizing, isSelected }) => {
  const ringClass = isSelected 
    ? 'ring-2 ring-brand' 
    : isResizing ? 'ring-2 ring-brand' : '';
  const zIndexClass = isDragging || isResizing || isSelected ? 'z-10' : '';

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
      <img src={pin.url} alt={pin.file.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 pointer-events-none">
        <p className="text-white text-xs font-mono truncate" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}} title={pin.file.name}>
          {pin.file.name}
        </p>
      </div>
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