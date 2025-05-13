import { CreatePollPayload, Poll, Quiz, CreateQuizPayload } from '../types';

const API_BASE_URL = '/api'; // Adjust if your API is hosted elsewhere

export const pollsQuizzesService = {
  createPoll: async (payload: CreatePollPayload): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if needed:
        // 'Authorization': `Bearer ${your_auth_token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create poll' }));
      throw new Error(errorData.message || 'Failed to create poll');
    }
    return response.json();
  },

  getPolls: async (): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE_URL}/polls`);
    if (!response.ok) {
      throw new Error('Failed to fetch polls');
    }
    return response.json();
  },

  // Placeholder for createQuiz - to be implemented later
  createQuiz: async (payload: CreateQuizPayload): Promise<Quiz> => {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create quiz' }));
        throw new Error(errorData.message || 'Failed to create quiz');
    }
    return response.json();
  },

  // Placeholder for getQuizzes - to be implemented later
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await fetch(`${API_BASE_URL}/quizzes`);
    if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
    }
    return response.json();
  },
};