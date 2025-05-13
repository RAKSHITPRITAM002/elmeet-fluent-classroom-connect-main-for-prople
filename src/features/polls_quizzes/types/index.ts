export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string; // ISO date string
  createdBy: string; // User ID
}

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizQuestionOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string; // ISO date string
  createdBy: string; // User ID
}

// Payloads for creating new polls/quizzes
export interface CreatePollPayload {
  question: string;
  options: Array<{ text: string }>; // IDs will be generated on the backend
}

export interface CreateQuizPayload {
  title: string;
  questions: Array<{
    questionText: string;
    options: Array<{ text: string }>;
    correctOptionIndex: number; // Index of the correct option in the options array
    explanation?: string;
  }>;
}