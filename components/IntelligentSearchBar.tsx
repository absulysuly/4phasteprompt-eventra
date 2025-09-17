// FIX: Created the `IntelligentSearchBar` component, which integrates the `useVoiceRecognition` hook to provide voice search capabilities alongside traditional text input. This resolves the 'not a module' error for this file.
import React, { useEffect } from 'react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface IntelligentSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  lang: string;
}

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);

export const IntelligentSearchBar: React.FC<IntelligentSearchBarProps> = ({ query, onQueryChange, onSearch, lang }) => {
  const languageCode = lang === 'ku' ? 'ku-IQ' : lang === 'ar' ? 'ar-IQ' : 'en-US';
  const { isListening, transcript, startListening, hasRecognitionSupport } = useVoiceRecognition(languageCode);

  useEffect(() => {
    if (transcript) {
      onQueryChange(transcript);
    }
  }, [transcript, onQueryChange]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="relative">
        <input
          type="search"
          placeholder={isListening ? 'Listening...' : "Search with voice or text..."}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 pl-12 pr-24 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {hasRecognitionSupport && (
          <button
            onClick={startListening}
            disabled={isListening}
            className="absolute inset-y-0 left-0 flex items-center justify-center w-12 h-full text-gray-500 hover:text-primary disabled:text-red-500"
            title="Search with voice"
          >
            <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
        )}
        <button
          onClick={onSearch}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-20 h-full text-white bg-primary rounded-r-full hover:bg-indigo-700"
        >
          Search
        </button>
      </div>
    </div>
  );
};
