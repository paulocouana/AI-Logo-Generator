import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { LogoGeneratorForm } from './components/LogoGeneratorForm';
import { LogoDisplay } from './components/LogoDisplay';
import { generateLogo, generateLogoVariations } from './services/geminiService';
import type { LogoGenerationParams, LogoGenerationResult } from './types';
import { fileToBase64 } from './utils/fileUtils';

export type HistoryState = {
  params: Omit<LogoGenerationParams, 'baseImage'>;
  baseImageFile: File | null;
};

const areFilesEqual = (file1: File | null, file2: File | null): boolean => {
    if (file1 === null && file2 === null) return true;
    if (file1 === null || file2 === null) return false;
    return file1.name === file2.name && file1.size === file2.size && file1.lastModified === file2.lastModified;
};


const App: React.FC = () => {
  const initialState: HistoryState = {
    params: {
      prompt: 'a majestic lion head with a futuristic crown',
      companyName: 'Synergize',
      style: 'Modern',
    },
    baseImageFile: null,
  };

  const [history, setHistory] = useState<HistoryState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const { params: generationParams, baseImageFile } = history[historyIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [generatedLogo, setGeneratedLogo] = useState<LogoGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [variations, setVariations] = useState<LogoGenerationResult[] | null>(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<boolean>(false);
  const [variationsError, setVariationsError] = useState<string | null>(null);

  const updateStateAndHistory = useCallback((action: React.SetStateAction<HistoryState>) => {
    const currentState = history[historyIndex];
    const newState = typeof action === 'function' ? action(currentState) : action;

    if (
        JSON.stringify(currentState.params) === JSON.stringify(newState.params) &&
        areFilesEqual(currentState.baseImageFile, newState.baseImageFile)
    ) {
        return;
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
        setHistoryIndex(i => i - 1);
    }
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
        setHistoryIndex(i => i + 1);
    }
  }, [canRedo]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const isModKey = event.metaKey || event.ctrlKey;
        if (isModKey && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        }
        if (isModKey && event.key.toLowerCase() === 'y') {
            event.preventDefault();
            handleRedo();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedLogo(null);
    setVariations(null);
    setVariationsError(null);

    try {
      let baseImagePayload: LogoGenerationParams['baseImage'] | undefined = undefined;
      if (baseImageFile) {
        const base64Data = await fileToBase64(baseImageFile);
        baseImagePayload = {
          mimeType: baseImageFile.type,
          data: base64Data,
        };
      }
      
      const result = await generateLogo({ ...generationParams, baseImage: baseImagePayload });
      setGeneratedLogo(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [generationParams, baseImageFile]);

  const handleGenerateVariations = useCallback(async () => {
    if (!generatedLogo) return;

    setIsGeneratingVariations(true);
    setVariationsError(null);
    setVariations(null);

    try {
       const baseImagePayload: LogoGenerationParams['baseImage'] | undefined = baseImageFile ? {
        mimeType: baseImageFile.type,
        data: await fileToBase64(baseImageFile),
      } : undefined;

      const fullParams = { ...generationParams, baseImage: baseImagePayload };
      const results = await generateLogoVariations(fullParams, generatedLogo);
      setVariations(results);
    } catch (err) {
      console.error(err);
      setVariationsError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingVariations(false);
    }
  }, [generatedLogo, generationParams, baseImageFile]);


  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans antialiased">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]" aria-hidden="true">
          <div 
            className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <main className="container mx-auto px-4 py-8 md:py-12">
          <Header />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <LogoGeneratorForm
              params={generationParams}
              baseImageFile={baseImageFile}
              onStateChange={updateStateAndHistory}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <LogoDisplay
              logo={generatedLogo}
              isLoading={isLoading}
              error={error}
              variations={variations}
              isGeneratingVariations={isGeneratingVariations}
              variationsError={variationsError}
              onGenerateVariations={handleGenerateVariations}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;