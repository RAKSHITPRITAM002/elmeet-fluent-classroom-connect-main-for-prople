// This is a conceptual Next.js API route.
// Replace with your actual backend logic and database integration.
import { NextApiRequest, NextApiResponse } from 'next';
import { Quiz, CreateQuizPayload, QuizQuestion, QuizQuestionOption } from '@/features/polls_quizzes/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demonstration purposes
let quizzesDB: Quiz[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simulate authentication - replace with actual auth
  const userId = 'mock-user-id'; // req.user.id from your auth middleware

  if (req.method === 'POST') {
    try {
      const { title, questions: questionPayloads } = req.body as CreateQuizPayload;

      if (!title || !questionPayloads || questionPayloads.length === 0) {
        return res.status(400).json({ message: 'Title and at least one question are required.' });
      }

      const newQuizQuestions: QuizQuestion[] = questionPayloads.map(qPayload => {
        if (!qPayload.questionText || qPayload.options.length < 2 || qPayload.correctOptionIndex === undefined) {
          throw new Error('Invalid question data'); // This will be caught by the try-catch
        }
        const options: QuizQuestionOption[] = qPayload.options.map(opt => ({
          id: uuidv4(),
          text: opt.text,
        }));
        return {
          id: uuidv4(),
          questionText: qPayload.questionText,
          options,
          correctOptionId: options[qPayload.correctOptionIndex].id, // Store ID of correct option
          explanation: qPayload.explanation,
        };
      });

      const newQuiz: Quiz = {
        id: uuidv4(),
        title,
        questions: newQuizQuestions,
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };

      quizzesDB.push(newQuiz); // Save to our "database"
      console.log('Quizzes DB:', quizzesDB);

      return res.status(201).json(newQuiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      // Check if it's our custom error message
      if (error instanceof Error && error.message === 'Invalid question data') {
        return res.status(400).json({ message: 'Each question must have text, at least two options, and a selected correct answer.' });
      }
      return res.status(500).json({ message: 'Error creating quiz' });
    }
  } else if (req.method === 'GET') {
    // Basic GET endpoint to retrieve quizzes
    try {
      return res.status(200).json(quizzesDB);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ message: 'Error fetching quizzes' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}