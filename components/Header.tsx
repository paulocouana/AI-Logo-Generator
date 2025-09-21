
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center justify-center gap-3">
        <SparklesIcon className="w-10 h-10 text-purple-400" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          AI Logo Generator
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
        Craft your brand's identity in seconds. Describe your vision and let our AI bring your logo to life with Nano Banana.
      </p>
    </header>
  );
};
