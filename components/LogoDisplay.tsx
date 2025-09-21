
import React from 'react';
import type { LogoGenerationResult } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface LogoDisplayProps {
  logo: LogoGenerationResult | null;
  isLoading: boolean;
  error: string | null;
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

export const LogoDisplay: React.FC<LogoDisplayProps> = ({ logo, isLoading, error }) => {
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
        </div>
      )}
    </div>
  );
};
