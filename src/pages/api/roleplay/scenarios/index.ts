import { NextApiRequest, NextApiResponse } from 'next';
import {
  RolePlayScenario, CreateScenarioPayload, RolePlayCharacter, RolePlayScene, DialogueTurn
} from '@/features/roleplay/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demonstration
let scenariosDB: RolePlayScenario[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'mock-user-id'; // Replace with actual auth

  if (req.method === 'POST') {
    try {
      const payload = req.body as CreateScenarioPayload;

      if (!payload.title || !payload.description || !payload.characters?.length || !payload.scenes?.length) {
        return res.status(400).json({ message: 'Missing required scenario fields.' });
      }

      const newCharacters: RolePlayCharacter[] = payload.characters.map(charPayload => ({
        id: uuidv4(),
        name: charPayload.name,
        description: charPayload.description,
      }));

      const newScenes: RolePlayScene[] = payload.scenes.map(scenePayload => {
        const initialDialogue: DialogueTurn[] = scenePayload.initialDialogue?.map(dialoguePayload => {
          if (dialoguePayload.characterIndex >= newCharacters.length || dialoguePayload.characterIndex < 0) {
            // This case should ideally be validated on the frontend or handled more gracefully
            console.warn(`Invalid characterIndex ${dialoguePayload.characterIndex} for dialogue in scene ${scenePayload.settingDescription}`);
            // Fallback or skip this dialogue turn
            return null; // Or throw an error to be caught
          }
          return {
            characterId: newCharacters[dialoguePayload.characterIndex].id,
            line: dialoguePayload.line,
          };
        }).filter(Boolean) as DialogueTurn[]; // Filter out nulls if any

        return {
          id: uuidv4(),
          settingDescription: scenePayload.settingDescription,
          initialDialogue: initialDialogue || [],
        };
      });

      const newScenario: RolePlayScenario = {
        id: uuidv4(),
        title: payload.title,
        description: payload.description,
        characters: newCharacters,
        scenes: newScenes,
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };

      scenariosDB.push(newScenario);
      console.log('RolePlay Scenarios DB:', scenariosDB);
      return res.status(201).json(newScenario);

    } catch (error) {
      console.error('Error creating role-play scenario:', error);
      return res.status(500).json({ message: 'Error creating scenario' });
    }
  } else if (req.method === 'GET') {
    try {
      return res.status(200).json(scenariosDB);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      return res.status(500).json({ message: 'Error fetching scenarios' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}