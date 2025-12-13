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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="text-6xl mb-3">🤖</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            My Bot Farm
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Build your farming empire, automate with bots, and grow your wealth
          </p>
        </div>

        {!showLoadInput ? (
          /* Main Menu */
          <div className="space-y-3">
            {hasAutoSave && (
              <button
                onClick={onContinue}
                className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-emerald-500/50 border border-emerald-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Continue Game</span>
                  <span className="text-xl">▶</span>
                </div>
                {autoSaveTime && (
                  <div className="text-xs font-normal opacity-80 mt-1.5">
                    Last played: {autoSaveTime}
                  </div>
                )}
              </button>
            )}

            <button
              onClick={onStartNew}
              className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 border border-slate-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Start New Game</span>
                <span className="text-xl">+</span>
              </div>
            </button>

            <button
              onClick={() => setShowLoadInput(true)}
              className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 border border-slate-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Load with Code</span>
                <span className="text-xl">📁</span>
              </div>
            </button>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-slate-200 font-semibold mb-3 text-sm uppercase tracking-wide">Quick Start Guide</h3>
              <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">•</span>
                  <span>Use WASD or Arrow Keys to move around</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">•</span>
                  <span>Click tiles to interact (till, plant, water, harvest)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">•</span>
                  <span>Buy seeds from the shop and export crops for money</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">•</span>
                  <span>Unlock bots to automate your farming empire</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Load Game Input */
          <div className="space-y-5">
            <div>
              <label className="block text-slate-200 font-semibold mb-3 text-base">
                Enter Your 6-Digit Save Code
              </label>
              <input
                type="text"
                value={saveCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setSaveCode(value);
                  setError('');
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 bg-slate-900/50 border-2 border-slate-600 focus:border-emerald-500 rounded-xl text-white text-3xl font-mono text-center tracking-[0.5em] transition-colors outline-none"
                autoFocus
                disabled={loading}
              />
              {error && (
                <p className="text-red-400 mt-3 text-sm text-center font-medium">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLoadGame}
                disabled={loading || saveCode.length !== 6}
                className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-base shadow-lg transition-all duration-200 border border-emerald-500/30 disabled:border-slate-600/50"
              >
                {loading ? 'Loading...' : 'Load Game'}
              </button>
              <button
                onClick={() => {
                  setShowLoadInput(false);
                  setSaveCode('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl font-semibold text-base shadow-lg transition-all duration-200 border border-slate-600/50"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700 text-center text-slate-500 text-xs">
          Save codes work across all devices and browsers
        </div>
      </div>
    </div>
  );
}
