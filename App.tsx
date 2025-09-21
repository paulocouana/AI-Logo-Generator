import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LogoGeneratorForm } from './components/LogoGeneratorForm';
import { LogoDisplay } from './components/LogoDisplay';
import { generateLogo } from './services/geminiService';
import type { LogoGenerationParams, LogoGenerationResult } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [generationParams, setGenerationParams] = useState<Omit<LogoGenerationParams, 'baseImage'>>({
    prompt: 'a majestic lion head with a futuristic crown',
    companyName: 'Synergize',
    style: 'Modern',
  });
  const [baseImageFile, setBaseImageFile] = useState<File | null>(null);
  const [generatedLogo, setGeneratedLogo] = useState<LogoGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedLogo(null);

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
              setParams={setGenerationParams}
              baseImageFile={baseImageFile}
              setBaseImageFile={setBaseImageFile}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <LogoDisplay
              logo={generatedLogo}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;