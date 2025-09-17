// FIX: Implemented the AI Assistant modal for generating event content.
import React, { useState } from 'react';
import { geminiService } from '@/services/geminiService';
import { loggingService } from '@/services/loggingService';
import type { City, Category, AIAutofillData, AISuggestionResponse } from '@/types';
import { XIcon, SparklesIcon } from './icons';

interface AIAssistantModalProps {
  onClose: () => void;
  onApplySuggestion: (data: AIAutofillData) => void;
  cities: City[];
  categories: Category[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose, onApplySuggestion, cities, categories }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestionResponse | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await geminiService.getAISuggestions(prompt, cities, categories);
      setSuggestion(result);
      loggingService.trackEvent('ai_suggestion_success', { prompt });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      loggingService.logError(err, { prompt });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApplySuggestion({
      title: suggestion.title,
      description: suggestion.description,
      cityId: suggestion.suggestedCityId,
      categoryId: suggestion.suggestedCategoryId,
      imageBase64: suggestion.generatedImageBase64,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-60 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-secondary" />AI Event Assistant</h2>
            <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {!suggestion && (
            <div>
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700">Describe your event idea</label>
              <textarea
                id="ai-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'A weekend-long music festival in Erbil with local and international rock bands'"
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Be descriptive! Mention the type of event, location, and any key features.</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating event details... This may take a moment.</p>
            </div>
          )}

          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4 text-sm">{error}</div>}

          {suggestion && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold">Here's what I came up with:</h3>
              <div>
                <img src={`data:image/jpeg;base64,${suggestion.generatedImageBase64}`} alt="AI generated event" className="w-full h-64 object-cover rounded-lg" />
              </div>
              <div>
                <label className="font-semibold">Title:</label>
                <p className="p-2 bg-gray-50 rounded-md">{suggestion.title.en}</p>
              </div>
              <div>
                <label className="font-semibold">Description:</label>
                <p className="p-2 bg-gray-50 rounded-md">{suggestion.description.en}</p>
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="font-semibold">Suggested City:</label>
                    <p className="p-2 bg-gray-50 rounded-md">{cities.find(c => c.id === suggestion.suggestedCityId)?.name.en || 'N/A'}</p>
                </div>
                 <div>
                    <label className="font-semibold">Suggested Category:</label>
                    <p className="p-2 bg-gray-50 rounded-md">{categories.find(c => c.id === suggestion.suggestedCategoryId)?.name.en || 'N/A'}</p>
                </div>
               </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
          {suggestion ? (
            <>
              <button onClick={handleGenerate} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Regenerate</button>
              <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-indigo-700">Apply Suggestion</button>
            </>
          ) : (
            <button onClick={handleGenerate} disabled={isLoading || !prompt} className="px-6 py-2 text-white bg-primary rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
