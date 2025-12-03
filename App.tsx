import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Pin, FlowBoardResponse, ImagePin, TextPin, ColorPin, BoardDnaPin, ImageSuggestionsPin, RemixesPin, DoNextPin, Link, StyleGuidePin, TagPin } from './types';
import Header from './components/Header';
import PinBoard from './components/PinBoard';
import FloatingActionButton from './components/FloatingActionButton';
import AddTextModal from './components/modals/AddTextModal';
import AddColorModal from './components/modals/AddColorModal';
import ExportModal from './components/modals/ExportModal';
import { analyzeBoard, generateImage } from './services/geminiService';
import { useHistoryState } from './hooks/useHistoryState';
import { initDB, saveFile, getFile, deleteFile } from './services/dbService';
import DropZoneOverlay from './components/DropZoneOverlay';

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = URL.createObjectURL(file);
    });
};

interface BoardState {
  pins: Pin[];
  links: Link[];
}

const DEFAULT_BOARD_STATE: BoardState = { pins: [], links: [] };

const NotificationToast: React.FC<{message: string}> = ({ message }) => {
    return (
        <div 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-lg border border-border-color text-primary-text px-6 py-3 rounded-full shadow-lg z-50 animate-toast font-mono text-sm"
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
};


const App: React.FC = () => {
  const [isHydrating, setIsHydrating] = useState(true);

  const { 
    state, 
    setState,
    reset,
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistoryState<BoardState>(DEFAULT_BOARD_STATE);

  const { pins, links } = state;

  const setPins = useCallback((action: React.SetStateAction<Pin[]>) => {
    setState(prevState => {
      const newPins = typeof action === 'function' 
        ? (action as (prev: Pin[]) => Pin[])(prevState.pins) 
        : action;
      // When a pin is deleted, also delete any links connected to it
      if (newPins.length < prevState.pins.length) {
          const newPinIds = new Set(newPins.map(p => p.id));
          const newLinks = prevState.links.filter(l => newPinIds.has(l.from) && newPinIds.has(l.to));
          return { ...prevState, pins: newPins, links: newLinks };
      }
      return { ...prevState, pins: newPins };
    });
  }, [setState]);

  const setLinks = useCallback((action: React.SetStateAction<Link[]>) => {
    setState(prevState => {
      const newLinks = typeof action === 'function' 
        ? (action as (prev: Link[]) => Link[])(prevState.links) 
        : action;
      return { ...prevState, links: newLinks };
    });
  }, [setState]);


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [isGeneratingFromTag, setIsGeneratingFromTag] = useState<boolean>(false);
  const [newlyGeneratedImage, setNewlyGeneratedImage] = useState<{url: string, file: File} | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const [isAddTextModalOpen, setAddTextModalOpen] = useState(false);
  const [isAddColorModalOpen, setAddColorModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [lastAnalysis, setLastAnalysis] = useState<FlowBoardResponse | null>(null);
  const [analysisCacheKey, setAnalysisCacheKey] = useState<string | null>(null);

  const [selectedPinIds, setSelectedPinIds] = useState<string[]>([]);
  const pinBoardRef = useRef<{ 
    getCenter: () => { x: number, y: number },
    exportBoard: (options: { format: 'png' | 'jpeg'; scale: number; quality: number; }) => Promise<void>;
  }>(null);
  const dragCounter = useRef(0);
  const rootElementRef = useRef(document.getElementById('root'));

  const showNotification = (message: string) => {
    if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(message);
    notificationTimeoutRef.current = window.setTimeout(() => {
        setNotification(null);
    }, 2900); // slightly less than animation duration
  };

  const handleUndo = useCallback(() => {
    if (canUndo) {
        undo();
        showNotification('Last change undone');
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
        redo();
        showNotification('Last change redone');
    }
  }, [canRedo, redo]);

  // Effect for hydrating state from localStorage and IndexedDB on initial load
  useEffect(() => {
    const hydrateState = async () => {
      try {
        const savedStateJSON = localStorage.getItem('flowboard-state');
        if (!savedStateJSON) {
          setIsHydrating(false);
          return;
        }

        const savedState = JSON.parse(savedStateJSON);

        const hydratedPins = await Promise.all(
          savedState.boardState.pins.map(async (pin: any) => {
            if (pin.type === 'image') {
              const file = await getFile(pin.id);
              if (file) {
                return {
                  ...pin,
                  file,
                  url: URL.createObjectURL(file),
                };
              }
              console.warn(`Could not find file for pin ${pin.id} in DB.`);
              return null; // This pin will be filtered out
            }
            return pin;
          })
        );
        
        const validPins = hydratedPins.filter(p => p !== null) as Pin[];
        
        reset({ ...savedState.boardState, pins: validPins });
      } catch (err) {
        console.error("Failed to hydrate state, starting fresh.", err);
        localStorage.removeItem('flowboard-state');
      } finally {
        setIsHydrating(false);
      }
    };
    
    initDB().then(hydrateState);
  }, [reset]);


  // Effect for saving state to localStorage and IndexedDB
  useEffect(() => {
    if (isHydrating) return; // Don't save during initial hydration

    const saveState = async () => {
      try {
        const serializablePins = [];
        for (const pin of state.pins) {
          if (pin.type === 'image' && pin.file) {
            await saveFile(pin.id, pin.file);
            // Omit file and url from the object saved to localStorage
            const { file, url, ...rest } = pin;
            serializablePins.push({ ...rest, fileName: file.name });
          } else {
            serializablePins.push(pin);
          }
        }

        const stateToSave = {
          boardState: { ...state, pins: serializablePins },
        };
        localStorage.setItem('flowboard-state', JSON.stringify(stateToSave));
      } catch (err) {
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
             setError("Whoa, this board is packed! To save our new ideas, you'll need to clear some space first.");
        } else {
            console.error("Failed to save state", err);
        }
      }
    };

    saveState();
  }, [state, isHydrating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
          return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if (
        (modifierKey && e.key.toLowerCase() === 'y') ||
        (modifierKey && e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Effect for global drag-and-drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        // Check if files are being dragged
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            const isFile = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
            if (isFile) {
                setIsDraggingOver(true);
            }
        }
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDraggingOver(false);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault(); // Necessary to allow drop
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        dragCounter.current = 0;
        
        if (e.dataTransfer?.files) {
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                const newPinsData = files.map(file => ({
                    file,
                    url: URL.createObjectURL(file),
                }));
                
                rootElementRef.current?.dispatchEvent(new CustomEvent('add-pins', { detail: newPinsData, bubbles: true }));
            }
        }
    };
    
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
        window.removeEventListener('dragenter', handleDragEnter);
        window.removeEventListener('dragleave', handleDragLeave);
        window.removeEventListener('dragover', handleDragOver);
        window.removeEventListener('drop', handleDrop);
    };
  }, []);

  useEffect(() => {
    const handleAddPins = (event: Event) => {
        (async () => {
            const customEvent = event as CustomEvent;
            const newPinsData: { file: File, url: string }[] = customEvent.detail;
            
            const center = pinBoardRef.current?.getCenter() ?? { x: 300, y: 300 };

            const newPinsPromises = newPinsData.map(async (data, index) => {
                const { width, height } = await getImageDimensions(data.file);

                const MAX_SIZE = 250;
                let newWidth = width;
                let newHeight = height;

                if (newWidth > MAX_SIZE || newHeight > MAX_SIZE) {
                    if (width > height) {
                        newHeight = (MAX_SIZE / newWidth) * newHeight;
                        newWidth = MAX_SIZE;
                    } else {
                        newWidth = (MAX_SIZE / newHeight) * newWidth;
                        newHeight = MAX_SIZE;
                    }
                }
                
                const pin: ImagePin = {
                    id: `pin-${Date.now()}-${index}`,
                    type: 'image',
                    url: data.url,
                    file: data.file,
                    x: center.x + (index - (newPinsData.length -1) / 2) * (newWidth + 10),
                    y: center.y,
                    width: newWidth,
                    height: newHeight,
                };
                return pin;
            });

            try {
                const newPins = await Promise.all(newPinsPromises);
                setPins(prev => [...prev, ...newPins]);
            } catch (error) {
                console.error("Error loading images:", error);
                setError("Looks like that image hit a snag. Let's try pinning it again, shall we?");
            }
        })();
    };

    const rootElement = document.getElementById('root');
    rootElement?.addEventListener('add-pins', handleAddPins);
    return () => {
        rootElement?.removeEventListener('add-pins', handleAddPins);
    };
  }, [setPins]);

  const getAnalysis = useCallback(async (options: { silent?: boolean } = {}): Promise<FlowBoardResponse | null> => {
    const { silent = false } = options;

    const imagePins = pins.filter(p => p.type === 'image') as ImagePin[];
    if (imagePins.length === 0) {
      if (!silent) setError('Ready to start exploring? Pin an image or two to get the ideas flowing.');
      return null;
    }

    const currentCacheKey = imagePins.map(p => p.file.name + p.file.lastModified).join('-');

    if (lastAnalysis && analysisCacheKey === currentCacheKey) {
        return lastAnalysis;
    }

    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
        const imageFiles = imagePins.map(p => p.file);
        const { json } = await analyzeBoard(imageFiles);
        setLastAnalysis(json);
        setAnalysisCacheKey(currentCacheKey);
        return json;
    } catch (err) {
        console.error(err);
        if (!silent) {
          setError('Hmm, my creative circuits fizzled for a moment. Want to try that again? If the problem continues, the console might have a clue.');
        }
        return null;
    } finally {
        if (!silent) {
          setIsLoading(false);
        }
    }
  }, [pins, lastAnalysis, analysisCacheKey, setLastAnalysis, setAnalysisCacheKey, setIsLoading, setError]);

  const handleAnalyzeDna = async () => {
    const analysis = await getAnalysis();
    if (!analysis) return;
    
    const center = pinBoardRef.current?.getCenter() ?? { x: 400, y: 400 };
    const newPin: BoardDnaPin = {
      id: `dna-${Date.now()}`,
      type: 'board-dna',
      dna: analysis.board_dna,
      x: center.x + Math.random() * 40 - 20,
      y: center.y + Math.random() * 40 - 20,
    };
    setPins(prev => [...prev, newPin]);
  };

  const handleAnalyzeStyleGuide = async () => {
    const analysis = await getAnalysis();
    if (!analysis) return;
    const center = pinBoardRef.current?.getCenter() ?? { x: 400, y: 400 };
    const newPin: StyleGuidePin = {
      id: `styleguide-${Date.now()}`,
      type: 'style-guide',
      styleGuide: analysis.style_guide,
      x: center.x + Math.random() * 40 - 20,
      y: center.y + Math.random() * 40 - 20,
    };
    setPins(prev => [...prev, newPin]);
  };

  const handleAnalyzeSuggestions = async () => {
    const analysis = await getAnalysis();
    if (!analysis) return;
    const center = pinBoardRef.current?.getCenter() ?? { x: 400, y: 400 };
    const newPin: ImageSuggestionsPin = {
      id: `suggestions-${Date.now()}`,
      type: 'image-suggestions',
      suggestions: analysis.image_suggestions,
      x: center.x + Math.random() * 40 - 20,
      y: center.y + Math.random() * 40 - 20,
    };
    setPins(prev => [...prev, newPin]);
  };

  const handleAnalyzeRemixes = async () => {
    const analysis = await getAnalysis();
    if (!analysis) return;
    const center = pinBoardRef.current?.getCenter() ?? { x: 400, y: 400 };
    const newPin: RemixesPin = {
      id: `remixes-${Date.now()}`,
      type: 'remixes',
      remixes: analysis.remixes,
      x: center.x + Math.random() * 40 - 20,
      y: center.y + Math.random() * 40 - 20,
    };
    setPins(prev => [...prev, newPin]);
  };

  const handleAnalyzeDoNext = async () => {
    const analysis = await getAnalysis();
    if (!analysis) return;
    const center = pinBoardRef.current?.getCenter() ?? { x: 400, y: 400 };
    const newPin: DoNextPin = {
      id: `donext-${Date.now()}`,
      type: 'do-next',
      doNext: analysis.do_next,
      x: center.x + Math.random() * 40 - 20,
      y: center.y + Math.random() * 40 - 20,
    };
    setPins(prev => [...prev, newPin]);
  };


  const handleGenerateImage = useCallback(async (prompt: string, cardId: string) => {
    setGeneratingImageId(cardId);
    setError(null);
    try {
      const imageUrl = await generateImage(prompt);
      const newFile = await (await fetch(imageUrl)).blob();
      const newPinFile = new File([newFile], `generated-${Date.now()}.png`, { type: 'image/png' });
      
      setNewlyGeneratedImage({ url: imageUrl, file: newPinFile });

    } catch (err) {
      console.error(err);
      setError('The image generator seems to be dreaming up other things right now. Shall we try again?');
    } finally {
      setGeneratingImageId(null);
    }
  }, []);
  
  const handleGenerateFromTag = useCallback(async (tag: string) => {
    setIsGeneratingFromTag(true);
    setError(null);
    try {
      const prompt = `A high-quality, detailed image of: ${tag}, digital art.`;
      const imageUrl = await generateImage(prompt);
      const newFile = await (await fetch(imageUrl)).blob();
      const newPinFile = new File([newFile], `${tag.replace(/\s+/g, '-')}-${Date.now()}.png`, { type: 'image/png' });
      
      setNewlyGeneratedImage({ url: imageUrl, file: newPinFile });

    } catch (err) {
      console.error(err);
      setError('The image generator seems to be dreaming up other things right now. Shall we try again?');
    } finally {
      setIsGeneratingFromTag(false);
    }
  }, []);

  const handleAddText = (content: string, color: string) => {
    const center = pinBoardRef.current?.getCenter() ?? { x: 300, y: 300 };
    const newTextPin: TextPin = {
      id: `text-${Date.now()}`,
      type: 'text',
      content,
      color,
      x: center.x,
      y: center.y,
      width: 220,
      height: 220,
    };
    setPins(prev => [...prev, newTextPin]);
    setAddTextModalOpen(false);
  };

  const handleOpenColorModal = async () => {
    const imagePins = pins.filter(p => p.type === 'image') as ImagePin[];
    if (imagePins.length > 0) {
      setIsLoading(true);
      try {
        const analysis = await getAnalysis();
        if (analysis?.board_dna?.palette) {
          setSuggestedColors(analysis.board_dna.palette);
        }
      } catch (err) {
        console.error("Could not fetch suggested colors", err);
        setSuggestedColors([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestedColors([]);
    }
    setAddColorModalOpen(true);
  };

  const handleAddColor = (hex: string) => {
    const center = pinBoardRef.current?.getCenter() ?? { x: 300, y: 300 };
    const newColorPin: ColorPin = {
      id: `color-${Date.now()}`,
      type: 'color',
      hex,
      x: center.x,
      y: center.y,
      width: 128,
      height: 160,
    };
    setPins(prev => [...prev, newColorPin]);
    setAddColorModalOpen(false);
  };

  const handleAddColorFromDna = (hex: string) => {
    const center = pinBoardRef.current?.getCenter() ?? { x: 300, y: 300 };
    const newColorPin: ColorPin = {
      id: `color-${Date.now()}`,
      type: 'color',
      hex,
      x: center.x + Math.random() * 40 - 20,
      y: center.y + Math.random() * 40 - 20,
      width: 128,
      height: 160,
    };
    setPins(prev => [...prev, newColorPin]);
  };

  const handleAddTagAsNote = (tag: string) => {
      const center = pinBoardRef.current?.getCenter() ?? { x: 300, y: 300 };
      const newTextPin: TextPin = {
          id: `text-${Date.now()}`,
          type: 'text',
          content: tag,
          color: 'blue',
          x: center.x + Math.random() * 40 - 20,
          y: center.y + Math.random() * 40 - 20,
          width: 192,
          height: 192,
      };
      setPins(prev => [...prev, newTextPin]);
  };

  const handleAddTagAsTagPin = (tag: string, category: 'form' | 'material' | 'lever' | 'default') => {
      const center = pinBoardRef.current?.getCenter() ?? { x: 300, y: 300 };
      const newTagPin: TagPin = {
          id: `tag-${Date.now()}`,
          type: 'tag',
          content: tag,
          category,
          x: center.x + Math.random() * 40 - 20,
          y: center.y + Math.random() * 40 - 20,
      };
      setPins(prev => [...prev, newTagPin]);
  };

  const handleDeletePin = (id: string) => {
    const pinToDelete = pins.find(p => p.id === id);
    if (pinToDelete && pinToDelete.type === 'image') {
        deleteFile(pinToDelete.id).catch(err => console.error("Failed to delete file from DB", err));
    }
    setPins(pins => pins.filter(p => p.id !== id));
    setSelectedPinIds(ids => ids.filter(selectedId => selectedId !== id));
  };

  const handleUpdatePin = (pinId: string, updates: Partial<Pin>) => {
    setPins(prevPins =>
      prevPins.map(p => (p.id === pinId ? { ...p, ...updates } : p))
    );
  };

  const handleUpdateLink = (id: string, color: string) => {
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === id ? { ...link, color } : link
      )
    );
  };
  
  const handleExport = async (options: { format: 'png' | 'jpeg', scale: number, quality: number }) => {
    if (pinBoardRef.current) {
      if (pins.length === 0) {
        setError("Your board is empty. Pin something amazing to export!");
        return;
      }
      setIsExporting(true);
      try {
        await pinBoardRef.current.exportBoard(options);
        showNotification(`Board exported as ${options.format.toUpperCase()}`);
      } catch (error) {
        console.error("Export failed:", error);
        setError("Oops, something went wrong while exporting the board. The console might have more details.");
      } finally {
        setIsExporting(false);
        setExportModalOpen(false);
      }
    }
  };

  if (isHydrating) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-background">
          <p className="text-primary-text text-xl animate-pulse font-sans">Brewing up some fresh ideas...</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-transparent text-primary-text flex flex-col overflow-hidden">
        <Header 
          onUndo={handleUndo} 
          onRedo={handleRedo} 
          canUndo={canUndo} 
          canRedo={canRedo}
          onExport={() => setExportModalOpen(true)}
        />
        <main className="flex-1 relative">
          <PinBoard 
            ref={pinBoardRef}
            pins={pins} 
            setPins={setPins}
            links={links}
            setLinks={setLinks}
            newlyGeneratedImage={newlyGeneratedImage}
            onImagePinned={() => setNewlyGeneratedImage(null)}
            onGenerateImage={handleGenerateImage}
            onGenerateFromTag={handleGenerateFromTag}
            isGeneratingFromTag={isGeneratingFromTag}
            generatingImageId={generatingImageId}
            onAddColorFromDna={handleAddColorFromDna}
            onAddTagAsNote={handleAddTagAsNote}
            onAddTagAsTagPin={handleAddTagAsTagPin}
            onDeletePin={handleDeletePin}
            onUpdatePin={handleUpdatePin}
            onUpdateLink={handleUpdateLink}
            selectedPinIds={selectedPinIds}
            setSelectedPinIds={setSelectedPinIds}
          />
          <FloatingActionButton 
            isAnalyzing={isLoading || isGeneratingFromTag}
            onAddText={() => setAddTextModalOpen(true)}
            onAddColor={handleOpenColorModal}
            onAnalyzeDna={handleAnalyzeDna}
            onAnalyzeStyleGuide={handleAnalyzeStyleGuide}
            onAnalyzeSuggestions={handleAnalyzeSuggestions}
            onAnalyzeRemixes={handleAnalyzeRemixes}
            onAnalyzeDoNext={handleAnalyzeDoNext}
          />
        </main>
        {isAddTextModalOpen && (
          <AddTextModal 
            onClose={() => setAddTextModalOpen(false)}
            onAdd={handleAddText}
          />
        )}
        {isAddColorModalOpen && (
          <AddColorModal
            onClose={() => setAddColorModalOpen(false)}
            onAdd={handleAddColor}
            suggestedColors={suggestedColors}
          />
        )}
        {isExportModalOpen && (
          <ExportModal 
            onClose={() => setExportModalOpen(false)}
            onExport={handleExport}
            isExporting={isExporting}
          />
        )}
        {notification && <NotificationToast message={notification} />}
        {error && (
          <div 
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/10 backdrop-blur-md border border-red-300 text-red-800 p-4 rounded-xl shadow-lg z-50 font-sans flex items-center gap-4"
            role="alert"
            aria-live="assertive"
          >
            <p>{error}</p>
            <button onClick={() => setError(null)} className="font-bold text-red-800 hover:text-red-900" aria-label="Dismiss error message">X</button>
          </div>
        )}
      </div>
      {isDraggingOver && <DropZoneOverlay />}
    </>
  );
};

export default App;