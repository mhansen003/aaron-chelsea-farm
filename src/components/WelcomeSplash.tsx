'use client';

import { useState, useEffect } from 'react';
import { hasAutosave, getAutosaveTimestamp } from '@/lib/saveSystem';
import Image from 'next/image';

interface WelcomeSplashProps {
  onStartNew: () => void;
  onLoadGame: (saveCode: string) => Promise<void>;
  onContinue: () => void; // Continue from autosave
  onShowTutorial: () => void; // Show tutorial modal
}

export default function WelcomeSplash({ onStartNew, onLoadGame, onContinue, onShowTutorial }: WelcomeSplashProps) {
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
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-3xl p-6 md:p-10 max-w-xl w-full shadow-2xl">
        {/* Splash Image - Large and Prominent */}
        <div className="text-center mb-6">
          <div className="inline-block mb-4">
            <Image
              src="/splash.png"
              alt="My Bot Farm"
              width={400}
              height={400}
              className="object-contain rounded-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            My Bot Farm
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-sm mx-auto">
            Build your farming empire, automate with bots, and grow your wealth
          </p>
        </div>

        {!showLoadInput ? (
          /* Main Menu - Compact Buttons */
          <div className="space-y-2">
            {hasAutoSave && (
              <button
                onClick={onContinue}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-base shadow-md transition-all duration-200 hover:shadow-emerald-500/50 border border-emerald-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">▶</span>
                  <span>Continue Game</span>
                </div>
                {autoSaveTime && (
                  <div className="text-xs font-normal opacity-70 mt-0.5">
                    Last: {autoSaveTime}
                  </div>
                )}
              </button>
            )}

            <button
              onClick={onStartNew}
              className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-base shadow-md transition-all duration-200 border border-slate-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">+</span>
                <span>Start New Game</span>
              </div>
            </button>

            <button
              onClick={() => setShowLoadInput(true)}
              className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-base shadow-md transition-all duration-200 border border-slate-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">📁</span>
                <span>Load with Code</span>
              </div>
            </button>

            <button
              onClick={onShowTutorial}
              className="w-full px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold text-base shadow-md transition-all duration-200 border border-blue-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">📖</span>
                <span>Tutorial</span>
              </div>
            </button>
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
