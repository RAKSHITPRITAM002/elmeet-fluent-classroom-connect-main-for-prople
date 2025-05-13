import { CreateScenarioPayload, RolePlayScenario } from '../types';

const API_BASE_URL = '/api/roleplay';

export const roleplayService = {
  createScenario: async (payload: CreateScenarioPayload): Promise<RolePlayScenario> => {
    const response = await fetch(`${API_BASE_URL}/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization header if needed
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create scenario' }));
      throw new Error(errorData.message || 'Failed to create scenario');
    }
    return response.json();
  },

  getScenarios: async (): Promise<RolePlayScenario[]> => {
    const response = await fetch(`${API_BASE_URL}/scenarios`);
    if (!response.ok) {
      throw new Error('Failed to fetch scenarios');
    }
    return response.json();
  },

  // Placeholder for getting a single scenario
  getScenarioById: async (id: string): Promise<RolePlayScenario | null> => {
    // const response = await fetch(`${API_BASE_URL}/scenarios/${id}`);
    // if (!response.ok) {
    //   if (response.status === 404) return null;
    //   throw new Error('Failed to fetch scenario');
    // }
    // return response.json();
    console.warn("getScenarioById not fully implemented yet");
    return null;
  },
};