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
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-3xl p-6 md:p-10 max-w-6xl w-full shadow-2xl">
        {/* Splash Image - Large and Prominent */}
        <div className="text-center mb-4">
          <div className="inline-block mb-3">
            <Image
              src="/splash.png"
              alt="My Bot Farm"
              width={1200}
              height={1200}
              className="object-contain rounded-2xl"
              priority
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
            My Bot Farm
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-sm mx-auto">
            Build your farming empire, automate with bots, and grow your wealth
          </p>
        </div>

        {!showLoadInput ? (
          /* Main Menu - Horizontal Buttons */
          <div className="flex flex-wrap gap-2 justify-center">
            {hasAutoSave && (
              <button
                onClick={onContinue}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-emerald-500/50 border border-emerald-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base">▶</span>
                  <span>Continue</span>
                </div>
              </button>
            )}

            <button
              onClick={onStartNew}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 border border-slate-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">+</span>
                <span>New Game</span>
              </div>
            </button>

            <button
              onClick={() => setShowLoadInput(true)}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 border border-slate-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">📁</span>
                <span>Load</span>
              </div>
            </button>

            <button
              onClick={onShowTutorial}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 border border-blue-600/50"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">📖</span>
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
        <div className="mt-4 pt-4 border-t border-slate-700 text-center text-slate-500 text-xs">
          Save codes work across all devices and browsers
        </div>
      </div>
    </div>
  );
}
