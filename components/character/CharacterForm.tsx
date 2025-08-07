'use client';

import { useState } from 'react';
import { validateCharacterName, validateBattleChat } from '@/lib/character';

interface CharacterFormProps {
  onSubmit: (data: { name: string; battleChat: string }) => void;
  isLoading?: boolean;
  error?: string;
  mode?: 'create' | 'edit';
  initialBattleChat?: string;
}

export default function CharacterForm({ 
  onSubmit, 
  isLoading = false,
  error,
  mode = 'create',
  initialBattleChat = ''
}: CharacterFormProps) {
  const [name, setName] = useState('');
  const [battleChat, setBattleChat] = useState(initialBattleChat);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    battleChat?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: typeof validationErrors = {};
    
    if (mode === 'create') {
      const nameValidation = validateCharacterName(name);
      if (!nameValidation.valid) {
        errors.name = nameValidation.error;
      }
    }
    
    const chatValidation = validateBattleChat(battleChat);
    if (!chatValidation.valid) {
      errors.battleChat = chatValidation.error;
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    onSubmit({ name, battleChat });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {mode === 'create' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Character Name (Max 10 characters)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter character name"
            disabled={isLoading}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
          )}
          <p className="mt-1 text-sm text-gray-400">
            {name.length}/10 characters
          </p>
        </div>
      )}
      
      <div>
        <label htmlFor="battleChat" className="block text-sm font-medium text-gray-300 mb-2">
          Battle Chat (Max 100 characters)
        </label>
        <textarea
          id="battleChat"
          value={battleChat}
          onChange={(e) => setBattleChat(e.target.value)}
          maxLength={100}
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Enter your battle chat message"
          disabled={isLoading}
        />
        {validationErrors.battleChat && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.battleChat}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          {battleChat.length}/100 characters
        </p>
        <p className="mt-2 text-sm text-gray-500">
          This message will be displayed when you enter battle.
        </p>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
      >
        {isLoading ? 'Processing...' : mode === 'create' ? 'Create Character' : 'Update Battle Chat'}
      </button>
    </form>
  );
}