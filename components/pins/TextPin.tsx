import React from 'react';
import { TextPin, LinkSide, ResizeCorner } from '../../types';
import { XIcon } from '../icons/XIcon';
import ResizeHandle from '../shared/ResizeHandle';
import LinkHandle from '../shared/LinkHandle';

interface TextPinProps {
  pin: TextPin;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, corner: ResizeCorner) => void;
  onStartLinking: (e: React.MouseEvent<HTMLDivElement>, side: LinkSide) => void;
  onUpdatePin: (id: string, updates: Partial<TextPin>) => void;
  isDragging?: boolean;
  isResizing?: boolean;
  isSelected?: boolean;
}

const colorMap = {
    yellow: 'bg-[#FEF9C3] text-yellow-900 border-yellow-300',
    blue: 'bg-[#DBEAFE] text-blue-900 border-blue-300',
    green: 'bg-[#D1FAE5] text-green-900 border-green-300',
    pink: 'bg-[#FCE7F3] text-pink-900 border-pink-300',
};

const TextPinComponent: React.FC<TextPinProps> = ({ pin, onMouseDown, onDelete, onResizeMouseDown, onStartLinking, onUpdatePin, isDragging, isResizing, isSelected }) => {
  const colorClasses = colorMap[pin.color as keyof typeof colorMap] || colorMap.yellow;
  const ringClass = isSelected 
    ? 'ring-2 ring-brand' 
    : isResizing ? 'ring-2 ring-brand' : '';
  const zIndexClass = isDragging || isResizing || isSelected ? 'z-10' : '';

  const MIN_FONT = 12;
  const MAX_FONT = 72;
  const FONT_STEP = 2;
  
  /**
   * Calculates a dynamic font size to fit the text content within the pin's dimensions.
   * This uses a heuristic based on the available area and the number of characters.
   */
  const calculateDynamicFontSize = () => {
    const width = pin.width ?? 220;
    const height = pin.height ?? 220;
    const text = pin.content;
    
    // Constants for calculation
    const PADDING = 32; // Corresponds to p-4 on two sides (16px * 2)
    const FONT_SIZE_SCALAR = 1.2; // Heuristic scalar for tuning text fit

    if (!text || text.length === 0) return MAX_FONT;

    const availableWidth = width - PADDING;
    const availableHeight = height - PADDING;
    
    if (availableWidth <= 0 || availableHeight <= 0) return MIN_FONT;

    const availableArea = availableWidth * availableHeight;
    
    // Estimate font size based on the square root of the available area per character.
    let fontSize = Math.sqrt(availableArea / text.length) * FONT_SIZE_SCALAR;

    // Clamp the font size to defined limits and ensure it doesn't exceed the available height.
    fontSize = Math.max(MIN_FONT, fontSize);
    fontSize = Math.min(MAX_FONT, fontSize, availableHeight);
    
    return fontSize;
  };

  const dynamicFontSize = calculateDynamicFontSize();
  // Use the explicitly set font size if available, otherwise use the calculated dynamic size.
  const currentFontSize = pin.fontSize ?? dynamicFontSize;

  const handleIncreaseFont = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newSize = Math.min(MAX_FONT, currentFontSize + FONT_STEP);
      onUpdatePin(pin.id, { fontSize: newSize });
  };

  const handleDecreaseFont = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newSize = Math.max(MIN_FONT, currentFontSize - FONT_STEP);
      onUpdatePin(pin.id, { fontSize: newSize });
  };

  return (
    <div
      data-pin-id={pin.id}
      className={`absolute shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center p-4 transition-shadow duration-200 group border ${colorClasses} ${ringClass} ${zIndexClass}
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
        <p 
          className="whitespace-pre-wrap text-center font-sans"
          style={{
            fontSize: `${currentFontSize}px`,
          }}
        >
          {pin.content}
        </p>
        <button
            onClick={() => onDelete(pin.id)}
            onMouseDown={e => e.stopPropagation()}
            className="absolute top-1 right-1 w-6 h-6 bg-black/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/10 active:bg-black/20 active:scale-95"
            aria-label="Delete note"
            title="Delete note"
        >
            <XIcon className="w-4 h-4" />
        </button>

        {/* Font Size Controls */}
        <div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/50 backdrop-blur-sm border border-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={e => e.stopPropagation()}
        >
            <button 
                onClick={handleDecreaseFont} 
                className="w-7 h-7 flex items-center justify-center text-lg rounded-full hover:bg-black/5 active:bg-black/10"
                title="Decrease font size"
            >
                -
            </button>
            <span className="text-xs w-10 text-center tabular-nums text-black/60 font-mono" title="Current font size">{Math.round(currentFontSize)}px</span>
            <button 
                onClick={handleIncreaseFont} 
                className="w-7 h-7 flex items-center justify-center text-lg rounded-full hover:bg-black/5 active:bg-black/10"
                title="Increase font size"
            >
                +
            </button>
        </div>

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

export default TextPinComponent;