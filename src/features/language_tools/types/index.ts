export interface LanguageScript {
  code: string; // e.g., 'ko', 'ja', 'zh-CN-Pinyin'
  name: string; // e.g., 'Korean (Hangul)', 'Japanese', 'Chinese (Pinyin with Tones)'
  // Potentially add specific characters or layout information here later
  // exampleLayout?: string[][]; // For a simple virtual keyboard
}

// For Dictionary and Phrases later
export interface DictionaryEntry {
  term: string;
  language: string; // Language code of the term
  definitions: Array<{
    partOfSpeech?: string;
    meaning: string;
    example?: string;
  }>;
}

export interface PhraseEntry {
  phrase: string;
  language: string; // Language code of the phrase
  translation: string; // Typically English translation
  category?: string;
}