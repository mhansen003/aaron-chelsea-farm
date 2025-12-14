'use client';

import { useState, useEffect } from 'react';
import { getRandomBotNames } from '@/lib/botNames';

interface BotNameModalProps {
  botType: string; // e.g., "Water Bot", "Harvest Bot"
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function BotNameModal({ botType, onConfirm, onCancel }: BotNameModalProps) {
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate 10 random suggestions on mount
  useEffect(() => {
    const randomNames = getRandomBotNames(10);
    setSuggestions(randomNames);
    setSelectedName(randomNames[0]); // Default to first suggestion
  }, []);

  const handleConfirm = () => {
    const finalName = customName.trim() || selectedName;
    if (finalName) {
      onConfirm(finalName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-xl max-w-md w-full border-4 border-indigo-500 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-indigo-700/50">
          <h2 className="text-2xl font-bold text-center">Name Your {botType}</h2>
          <p className="text-sm text-gray-300 text-center mt-2">
            Choose from suggestions or enter a custom name
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Custom Name Input */}
          <div>
            <label className="text-sm font-bold text-indigo-300 mb-2 block">
              Custom Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={20}
              placeholder="Enter custom name..."
              className="w-full px-4 py-2 rounded-lg bg-black/40 border-2 border-indigo-500/50 text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="text-sm font-bold text-indigo-300 mb-2 block">
              Or Select a Suggestion
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto bg-black/20 p-3 rounded-lg border border-indigo-700/30">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedName(name);
                    setCustomName(''); // Clear custom name when selecting suggestion
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedName === name && !customName
                      ? 'bg-indigo-600 border-2 border-indigo-400 shadow-lg'
                      : 'bg-indigo-900/40 border-2 border-indigo-700/30 hover:bg-indigo-800/60'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-black/40 rounded-lg p-3 border border-indigo-500/30">
            <div className="text-xs text-gray-400 mb-1">Preview:</div>
            <div className="text-lg font-bold text-indigo-300">
              {customName.trim() || selectedName || '(No name selected)'}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-indigo-700/50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
