import React, { useState } from 'react';
import { CreatePollPayload, PollOption } from '../types';

interface CreatePollFormProps {
  onSubmit: (payload: CreatePollPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CreatePollForm: React.FC<CreatePollFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<Array<{ text: string }>>([{ text: '' }, { text: '' }]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { text: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) { // Limit max options
      setOptions([...options, { text: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) { // Keep at least 2 options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.text.trim())) {
      alert('Please fill in the question and all option fields.');
      return;
    }
    await onSubmit({ question, options });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <div>
        <label htmlFor="poll-question" className="block text-sm font-medium text-gray-700">
          Poll Question
        </label>
        <input
          type="text"
          id="poll-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="What's your favorite color?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`Option ${index + 1}`}
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove option"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add Option
          </button>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
    </form>
  );
};