import React, { useState, useEffect } from 'react';
import { Poll, Quiz, CreatePollPayload, CreateQuizPayload } from '../types';
import { pollsQuizzesService } from '../services/pollsQuizzesService';
import { CreatePollForm } from './CreatePollForm';
import { CreateQuizForm } from './CreateQuizForm'; // Import CreateQuizForm
// import { PollCard } from './PollCard'; // To be created
// import { QuizCard } from './QuizCard'; // To be created

export const PollsQuizzesDashboard: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreatePollForm, setShowCreatePollForm] = useState(false);
  const [showCreateQuizForm, setShowCreateQuizForm] = useState(false); // State for quiz form

  const fetchPollsAndQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedPolls, fetchedQuizzes] = await Promise.all([
        pollsQuizzesService.getPolls(),
        pollsQuizzesService.getQuizzes(), // Fetch quizzes
      ]);
      setPolls(fetchedPolls);
      setQuizzes(fetchedQuizzes); // Set quizzes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPollsAndQuizzes();
  }, []);

  const handleCreatePoll = async (payload: CreatePollPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPoll = await pollsQuizzesService.createPoll(payload);
      setPolls(prevPolls => [newPoll, ...prevPolls]);
      setShowCreatePollForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create poll');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuiz = async (payload: CreateQuizPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const newQuiz = await pollsQuizzesService.createQuiz(payload);
      setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
            setShowCreateQuizForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Polls & Quizzes</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => {
            setShowCreatePollForm(true);
            setShowCreateQuizForm(false);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Add New Poll
        </button>
        <button
          onClick={() => {
            setShowCreateQuizForm(true);
            setShowCreatePollForm(false);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add New Quiz
        </button>
      </div>

      {showCreatePollForm && (
        <div className="mb-6">
          <CreatePollForm
            onSubmit={handleCreatePoll}
            onCancel={() => setShowCreatePollForm(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {showCreateQuizForm && (
        <div className="mb-6">
          <CreateQuizForm
            onSubmit={handleCreateQuiz}
            onCancel={() => setShowCreateQuizForm(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {isLoading && !polls.length && !quizzes.length && <p>Loading polls and quizzes...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Active Polls</h2>
          {polls.length === 0 && !isLoading && <p>No polls created yet.</p>}
          {polls.map(poll => (
            <div key={poll.id} className="p-4 mb-3 border rounded-lg shadow">
              <h3 className="font-medium">{poll.question}</h3>
              <ul className="list-disc list-inside mt-2">
                {poll.options.map(opt => (
                  <li key={opt.id}>{opt.text} ({opt.votes} votes)</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-1">Created: {new Date(poll.createdAt).toLocaleDateString()}</p>
            </div>
            // <PollCard key={poll.id} poll={poll} /> // Replace with PollCard component later
          ))}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Active Quizzes</h2>
          {quizzes.length === 0 && !isLoading && <p>No quizzes created yet.</p>}
          {quizzes.map(quiz => (
            <div key={quiz.id} className="p-4 mb-3 border rounded-lg shadow">
              <h3 className="font-medium text-lg">{quiz.title}</h3>
              <p className="text-sm text-gray-600">{quiz.questions.length} question(s)</p>
              <p className="text-xs text-gray-500 mt-1">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
              {/* Further details or a "Start Quiz" button can go here */}
            </div>
            // <QuizCard key={quiz.id} quiz={quiz} /> // Replace with QuizCard component later
          ))}
        </section>
      </div>
    </div>
  );
};