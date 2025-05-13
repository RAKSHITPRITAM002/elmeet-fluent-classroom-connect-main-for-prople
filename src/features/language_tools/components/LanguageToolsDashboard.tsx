import React, { useState, useRef } from 'react';
import { VirtualKeyboard } from './VirtualKeyboard';
import { DictionaryComponent } from './DictionaryComponent';
import { PhrasesComponent } from './PhrasesComponent'; // Import

export const LanguageToolsDashboard: React.FC = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeTool, setActiveTool] = useState<'keyboard' | 'dictionary' | 'phrases' | null>(null);

  // Ref for the input field that the virtual keyboard will target
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyboardInput = (char: string) => {
    // This is a fallback or can be used for additional logic if targetInputRef is not used directly by VirtualKeyboard
    // For example, if VirtualKeyboard only emits characters and doesn't manipulate the DOM.
    // However, with targetInputRef, direct manipulation is often preferred.
    // For now, we'll let VirtualKeyboard handle the input directly via the ref.
    console.log('Keyboard input received by dashboard:', char);
    // Update state if not using direct DOM manipulation or for components not using the ref
    if (textInputRef.current) {
        setInputValue(textInputRef.current.value);
    }
  };

  const toggleKeyboard = () => {
    const newKeyboardState = !isKeyboardOpen;
    setIsKeyboardOpen(newKeyboardState);
    if (newKeyboardState) {
        setActiveTool('keyboard');
    } else if (activeTool === 'keyboard') {
        setActiveTool(null);
    }
  };

  const openTool = (tool: 'dictionary' | 'phrases') => {
    setActiveTool(tool);
            setIsKeyboardOpen(false); // Close keyboard if opening another tool
};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-cyan-700">Language Tools</h1>

      <div className="mb-6 flex space-x-3 border-b pb-3">
        <button
          onClick={toggleKeyboard}
          className={`px-4 py-2 rounded ${activeTool === 'keyboard' && isKeyboardOpen ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {isKeyboardOpen ? 'Hide' : 'Show'} Character Pad
        </button>
        <button
          onClick={() => openTool('dictionary')}
          className={`px-4 py-2 rounded ${activeTool === 'dictionary' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Dictionary
        </button>
        <button
          onClick={() => openTool('phrases')}
          className={`px-4 py-2 rounded ${activeTool === 'phrases' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Phrases
        </button>
      </div>

      {/* Test Input Area for Keyboard */}
      {isKeyboardOpen && activeTool === 'keyboard' && (
         <div className="mb-4">
            <label htmlFor="test-input" className="block text-sm font-medium text-gray-700 mb-1">
            Test Input Area (Focus here to use Character Pad)
            </label>
            <textarea
            id="test-input"
            ref={textInputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Type here or use the virtual keyboard..."
            />
         </div>
      )}

      <VirtualKeyboard
        isOpen={isKeyboardOpen && activeTool === 'keyboard'}
        onToggle={toggleKeyboard}
        onInput={handleKeyboardInput}
        targetInputRef={textInputRef}
      />

      {activeTool === 'dictionary' && (
        <DictionaryComponent />
      )}
      {activeTool === 'phrases' && (
        <PhrasesComponent />
      )}
    </div>
  );
};