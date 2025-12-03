import React from 'react';
import { UploadIcon } from './icons/UploadIcon';

const DropZoneOverlay: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex justify-center items-center pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center w-[95%] h-[95%] border-4 border-dashed border-border-color rounded-3xl">
        <UploadIcon className="w-24 h-24 text-secondary-text" />
        <p className="mt-4 text-3xl font-bold text-primary-text font-display">
          Drop images to pin
        </p>
      </div>
    </div>
  );
};

export default DropZoneOverlay;
