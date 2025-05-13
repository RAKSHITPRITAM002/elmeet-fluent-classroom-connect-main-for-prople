import React, { useState, useEffect } from 'react';
import { DictionaryEntry, LanguageScript } from '../types';
import { dictionaryService } from '../services/dictionaryService';

export const DictionaryComponent: React.FC = () => {
  const [term, setTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageScript[]>([]);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const languages = dictionaryService.getAvailableLanguages();
    setAvailableLanguages(languages);
    if (languages.length > 0) {
      setSelectedLanguage(languages[0].code); // Default to the first available language
    }
  }, []);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!term.trim() || !selectedLanguage) {
      setError('Please enter a term and select a language.');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const definition = await dictionaryService.lookupTerm(term, selectedLanguage);
      if (definition) {
        setResult(definition);
      } else {
        setError(`No definition found for "${term}" in ${availableLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during lookup.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Dictionary Lookup</h2>
      <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
        <div className="flex-grow">
          <label htmlFor="dict-term" className="block text-sm font-medium text-gray-700">
            Term to look up
          </label>
          <input
            type="text"
            id="dict-term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="e.g., hello, mundo, 안녕하세요"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="dict-lang" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            id="dict-lang"
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
        <button
          type="submit"
          disabled={isLoading || !term.trim()}
          className="w-full sm:w-auto px-4 py-2 bg-cyan-600 text-white rounded-md shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {isLoading && <p className="text-center text-gray-500">Loading definition...</p>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      {result && !isLoading && (
        <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-bold text-cyan-700">{result.term}</h3>
          <p className="text-sm text-gray-500 mb-2">Language: {availableLanguages.find(l => l.code === result.language)?.name || result.language}</p>
          {result.definitions.map((def, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-100 last:border-b-0">
              {def.partOfSpeech && <p className="font-semibold text-sm text-gray-600">{def.partOfSpeech}</p>}
              <p className="text-gray-800">{def.meaning}</p>
              {def.example && <p className="text-xs text-gray-500 italic mt-1">e.g., "{def.example}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};