import React from 'react';
import type { LogoGenerationResult } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface LogoDisplayProps {
  logo: LogoGenerationResult | null;
  isLoading: boolean;
  error: string | null;
  variations: LogoGenerationResult[] | null;
  isGeneratingVariations: boolean;
  variationsError: string | null;
  onGenerateVariations: () => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center animate-pulse">
        <div className="w-full max-w-sm aspect-square bg-gray-700 rounded-lg"></div>
        <div className="mt-4 h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="mt-2 h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
);

const Placeholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-300">Your logo will appear here</h3>
        <p className="mt-1 text-sm">Fill out the form and click "Generate" to see the magic happen.</p>
    </div>
);

const VariationSkeleton: React.FC = () => (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
    </div>
);


export const LogoDisplay: React.FC<LogoDisplayProps> = ({ 
    logo, 
    isLoading, 
    error, 
    variations, 
    isGeneratingVariations, 
    variationsError, 
    onGenerateVariations 
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl flex items-center justify-center min-h-[400px] lg:min-h-full">
      {isLoading && <LoadingSkeleton />}
      {!isLoading && error && (
        <div className="text-center text-red-400 p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-semibold">Generation Failed</h3>
            <p className="text-sm">{error}</p>
        </div>
      )}
      {!isLoading && !error && !logo && <Placeholder />}
      {!isLoading && !error && logo && (
        <div className="p-4 md:p-8 w-full">
            <div className="relative group aspect-square max-w-lg mx-auto">
                <img src={logo.imageUrl} alt="Generated Logo" className="w-full h-full object-contain rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <a 
                        href={logo.imageUrl} 
                        download={`logo-${Date.now()}.png`}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download
                    </a>
                </div>
            </div>
            {logo.text && (
                 <div className="mt-4 max-w-lg mx-auto text-center">
                    <p className="text-gray-400 text-sm italic">"{logo.text}"</p>
                </div>
            )}
            <div className="mt-8 border-t border-gray-700 pt-8">
                 <div className="text-center">
                    <button
                        onClick={onGenerateVariations}
                        disabled={isGeneratingVariations}
                        className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
                    >
                        {isGeneratingVariations ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Generate Variations
                            </>
                        )}
                    </button>
                </div>

                {isGeneratingVariations && <VariationSkeleton />}
                {variationsError && (
                    <div className="mt-6 text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                        <p className="font-semibold">Failed to generate variations.</p>
                        <p className="text-sm">{variationsError}</p>
                    </div>
                )}
                {variations && (
                    <div className="mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {variations.map((variation, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={variation.imageUrl} alt={`Logo Variation ${index + 1}`} className="w-full h-full object-contain rounded-lg bg-gray-900/50 p-1" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <a
                                            href={variation.imageUrl}
                                            download={`logo-variation-${index + 1}-${Date.now()}.png`}
                                            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};