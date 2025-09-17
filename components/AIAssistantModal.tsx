import React, { useState, useEffect, useRef } from 'react';
import type { City, Category, AIAutofillData, AISuggestionResponse } from '../types';
import { generateEventDetailsFromPrompt } from '../services/geminiService';
import { loggingService } from '../services/loggingService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: AIAutofillData) => void;
  cities: City[];
  categories: Category[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onApply, cities, categories }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  useEffect(() => {
    if (!isOpen) {
        setPrompt('');
        setSuggestions(null);
        setError(null);
        setIsLoading(false);
        setSelectedImage(null);
    }
  }, [isOpen]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null); // Clear previous validation errors

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, etc.).');
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the input
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size cannot exceed ${MAX_FILE_SIZE_MB}MB.`);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetSuggestions = async () => {
    if (!prompt) {
      setError('Please describe your event idea.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await generateEventDetailsFromPrompt(prompt, cities, categories, selectedImage);
      setSuggestions(result);
    } catch (e) {
      const err = e as Error;
      loggingService.logError(err, { context: 'AIAssistantModal.handleGetSuggestions' });
      setError("Sorry, we couldn't get AI suggestions right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApply = () => {
    if (!suggestions) return;
    onApply({
        title: suggestions.title,
        description: suggestions.description,
        categoryId: suggestions.suggestedCategoryId,
        cityId: suggestions.suggestedCityId,
        imageBase64: suggestions.generatedImageBase64,
    });
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  }

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-neutral-border bg-neutral-container text-neutral-text rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-neutral-container/50 disabled:text-neutral-text-soft";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="bg-neutral-container text-neutral-text rounded-lg shadow-xl w-full max-w-2xl p-6 my-8 border border-neutral-border">
        <div className="flex justify-between items-center mb-4">
          <h2 id="ai-modal-title" className="text-2xl font-bold text-neutral-text">AI Event Assistant</h2>
          <button onClick={handleClose} disabled={isLoading} className="text-neutral-text-soft hover:text-neutral-text disabled:opacity-50 text-2xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="event-prompt" className="block text-sm font-medium text-neutral-text-soft">Describe your event idea</label>
                <textarea id="event-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className={inputClasses}
                    placeholder="e.g., A traditional music concert in Sulaymaniyah for next month" disabled={!!suggestions || isLoading} />
            </div>

            <div>
                 <label className="block text-sm font-medium text-neutral-text-soft">Add an image for inspiration (optional)</label>
                 <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-neutral-border border-dashed rounded-md">
                    {selectedImage ? (
                        <div className="relative group w-full">
                            <img src={selectedImage} alt="Preview" className="mx-auto h-32 rounded-lg object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex justify-center items-center rounded-lg transition-opacity">
                                <button onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-md hover:bg-red-600"
                                    disabled={isLoading || !!suggestions}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-neutral-text-soft" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-neutral-text-soft">
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !!suggestions}
                                    className="relative cursor-pointer bg-neutral-container rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </button>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-neutral-text-soft">PNG, JPG, GIF up to {MAX_FILE_SIZE_MB}MB</p>
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center font-semibold">{error}</p>}
        
        {isLoading && (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-neutral-text-soft">AI is analyzing your idea...</p>
                <p className="text-sm text-neutral-text-soft">This may take a moment.</p>
            </div>
        )}

        {suggestions && (
            <div className="mt-6 border-t border-neutral-border pt-6">
                <h3 className="text-xl font-semibold text-neutral-text mb-4">✨ AI Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="font-medium text-neutral-text-soft">Generated Title:</p>
                        <p className="text-accent font-semibold">{suggestions.title.en}</p>
                        
                        <p className="font-medium text-neutral-text-soft mt-4">Suggested Category:</p>
                        <p className="text-accent font-semibold">{categories.find(c => c.id === suggestions.suggestedCategoryId)?.name.en || 'Unknown'}</p>
                        
                        <p className="font-medium text-neutral-text-soft mt-4">Suggested City:</p>
                        <p className="text-accent font-semibold">{cities.find(c => c.id === suggestions.suggestedCityId)?.name.en || 'Unknown'}</p>
                    </div>
                    <div>
                         <p className="font-medium text-neutral-text-soft mb-2">Generated Image Preview:</p>
                         <img 
                            src={`data:image/png;base64,${suggestions.generatedImageBase64}`} 
                            alt="AI generated event" 
                            className="rounded-lg shadow-md w-full h-auto object-cover border border-neutral-border"
                         />
                    </div>
                </div>
            </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} disabled={isLoading}
            className="px-4 py-2 bg-neutral-border text-neutral-text-soft rounded-md hover:bg-neutral-border/80 disabled:opacity-50">
            Cancel
          </button>
          
          {!suggestions ? (
            <button onClick={handleGetSuggestions} disabled={isLoading || !prompt}
              className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90 disabled:bg-primary/70 disabled:cursor-not-allowed flex items-center justify-center w-48">
              {isLoading ? 'Thinking...' : 'Get AI Suggestions'}
            </button>
          ) : (
            <button onClick={handleApply}
              className="px-4 py-2 bg-accent text-dark-text font-bold rounded-md hover:bg-accent/90">
              Use These Suggestions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
