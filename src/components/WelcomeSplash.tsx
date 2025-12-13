'use client';

import { useState, useEffect } from 'react';
import { hasAutosave, getAutosaveTimestamp } from '@/lib/saveSystem';

interface WelcomeSplashProps {
  onStartNew: () => void;
  onLoadGame: (saveCode: string) => Promise<void>;
  onContinue: () => void; // Continue from autosave
}

export default function WelcomeSplash({ onStartNew, onLoadGame, onContinue }: WelcomeSplashProps) {
  const [showLoadInput, setShowLoadInput] = useState(false);
  const [saveCode, setSaveCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);
  const [autoSaveTime, setAutoSaveTime] = useState<string | null>(null);

  useEffect(() => {
    // Check for autosave
    const autoSaveExists = hasAutosave();
    setHasAutoSave(autoSaveExists);

    if (autoSaveExists) {
      const timestamp = getAutosaveTimestamp();
      if (timestamp) {
        const date = new Date(timestamp);
        setAutoSaveTime(date.toLocaleString());
      }
    }
  }, []);

  const handleLoadGame = async () => {
    if (!saveCode.trim() || saveCode.trim().length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLoadGame(saveCode.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-900 via-green-800 to-green-950 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border-4 border-amber-600 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-200 mb-2">
            🤖 My Bot Farm 🤖
          </h1>
          <p className="text-amber-300 text-lg">
            Build your farming empire, automate with bots, and grow your wealth!
          </p>
        </div>

        {!showLoadInput ? (
          /* Main Menu */
          <div className="space-y-4">
            {hasAutoSave && (
              <button
                onClick={onContinue}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-bold text-xl shadow-lg transform transition hover:scale-105"
              >
                ▶️ Continue Game
                {autoSaveTime && (
                  <div className="text-sm font-normal opacity-90 mt-1">
                    Last played: {autoSaveTime}
                  </div>
                )}
              </button>
            )}

            <button
              onClick={onStartNew}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-xl shadow-lg transform transition hover:scale-105"
            >
              🆕 Start New Game
            </button>

            <button
              onClick={() => setShowLoadInput(true)}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-xl shadow-lg transform transition hover:scale-105"
            >
              💾 Load with Code
            </button>

            <div className="mt-8 p-4 bg-black/30 rounded-lg">
              <h3 className="text-amber-200 font-bold mb-2">🎮 How to Play:</h3>
              <ul className="text-amber-100 text-sm space-y-1">
                <li>• Use WASD or Arrow Keys to move around</li>
                <li>• Click tiles to interact (till, plant, water, harvest)</li>
                <li>• Buy seeds and tools from the shop 🏪</li>
                <li>• Export crops for money at the export center 🚢</li>
                <li>• Unlock bots to automate your farm 🤖</li>
                <li>• Expand to new zones and discover new biomes 🗺️</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Load Game Input */
          <div className="space-y-4">
            <div>
              <label className="block text-amber-200 font-bold mb-2 text-lg">
                Enter Your 6-Digit Save Code:
              </label>
              <input
                type="text"
                value={saveCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setSaveCode(value);
                  setError('');
                }}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 bg-black/40 border-2 border-amber-600 rounded-lg text-white text-3xl font-mono text-center tracking-widest"
                autoFocus
                disabled={loading}
              />
              {error && (
                <p className="text-red-400 mt-2 text-sm text-center">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLoadGame}
                disabled={loading || saveCode.length !== 6}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg shadow-lg"
              >
                {loading ? '⏳ Loading...' : '✅ Load Game'}
              </button>
              <button
                onClick={() => {
                  setShowLoadInput(false);
                  setSaveCode('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 text-white rounded-lg font-bold text-lg shadow-lg"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-amber-300/70 text-sm">
          💡 Tip: Save your game to get a 6-digit code that works on any device!
        </div>
      </div>
    </div>
  );
}
