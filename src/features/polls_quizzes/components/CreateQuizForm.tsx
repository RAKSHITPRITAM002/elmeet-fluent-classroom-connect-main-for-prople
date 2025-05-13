import React, { useState } from 'react';
import { CreateQuizPayload } from '../types';

interface CreateQuizFormProps {
  onSubmit: (payload: CreateQuizPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormQuestion {
  questionText: string;
  options: Array<{ text: string }>;
  correctOptionIndex: number;
  explanation?: string;
}

export const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    { questionText: '', options: [{ text: '' }, { text: '' }], correctOptionIndex: 0, explanation: '' },
  ]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleQuestionTextChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOptionIndex = oIndex;
    setQuestions(newQuestions);
  };

  const handleExplanationChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].explanation = value;
    setQuestions(newQuestions);
  };

  const addOptionToQuestion = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length < 6) { // Max 6 options per question
      newQuestions[qIndex].options.push({ text: '' });
      setQuestions(newQuestions);
    }
  };

  const removeOptionFromQuestion = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) { // Min 2 options
      newQuestions[qIndex].options.splice(oIndex, 1);
      // Adjust correctOptionIndex if the removed option was the correct one or before it
      if (newQuestions[qIndex].correctOptionIndex === oIndex) {
        newQuestions[qIndex].correctOptionIndex = 0; // Default to first option
      } else if (newQuestions[qIndex].correctOptionIndex > oIndex) {
        newQuestions[qIndex].correctOptionIndex -= 1;
      }
      setQuestions(newQuestions);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: [{ text: '' }, { text: '' }], correctOptionIndex: 0, explanation: '' },
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length > 1) { // Keep at least one question
      const newQuestions = questions.filter((_, index) => index !== qIndex);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }
    for (const q of questions) {
      if (!q.questionText.trim()) {
        alert('Please fill in all question texts.');
        return;
      }
      if (q.options.some(opt => !opt.text.trim())) {
        alert('Please fill in all option texts for each question.');
        return;
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        alert('Please select a valid correct answer for each question.');
        return;
      }
    }
    await onSubmit({ title, questions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg shadow-md">
      <div>
        <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700">
          Quiz Title
        </label>
        <input
          type="text"
          id="quiz-title"
          value={title}
          onChange={handleTitleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., General Knowledge Challenge"
          required
        />
      </div>

      {questions.map((question, qIndex) => (
        <div key={qIndex} className="p-4 border rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Question {qIndex + 1}</h3>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove Question
              </button>
            )}
          </div>
          <div>
            <label htmlFor={`q-${qIndex}-text`} className="block text-sm font-medium text-gray-700">
              Question Text
            </label>
            <textarea
              id={`q-${qIndex}-text`}
              value={question.questionText}
              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., What is the capital of France?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  name={`q-${qIndex}-correct`}
                  id={`q-${qIndex}-o-${oIndex}-correct`}
                  checked={question.correctOptionIndex === oIndex}
                  onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={`Option ${oIndex + 1}`}
                  required
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOptionFromQuestion(qIndex, oIndex)}
                    className="text-red-500 hover:text-red-700 text-xl"
                    aria-label="Remove option"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {question.options.length < 6 && (
              <button
                type="button"
                onClick={() => addOptionToQuestion(qIndex)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add Option
              </button>
            )}
          </div>
          <div>
            <label htmlFor={`q-${qIndex}-explanation`} className="block text-sm font-medium text-gray-700">
              Explanation (Optional)
            </label>
            <textarea
              id={`q-${qIndex}-explanation`}
              value={question.explanation}
              onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Paris is the capital and most populous city of France."
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="mt-2 px-3 py-1.5 text-sm border border-dashed border-gray-400 rounded text-gray-600 hover:bg-gray-50"
      >
        + Add Another Question
      </button>

      <div className="flex justify-end space-x-3 pt-4">
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
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
};