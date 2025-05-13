// This is a conceptual Next.js API route.
// Replace with your actual backend logic and database integration.
import { NextApiRequest, NextApiResponse } from 'next';
import { Poll, CreatePollPayload, PollOption } from '@/features/polls_quizzes/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// In-memory store for demonstration purposes
let pollsDB: Poll[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simulate authentication - replace with actual auth
  const userId = 'mock-user-id'; // req.user.id from your auth middleware

  if (req.method === 'POST') {
    try {
      const { question, options: optionTexts } = req.body as CreatePollPayload;

      if (!question || !optionTexts || optionTexts.length < 2) {
        return res.status(400).json({ message: 'Question and at least two options are required.' });
      }
      if (optionTexts.some(opt => !opt.text || opt.text.trim() === '')) {
        return res.status(400).json({ message: 'All options must have text.' });
      }


      const newPollOptions: PollOption[] = optionTexts.map(opt => ({
        id: uuidv4(),
        text: opt.text,
        votes: 0,
      }));

      const newPoll: Poll = {
        id: uuidv4(),
        question,
        options: newPollOptions,
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };

      pollsDB.push(newPoll); // Save to our "database"
      console.log('Polls DB:', pollsDB);


      return res.status(201).json(newPoll);
    } catch (error) {
      console.error('Error creating poll:', error);
      return res.status(500).json({ message: 'Error creating poll' });
    }
  } else if (req.method === 'GET') {
    // Basic GET endpoint to retrieve polls
    try {
      // Add pagination, filtering, sorting in a real app
      return res.status(200).json(pollsDB);
    } catch (error) {
      console.error('Error fetching polls:', error);
      return res.status(500).json({ message: 'Error fetching polls' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}