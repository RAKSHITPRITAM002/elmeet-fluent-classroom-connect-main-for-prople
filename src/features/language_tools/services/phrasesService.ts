import { PhraseEntry, LanguageScript } from '../types';

// --- Mock Data ---
const mockPhraseData: Record<string, PhraseEntry[]> = {
  'es': [ // Spanish Phrases
    { phrase: 'Hola, ¿cómo estás?', language: 'es', translation: 'Hello, how are you?', category: 'Greetings' },
    { phrase: 'Buenos días', language: 'es', translation: 'Good morning', category: 'Greetings' },
    { phrase: 'Por favor', language: 'es', translation: 'Please', category: 'Politeness' },
    { phrase: 'Gracias', language: 'es', translation: 'Thank you', category: 'Politeness' },
    { phrase: '¿Cuánto cuesta esto?', language: 'es', translation: 'How much does this cost?', category: 'Shopping' },
    { phrase: 'No entiendo', language: 'es', translation: 'I don\'t understand', category: 'Communication' },
  ],
  'fr': [ // French Phrases
    { phrase: 'Bonjour, comment ça va ?', language: 'fr', translation: 'Hello, how are you?', category: 'Greetings' },
    { phrase: 'S\'il vous plaît', language: 'fr', translation: 'Please', category: 'Politeness' },
    { phrase: 'Merci beaucoup', language: 'fr', translation: 'Thank you very much', category: 'Politeness' },
    { phrase: 'Je ne comprends pas', language: 'fr', translation: 'I don\'t understand', category: 'Communication' },
  ],
  'ko': [ // Korean Phrases
    { phrase: '안녕하세요', language: 'ko', translation: 'Hello (formal)', category: 'Greetings' },
    { phrase: '감사합니다', language: 'ko', translation: 'Thank you (formal)', category: 'Politeness' },
    { phrase: '죄송합니다', language: 'ko', translation: 'Sorry (formal)', category: 'Apologies' },
    { phrase: '이것은 얼마예요?', language: 'ko', translation: 'How much is this?', category: 'Shopping' },
    { phrase: '잘 모르겠어요', language: 'ko', translation: 'I don\'t understand well / I\'m not sure', category: 'Communication' },
  ],
  'ja': [ // Japanese Phrases
    { phrase: 'こんにちは', language: 'ja', translation: 'Hello / Good afternoon', category: 'Greetings' },
    { phrase: 'ありがとう', language: 'ja', translation: 'Thank you', category: 'Politeness' },
    { phrase: 'すみません', language: 'ja', translation: 'Excuse me / Sorry', category: 'Apologies' },
    { phrase: 'これはいくらですか？', language: 'ja', translation: 'How much is this?', category: 'Shopping' },
  ]
  // Add more mock data for other languages
};

// Supported Languages for Phrases (can be same as dictionary or different)
export const phraseLanguages: LanguageScript[] = [
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' }, // No mock data yet, but can be added
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'it', name: 'Italiano (Italian)' }, // No mock data yet
  // Add more languages
];

export const phrasesService = {
  getPhrasesByLanguage: async (languageCode: string, category?: string): Promise<PhraseEntry[]> => {
    console.log(`Mock API: Fetching phrases for language "${languageCode}" ${category ? `in category "${category}"` : ''}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let phrases = mockPhraseData[languageCode] || [];
    if (category && phrases.length > 0) {
      phrases = phrases.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    // In a real API, you'd fetch from:
    // const response = await fetch(`/api/phrases?lang=${languageCode}${category ? '&cat=' + category : ''}`);
    // if (!response.ok) throw new Error('Failed to fetch phrases');
    // return response.json();
    return phrases;
  },

  getAvailableLanguages: (): LanguageScript[] => {
    return phraseLanguages;
  },

  getAvailableCategoriesForLanguage: (languageCode: string): string[] => {
    const phrases = mockPhraseData[languageCode] || [];
    const categories = new Set<string>();
    phrases.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }
};