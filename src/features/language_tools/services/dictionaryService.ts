import { DictionaryEntry, LanguageScript } from '../types';

// --- Mock Data ---
const mockDictionaryData: Record<string, Record<string, DictionaryEntry>> = {
  'en': {
    'hello': {
      term: 'hello', language: 'en', definitions: [
        { partOfSpeech: 'interjection', meaning: 'Used as a greeting or to begin a phone conversation.' },
        { partOfSpeech: 'noun', meaning: 'An utterance of ‘hello’; a greeting.' }
      ]
    },
    'world': {
      term: 'world', language: 'en', definitions: [
        { partOfSpeech: 'noun', meaning: 'The earth, together with all of its countries and peoples.' },
        { partOfSpeech: 'noun', meaning: 'A particular region or group of countries.' }
      ]
    }
  },
  'es': { // Spanish examples
    'hola': {
      term: 'hola', language: 'es', definitions: [
        { partOfSpeech: 'interjección', meaning: 'Se usa como salutación familiar.' }
      ]
    },
    'mundo': {
      term: 'mundo', language: 'es', definitions: [
        { partOfSpeech: 'nombre masculino', meaning: 'El planeta Tierra.' },
        { partOfSpeech: 'nombre masculino', meaning: 'Conjunto de todas las cosas creadas.' }
      ]
    }
  },
  'ko': { // Korean examples
    '안녕하세요': {
        term: '안녕하세요', language: 'ko', definitions: [
            { partOfSpeech: 'interjection (감탄사)', meaning: 'Greeting used to say "Hello" or "Hi" politely.'}
        ]
    },
    '세계': {
        term: '세계', language: 'ko', definitions: [
            { partOfSpeech: 'noun (명사)', meaning: 'The world; society; the times.'}
        ]
    }
  }
  // Add more mock data for other languages as needed
};

// --- Supported Languages for Dictionary ---
// This could be a subset of the VirtualKeyboard languages or a different list
export const dictionaryLanguages: LanguageScript[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  // Add more languages
];


export const dictionaryService = {
  lookupTerm: async (term: string, languageCode: string): Promise<DictionaryEntry | null> => {
    console.log(`Mock API: Looking up term "${term}" in language "${languageCode}"`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const langDict = mockDictionaryData[languageCode];
    if (langDict && langDict[term.toLowerCase()]) {
      return langDict[term.toLowerCase()];
    }
    // In a real API, you'd fetch from:
    // const response = await fetch(`/api/dictionary?term=${encodeURIComponent(term)}&lang=${languageCode}`);
    // if (!response.ok) {
    //   if (response.status === 404) return null; // Term not found
    //   throw new Error('Failed to fetch definition');
    // }
    // return response.json();
    return null; // Term not found in mock data
  },

  getAvailableLanguages: (): LanguageScript[] => {
    return dictionaryLanguages;
  }
};