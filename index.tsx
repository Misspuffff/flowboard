
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// This is a bit of a hack to communicate with React state from a global event listener
// A more robust solution might use a state management library or context.
const dispatchEvent = (name: string, detail: any) => {
  rootElement.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
};

const fileInput = document.getElementById('file-input-global') as HTMLInputElement;
fileInput.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
      const files = Array.from(target.files);
      const newPinsData = files.map(file => ({
          file,
          url: URL.createObjectURL(file),
      }));
      dispatchEvent('add-pins', newPinsData);
      
      // Reset file input to allow uploading the same file again
      target.value = "";
  }
});

// Add paste event listener
window.addEventListener('paste', (event: ClipboardEvent) => {
  // Don't interfere with text inputs
  if ((event.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
    return;
  }

  const items = event.clipboardData?.items;
  if (!items) return;

  const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
  if (imageItems.length === 0) return;
  
  // We have images, so prevent default paste behavior.
  event.preventDefault();

  const newPinsData = [];
  for (const item of imageItems) {
    const blob = item.getAsFile();
    if (blob) {
      const file = new File([blob], `pasted-image-${Date.now()}.${blob.type.split('/')[1]}`, { type: blob.type });
      newPinsData.push({
        file,
        url: URL.createObjectURL(file),
      });
    }
  }

  if (newPinsData.length > 0) {
    dispatchEvent('add-pins', newPinsData);
  }
});


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);