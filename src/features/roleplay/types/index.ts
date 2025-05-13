export interface RolePlayCharacter {
  id: string;
  name: string;
  description?: string; // e.g., "A friendly shopkeeper", "A nervous student"
  // avatarUrl?: string; // Optional: for visual representation
}

export interface DialogueTurn {
  characterId: string; // ID of the character speaking
  line: string; // The dialogue text
  // emotion?: string; // Optional: e.g., "happy", "surprised"
  // action?: string; // Optional: e.g., "hands a letter", "looks around"
}

export interface RolePlayScene {
  id: string;
  settingDescription: string; // e.g., "A bustling marketplace", "A quiet library"
  initialDialogue?: DialogueTurn[];
  // objectives?: string[]; // Optional: goals for the players in this scene
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string; // Overall description of the scenario
  characters: RolePlayCharacter[];
  scenes: RolePlayScene[]; // A scenario can have multiple scenes
  createdAt: string; // ISO date string
  createdBy: string; // User ID
  // difficulty?: 'easy' | 'medium' | 'hard'; // Optional
  // learningObjectives?: string[]; // Optional
}

// Payload for creating a new scenario
export interface CreateScenarioPayload {
  title: string;
  description: string;
  characters: Array<Omit<RolePlayCharacter, 'id'>>; // IDs will be generated on backend
  scenes: Array<{
    settingDescription: string;
    initialDialogue?: Array<Omit<DialogueTurn, 'characterId'> & { characterIndex: number }>; // Use index to link to characters array
  }>;
}