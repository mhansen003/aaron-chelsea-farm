'use client';

import { GameState } from '@/types/game';
import NextImage from 'next/image';
import { useState } from 'react';

interface SurferModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateSurferSettings: (settings: Partial<GameState['player']['surferAuto']>) => void;
  onUpdateSurferName: (name: string) => void;
}

export default function SurferModal({ gameState, onClose, onUpdateSurferSettings, onUpdateSurferName }: SurferModalProps) {
  const { surferAuto, surferName } = gameState.player;
  const [editingName, setEditingName] = useState(surferName);

  const toggleAutoFish = () => {
    onUpdateSurferSettings({ autoFish: !surferAuto.autoFish });
  };

  const toggleAutoSell = () => {
    onUpdateSurferSettings({ autoSell: !surferAuto.autoSell });
  };

  const handleNameChange = (newName: string) => {
    setEditingName(newName);
    onUpdateSurferName(newName);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-cyan-900 to-blue-900 border-4 border-cyan-500/50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-800 to-blue-800 p-4 border-b-4 border-cyan-500/50">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">Surfer Settings</div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-4xl font-bold transition-colors leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* Top Section - Photo, Name, and About */}
          <div className="bg-cyan-800/50 border-2 border-cyan-500/50 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Bigger Surfer Photo */}
              <div className="w-32 h-32 bg-cyan-700 rounded-full border-4 border-cyan-500 overflow-hidden flex items-center justify-center flex-shrink-0">
                <NextImage
                  src="/surfer.png"
                  alt="Surfer"
                  width={120}
                  height={120}
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                {/* Name next to photo */}
                <div className="mb-4">
                  <label className="text-sm text-cyan-300 font-bold mb-2 block">Surfer Name</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-cyan-700 border-2 border-cyan-500 rounded-lg px-4 py-2 text-white text-xl font-bold focus:outline-none focus:border-cyan-400"
                    maxLength={20}
                    placeholder="Enter surfer name"
                  />
                </div>

                {/* About section at top */}
                <div>
                  <div className="text-sm text-cyan-300 font-bold mb-2">About {editingName || 'the Surfer'}</div>
                  <p className="text-sm text-cyan-100 leading-relaxed">
                    A skilled ocean explorer with a deep connection to the sea, {editingName || 'the Surfer'} has spent years mastering the waves and understanding marine life. With sun-bleached hair and a relaxed demeanor, they've turned their passion for fishing into a profitable venture, bringing the ocean's bounty to market with ease.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="space-y-4">
            <div className="text-sm text-cyan-300 font-bold mb-3">Automation Settings</div>

            <div className="text-xs text-cyan-200 mb-4 bg-cyan-800/30 border border-cyan-700 rounded px-3 py-2">
              ℹ️ Changes take effect immediately and clear the current task queue
            </div>

            {/* Auto Fish - Full Width */}
            <div className="bg-cyan-800/30 hover:bg-cyan-800/50 border-2 border-cyan-700 rounded-lg p-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={surferAuto.autoFish}
                  onChange={toggleAutoFish}
                  className="w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <span className="text-2xl flex-shrink-0">🎣</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">Auto Fish</div>
                  <div className="text-xs text-cyan-300">Automatically catch fish in the ocean</div>
                </div>
              </label>
            </div>

            {/* Auto Sell - Full Width */}
            <div className="bg-cyan-800/30 hover:bg-cyan-800/50 border-2 border-cyan-700 rounded-lg p-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={surferAuto.autoSell}
                  onChange={toggleAutoSell}
                  className="w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <span className="text-2xl flex-shrink-0">🐟</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">Auto Sell to Fish Market</div>
                  <div className="text-xs text-cyan-300">Automatically sell caught fish to the Fish Market</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
