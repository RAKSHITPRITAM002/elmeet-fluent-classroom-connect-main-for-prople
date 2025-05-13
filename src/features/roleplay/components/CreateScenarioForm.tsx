import React, { useState } from 'react';
import { CreateScenarioPayload } from '../types';

interface CreateScenarioFormProps {
  onSubmit: (payload: CreateScenarioPayload) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

type FormCharacter = Omit<CreateScenarioPayload['characters'][0], 'id'>;
type FormScene = CreateScenarioPayload['scenes'][0];
type FormDialogue = FormScene['initialDialogue'] extends (infer U)[] ? U : never;


export const CreateScenarioForm: React.FC<CreateScenarioFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [characters, setCharacters] = useState<FormCharacter[]>([{ name: '', description: '' }]);
  const [scenes, setScenes] = useState<FormScene[]>([
    { settingDescription: '', initialDialogue: [] },
  ]);

  // Character Handlers
  const handleCharacterChange = (index: number, field: keyof FormCharacter, value: string) => {
    const newCharacters = [...characters];
    newCharacters[index][field] = value;
    setCharacters(newCharacters);
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: '', description: '' }]);
  };

  const removeCharacter = (index: number) => {
    if (characters.length > 1) { // Keep at least one character, or adjust as needed
      const newCharacters = characters.filter((_, i) => i !== index);
      setCharacters(newCharacters);
      // Also, update dialogue characterIndex if a character is removed
      const updatedScenes = scenes.map(scene => ({
        ...scene,
        initialDialogue: scene.initialDialogue?.map(dialogue => ({
          ...dialogue,
          characterIndex: dialogue.characterIndex >= index && dialogue.characterIndex > 0 ? dialogue.characterIndex -1 : dialogue.characterIndex
        })).filter(dialogue => dialogue.characterIndex < newCharacters.length) || []
      }));
      setScenes(updatedScenes);
    }
  };

  // Scene Handlers
  const handleSceneChange = (sIndex: number, field: 'settingDescription', value: string) => {
    const newScenes = [...scenes];
    newScenes[sIndex][field] = value;
    setScenes(newScenes);
  };

  const addScene = () => {
    setScenes([...scenes, { settingDescription: '', initialDialogue: [] }]);
  };

  const removeScene = (sIndex: number) => {
    if (scenes.length > 1) { // Keep at least one scene
      setScenes(scenes.filter((_, i) => i !== sIndex));
    }
  };

  // Dialogue Handlers
  const handleDialogueChange = (sIndex: number, dIndex: number, field: keyof FormDialogue, value: string | number) => {
    const newScenes = [...scenes];
    if (newScenes[sIndex].initialDialogue) {
      (newScenes[sIndex].initialDialogue![dIndex] as any)[field] = value;
      setScenes(newScenes);
    }
  };

  const addDialogueTurn = (sIndex: number) => {
    const newScenes = [...scenes];
    if (!newScenes[sIndex].initialDialogue) {
      newScenes[sIndex].initialDialogue = [];
    }
    newScenes[sIndex].initialDialogue!.push({ characterIndex: 0, line: '' });
    setScenes(newScenes);
  };

  const removeDialogueTurn = (sIndex: number, dIndex: number) => {
    const newScenes = [...scenes];
    if (newScenes[sIndex].initialDialogue) {
      newScenes[sIndex].initialDialogue!.splice(dIndex, 1);
      setScenes(newScenes);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill in the title and description.');
      return;
    }
    if (characters.some(char => !char.name.trim())) {
      alert('Please provide a name for all characters.');
      return;
    }
    if (scenes.some(scene => !scene.settingDescription.trim())) {
      alert('Please provide a setting description for all scenes.');
      return;
    }
    // Add more validation as needed (e.g., for dialogue)
    await onSubmit({ title, description, characters, scenes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg shadow-md bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-800">Create New Role-Play Scenario</h2>

      {/* Scenario Details */}
      <fieldset className="space-y-3 p-3 border rounded-md">
        <legend className="text-lg font-medium">Scenario Details</legend>
        <div>
          <label htmlFor="scenario-title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text" id="scenario-title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required
          />
        </div>
        <div>
          <label htmlFor="scenario-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="scenario-description" value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required
          />
        </div>
      </fieldset>

      {/* Characters */}
      <fieldset className="space-y-3 p-3 border rounded-md">
        <legend className="text-lg font-medium">Characters</legend>
        {characters.map((char, index) => (
          <div key={index} className="p-2 border-b border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Character {index + 1}</h4>
              {characters.length > 1 && (
                <button type="button" onClick={() => removeCharacter(index)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
            <div>
              <label htmlFor={`char-${index}-name`} className="text-sm">Name</label>
              <input
                type="text" id={`char-${index}-name`} value={char.name}
                onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-sm" required
              />
            </div>
            <div>
              <label htmlFor={`char-${index}-desc`} className="text-sm">Description (Optional)</label>
              <input
                type="text" id={`char-${index}-desc`} value={char.description}
                onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addCharacter} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Character</button>
      </fieldset>

      {/* Scenes */}
      <fieldset className="space-y-3 p-3 border rounded-md">
        <legend className="text-lg font-medium">Scenes</legend>
        {scenes.map((scene, sIndex) => (
          <div key={sIndex} className="p-3 border rounded-md bg-white space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Scene {sIndex + 1}</h4>
              {scenes.length > 1 && (
                <button type="button" onClick={() => removeScene(sIndex)} className="text-xs text-red-500 hover:text-red-700">Remove Scene</button>
              )}
            </div>
            <div>
              <label htmlFor={`scene-${sIndex}-setting`} className="text-sm">Setting Description</label>
              <textarea
                id={`scene-${sIndex}-setting`} value={scene.settingDescription}
                onChange={(e) => handleSceneChange(sIndex, 'settingDescription', e.target.value)}
                rows={2} className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-sm" required
              />
            </div>
            {/* Initial Dialogue for Scene */}
            <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
              <h5 className="text-sm font-medium">Initial Dialogue (Optional)</h5>
              {scene.initialDialogue?.map((dialogue, dIndex) => (
                <div key={dIndex} className="p-2 border-t border-gray-100 space-y-1">
                   <div className="flex justify-between items-center">
                     <p className="text-xs text-gray-500">Turn {dIndex + 1}</p>
                    <button type="button" onClick={() => removeDialogueTurn(sIndex, dIndex)} className="text-xs text-red-400 hover:text-red-600">Remove Turn</button>
                   </div>
                  <div>
                    <label htmlFor={`scene-${sIndex}-dialogue-${dIndex}-char`} className="text-xs">Character</label>
                    <select
                      id={`scene-${sIndex}-dialogue-${dIndex}-char`}
                      value={dialogue.characterIndex}
                      onChange={(e) => handleDialogueChange(sIndex, dIndex, 'characterIndex', parseInt(e.target.value))}
                      className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      disabled={characters.length === 0}
                    >
                      {characters.map((char, charIdx) => (
                        <option key={charIdx} value={charIdx}>{char.name || `Character ${charIdx + 1}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`scene-${sIndex}-dialogue-${dIndex}-line`} className="text-xs">Line</label>
                    <input
                      type="text" id={`scene-${sIndex}-dialogue-${dIndex}-line`} value={dialogue.line}
                      onChange={(e) => handleDialogueChange(sIndex, dIndex, 'line', e.target.value)}
                      className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addDialogueTurn(sIndex)} className="text-xs text-green-600 hover:text-green-800" disabled={characters.length === 0}>+ Add Dialogue Turn</button>
               {characters.length === 0 && <p className="text-xs text-red-500">Add characters first to enable dialogue.</p>}
            </div>
          </div>
        ))}
        <button type="button" onClick={addScene} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Scene</button>
      </fieldset>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button" onClick={onCancel} disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Scenario'}
        </button>
      </div>
    </form>
  );
};