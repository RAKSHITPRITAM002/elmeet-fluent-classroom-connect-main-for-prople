import React, { useState, useEffect } from 'react';
import { PhraseEntry, LanguageScript } from '../types';
import { phrasesService } from '../services/phrasesService';

export const PhrasesComponent: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageScript[]>([]);
  const [phrases, setPhrases] = useState<PhraseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // '' for all categories

  useEffect(() => {
    const languages = phrasesService.getAvailableLanguages();
    setAvailableLanguages(languages);
    if (languages.length > 0) {
      setSelectedLanguage(languages[0].code); // Default to the first available language
    }
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      const langCategories = phrasesService.getAvailableCategoriesForLanguage(selectedLanguage);
      setCategories(langCategories);
      setSelectedCategory(''); // Reset category when language changes
      fetchPhrases();
    }
  }, [selectedLanguage]);

  const fetchPhrases = async () => {
    if (!selectedLanguage) return;

    setIsLoading(true);
    setError(null);
    setPhrases([]);

    try {
      const fetchedPhrases = await phrasesService.getPhrasesByLanguage(selectedLanguage, selectedCategory || undefined);
      setPhrases(fetchedPhrases);
      if (fetchedPhrases.length === 0 && selectedCategory) {
        setError(`No phrases found for category "${selectedCategory}" in ${availableLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}. Try 'All Categories'.`);
      } else if (fetchedPhrases.length === 0) {
        setError(`No phrases found for ${availableLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching phrases.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch phrases when selectedCategory changes too
  useEffect(() => {
    if (selectedLanguage) { // Ensure language is selected before fetching by category
        fetchPhrases();
    }
  }, [selectedCategory, selectedLanguage]); // Re-fetch if selectedLanguage changes as well

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert(`Copied "${text}" to clipboard!`))
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Common Phrases</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
        <div>
          <label htmlFor="phrase-lang" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            id="phrase-lang"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="mt-1 block w-full sm:w-48 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            disabled={availableLanguages.length === 0}
          >
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        {categories.length > 0 && (
          <div>
            <label htmlFor="phrase-category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="phrase-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full sm:w-48 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading && <p className="text-center text-gray-500">Loading phrases...</p>}
      {error && !isLoading && phrases.length === 0 && <div className="p-3 bg-yellow-100 text-yellow-700 rounded text-sm">{error}</div>}

      {!isLoading && phrases.length > 0 && (
        <div className="space-y-3">
          {phrases.map((entry, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-medium text-cyan-700">{entry.phrase}</p>
                  <p className="text-sm text-gray-600">"{entry.translation}"</p>
                </div>
                <button
                    onClick={() => handleCopyToClipboard(entry.phrase)}
                    title="Copy phrase"
                    className="text-xs p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded"
                >
                    📋 Copy
                </button>
              </div>
              {entry.category && <p className="text-xs text-gray-400 mt-1">Category: {entry.category}</p>}
              {/* Add audio player if entry.audioUrl exists */}
            </div>
          ))}
        </div>
      )}
      {!isLoading && !error && phrases.length === 0 && selectedLanguage && (
        <p className="text-gray-500">No phrases available for the selected language/category.</p>
      )}
    </div>
  );
};