import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { LogoGenerationParams } from '../types';
import type { HistoryState } from '../App';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';

interface LogoGeneratorFormProps {
  params: Omit<LogoGenerationParams, 'baseImage'>;
  baseImageFile: File | null;
  onStateChange: (action: React.SetStateAction<HistoryState>) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const logoStyles = ['Minimalist', 'Vintage', 'Modern', 'Playful', 'Abstract', 'Corporate', 'Geometric', 'Hand-drawn'];

export const LogoGeneratorForm: React.FC<LogoGeneratorFormProps> = ({
  params,
  baseImageFile,
  onStateChange,
  onGenerate,
  isLoading,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (baseImageFile) {
      objectUrl = URL.createObjectURL(baseImageFile);
      setImagePreview(objectUrl);
    } else {
      setImagePreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [baseImageFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onStateChange(prev => ({ ...prev, baseImageFile: file }));
  };
  
  const handleRemoveImage = () => {
    onStateChange(prev => ({ ...prev, baseImageFile: null }));
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onStateChange(prev => ({ ...prev, params: { ...prev.params, [name]: value } }));
  };
  
  const handleStyleChange = (style: string) => {
    onStateChange(prev => ({ ...prev, params: { ...prev.params, style } }));
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-8 space-y-6 h-full flex flex-col">
      <div className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
            1. Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
            placeholder="e.g., Quantum Leap Inc."
            value={params.companyName}
            onChange={handleInputChange}
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            2. Choose a Style
          </label>
          <div className="flex flex-wrap gap-2">
            {logoStyles.map((style) => (
              <button
                key={style}
                onClick={() => handleStyleChange(style)}
                type="button"
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  params.style === style
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            3. Describe your logo concept
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={3}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
            placeholder="e.g., A majestic lion head"
            value={params.prompt}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-300 mb-2">
            4. Upload a base image (Optional)
          </span>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
              {!imagePreview ? (
                <div className="text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-purple-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-purple-300"
                    >
                      <span>Upload a file</span>
                      <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                </div>
              ) : (
                  <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded-md" />
                       <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <button onClick={handleRemoveImage} className="text-white bg-red-600 hover:bg-red-700 rounded-full p-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                          </button>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
      <div className="mt-auto pt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || !params.prompt || !params.companyName}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generate Logo
            </>
          )}
        </button>
        <div className="mt-4 flex justify-center gap-4">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Undo last change"
            >
                <UndoIcon className="w-5 h-5" />
                Undo
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Redo last change"
            >
                <RedoIcon className="w-5 h-5" />
                Redo
            </button>
        </div>
      </div>
    </div>
  );
};