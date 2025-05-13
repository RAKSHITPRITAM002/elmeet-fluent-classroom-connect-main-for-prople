import React, { useState, useEffect } from 'react';
import { RolePlayScenario, CreateScenarioPayload } from '../types';
import { roleplayService } from '../services/roleplayService';
import { CreateScenarioForm } from './CreateScenarioForm';
// import { ScenarioCard } from './ScenarioCard'; // To be created for displaying individual scenarios

export const RolePlayDashboard: React.FC = () => {
  const [scenarios, setScenarios] = useState<RolePlayScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeScenario, setActiveScenario] = useState<RolePlayScenario | null>(null); // For "Active Scenario" display

  const fetchScenarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedScenarios = await roleplayService.getScenarios();
      setScenarios(fetchedScenarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleCreateScenario = async (payload: CreateScenarioPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const newScenario = await roleplayService.createScenario(payload);
      setScenarios(prev => [newScenario, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScenario = (scenario: RolePlayScenario) => {
    setActiveScenario(scenario);
    // Here you would navigate to a different view or component
    // that handles the actual role-playing interaction.
    alert(`Starting scenario: ${scenario.title}`);
    console.log("Active Scenario set:", scenario);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Role Play</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          + Create New Scenario
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateScenarioForm
            onSubmit={handleCreateScenario}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {activeScenario && (
        <div className="mb-6 p-4 border-2 border-green-500 rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold text-green-700">Active Scenario</h2>
          <h3 className="text-lg font-medium">{activeScenario.title}</h3>
          <p className="text-sm text-gray-600">{activeScenario.description}</p>
          <button
            onClick={() => setActiveScenario(null)}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            End Active Scenario
          </button>
          {/* More active scenario details and interaction controls would go here */}
        </div>
      )}


      <section>
        <h2 className="text-xl font-semibold mb-3">Available Scenarios</h2>
        {isLoading && scenarios.length === 0 && <p>Loading scenarios...</p>}
        {!isLoading && scenarios.length === 0 && !showCreateForm && <p>No scenarios created yet. Click "Create New Scenario" to begin.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map(scenario => (
            // Replace with a ScenarioCard component later for better presentation
            <div key={scenario.id} className="p-4 border rounded-lg shadow bg-white">
              <h3 className="text-lg font-semibold text-purple-600">{scenario.title}</h3>
              <p className="text-sm text-gray-600 truncate h-10">{scenario.description}</p>
              <p className="text-xs text-gray-500 mt-1">Characters: {scenario.characters.length}, Scenes: {scenario.scenes.length}</p>
              <p className="text-xs text-gray-500">Created: {new Date(scenario.createdAt).toLocaleDateString()}</p>
              <button
                onClick={() => handleStartScenario(scenario)}
                className="mt-3 w-full px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Start Scenario
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};