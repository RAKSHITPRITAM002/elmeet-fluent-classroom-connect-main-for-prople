import React, { useState, useEffect } from 'react';
import { LanguageScript } from '../types';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onToggle: () => void;
  onInput: (char: string) => void; // Callback to send the character to the active input field
  targetInputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>; // Optional: to directly manipulate input
}

// Sample layouts - In a real app, these would be more extensive and potentially loaded dynamically
const layouts: Record<string, string[][]> = {
  'en': [ // Simple English QWERTY example
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'], // Shift, Backspace
    [' ', '←', '→'] // Space, Left, Right
  ],
  'ko-basic': [ // Very basic Hangul Jamo - NOT a full IME
    ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ'],
    ['ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
    ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ'],
    ['ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ', '⌫'],
    [' ', 'Enter']
  ],
  'ja-hiragana-basic': [ // Basic Hiragana - NOT a full IME
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の', '⌫'],
    [' ', 'Enter']
  ],
  // Add more layouts: Pinyin input would be more complex, requiring composition logic.
};

const supportedLanguages: LanguageScript[] = [
  { code: 'en', name: 'English (QWERTY)' },
  { code: 'ko-basic', name: 'Korean (Basic Jamo)' },
  { code: 'ja-hiragana-basic', name: 'Japanese (Basic Hiragana)' },
  // { code: 'zh-pinyin', name: 'Chinese (Pinyin Helper)' }, // Pinyin would need a different input logic
];


export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  isOpen,
  onToggle,
  onInput,
  targetInputRef
}) => {
  const [selectedLangScript, setSelectedLangScript] = useState<string>(supportedLanguages[0].code);
  const [isShiftActive, setIsShiftActive] = useState(false);

  const currentLayout = layouts[selectedLangScript] || layouts['en'];

  const handleKeyPress = (key: string) => {
    if (!targetInputRef?.current) {
        onInput(key); // Fallback if no direct ref
        return;
    }

    const inputElement = targetInputRef.current;
    const start = inputElement.selectionStart || 0;
    const end = inputElement.selectionEnd || 0;
    const currentValue = inputElement.value;

    let charToInsert = key;

    if (key === '⌫') { // Backspace
      if (start === end && start > 0) { // Single char delete
        inputElement.value = currentValue.substring(0, start - 1) + currentValue.substring(end);
        inputElement.setSelectionRange(start - 1, start - 1);
      } else if (start !== end) { // Selection delete
        inputElement.value = currentValue.substring(0, start) + currentValue.substring(end);
        inputElement.setSelectionRange(start, start);
      }
    } else if (key === '⇧') { // Shift
      setIsShiftActive(!isShiftActive);
      return; // Don't insert '⇧'
    } else if (key === ' ') { // Space
      charToInsert = ' ';
    } else if (key === 'Enter') {
      // For 'Enter', we might want to submit a form or insert a newline depending on the target.
      // For simplicity, we'll insert a newline if it's a textarea.
      if (inputElement.tagName === 'TEXTAREA') {
        charToInsert = '\n';
      } else {
        // Potentially trigger form submit or do nothing for input fields
        console.log("Enter pressed on input, not a textarea.");
        return;
      }
    } else if (key === '←') {
        if (start > 0) inputElement.setSelectionRange(start - 1, start - 1);
        return;
    } else if (key === '→') {
        if (end < currentValue.length) inputElement.setSelectionRange(end + 1, end + 1);
        return;
    }
     else {
      // Apply shift if active (very basic example, needs proper mapping for each layout)
      if (isShiftActive && selectedLangScript === 'en' && /^[a-z]$/.test(key)) {
        charToInsert = key.toUpperCase();
      }
      // For more complex scripts, this is where IME logic would go (e.g., Hangul composition)
    }

    if (charToInsert) {
        inputElement.value = currentValue.substring(0, start) + charToInsert + currentValue.substring(end);
        inputElement.setSelectionRange(start + charToInsert.length, start + charToInsert.length);
        // Trigger input/change event manually if needed by React forms
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);
    }


    if (isShiftActive && key !== '⇧') { // Deactivate shift after a character press (unless it's another shift)
      setIsShiftActive(false);
    }
    onInput(charToInsert); // Also call the generic onInput for external handling
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-200 p-3 shadow-lg z-50 border-t border-gray-300">
      <div className="flex justify-between items-center mb-2">
        <select
          value={selectedLangScript}
          onChange={(e) => {
            setSelectedLangScript(e.target.value);
            setIsShiftActive(false); // Reset shift on lang change
          }}
          className="p-1.5 border border-gray-300 rounded-md text-sm bg-white"
        >
          {supportedLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <button onClick={onToggle} className="text-gray-600 hover:text-gray-800 p-1.5">&times; Close</button>
      </div>
      <div className="space-y-1">
        {currentLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`px-3 py-2 min-w-[30px] text-sm rounded-md shadow
                            ${key === ' ' ? 'flex-grow bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
                            ${key === '⇧' && isShiftActive ? 'bg-blue-200' : ''}
                            ${key === '⌫' || key === 'Enter' ? 'bg-gray-300 hover:bg-gray-400' : ''}
                            border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                {/* Basic shift display for EN layout */}
                {isShiftActive && selectedLangScript === 'en' && /^[a-z]$/.test(key) ? key.toUpperCase() : key}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Note: This is a basic virtual keyboard. For complex scripts like Korean or Japanese, full IME functionality (e.g., Hangul composition, Kanji conversion) is not implemented.
      </p>
    </div>
  );
};