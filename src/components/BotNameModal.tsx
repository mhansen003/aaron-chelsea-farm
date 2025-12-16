'use client';

import { useState, useEffect } from 'react';
import { getRandomBotNames } from '@/lib/botNames';
import { WATERBOT_COST, HARVESTBOT_COST, SEEDBOT_COST, TRANSPORTBOT_COST, DEMOLISHBOT_COST } from '@/lib/gameEngine';

interface BotNameModalProps {
  botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | string; // Bot type for cost calculation
  currentName?: string; // Current bot name (for renaming)
  onConfirm: (name: string) => void;
  onCancel: () => void;
  onSell?: () => void; // Optional sell callback
}

const BOT_COSTS = {
  water: WATERBOT_COST,
  harvest: HARVESTBOT_COST,
  seed: SEEDBOT_COST,
  transport: TRANSPORTBOT_COST,
  demolish: DEMOLISHBOT_COST,
};

const BOT_NAMES = {
  water: 'Water Bot',
  harvest: 'Harvest Bot',
  seed: 'Seed Bot',
  transport: 'Transport Bot',
  demolish: 'Demolish Bot',
};

export default function BotNameModal({ botType, currentName, onConfirm, onCancel, onSell }: BotNameModalProps) {
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSellConfirm, setShowSellConfirm] = useState(false);

  const isRenaming = !!currentName;
  const botDisplayName = (BOT_NAMES as any)[botType] || botType;
  const baseCost = (BOT_COSTS as any)[botType] || 0;
  const refundAmount = Math.floor(baseCost * 0.75);

  // Generate 10 random suggestions on mount
  useEffect(() => {
    const randomNames = getRandomBotNames(10);
    setSuggestions(randomNames);
    if (isRenaming && currentName) {
      setCustomName(currentName); // Set current name as default for renaming
    } else {
      setSelectedName(randomNames[0]); // Default to first suggestion
    }
  }, [isRenaming, currentName]);

  const handleConfirm = () => {
    const finalName = customName.trim() || selectedName;
    if (finalName) {
      onConfirm(finalName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl max-w-md w-full border-4 border-gray-600 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-600/50">
          <h2 className="text-2xl font-bold text-center">
            {isRenaming ? `Rename ${botDisplayName}` : `Name Your ${botDisplayName}`}
          </h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            {isRenaming ? 'Update the name or sell this bot' : 'Choose from suggestions or enter a custom name'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Custom Name Input */}
          <div>
            <label className="text-sm font-bold text-gray-300 mb-2 block">
              Custom Name (Optional)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={20}
              placeholder="Enter custom name..."
              className="w-full px-4 py-2 rounded-lg bg-black/40 border-2 border-gray-600/50 text-white placeholder-gray-500 focus:border-gray-400 focus:outline-none"
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="text-sm font-bold text-gray-300 mb-2 block">
              Or Select a Suggestion
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto bg-black/20 p-3 rounded-lg border border-gray-600/30">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedName(name);
                    setCustomName(''); // Clear custom name when selecting suggestion
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedName === name && !customName
                      ? 'bg-blue-600 border-2 border-blue-400 shadow-lg'
                      : 'bg-gray-700/40 border-2 border-gray-600/30 hover:bg-gray-700/60'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-black/40 rounded-lg p-3 border border-gray-600/30">
            <div className="text-xs text-gray-400 mb-1">Preview:</div>
            <div className="text-lg font-bold text-gray-300">
              {customName.trim() || selectedName || '(No name selected)'}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-600/50 space-y-3">
          {/* Sell Confirmation */}
          {showSellConfirm ? (
            <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
              <p className="text-white font-bold text-center mb-3">
                Sell this bot for ${refundAmount}?
              </p>
              <p className="text-red-200 text-sm text-center mb-4">
                This action cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSellConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onSell) onSell();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
                >
                  Confirm Sell
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Main Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
                >
                  {isRenaming ? 'Save Name' : 'Confirm'}
                </button>
              </div>

              {/* Sell Button (only for renaming) */}
              {isRenaming && onSell && (
                <button
                  onClick={() => setShowSellConfirm(true)}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold transition-colors border-2 border-orange-400"
                >
                  💰 Sell Bot for ${refundAmount} (75% refund)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
