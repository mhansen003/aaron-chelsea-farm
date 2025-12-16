'use client';

import { useState } from 'react';

interface SaveGameModalProps {
  saveCode: string;
  onClose: () => void;
}

export default function SaveGameModal({ saveCode, onClose }: SaveGameModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(saveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-xl max-w-md w-full border-4 border-gray-600 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">💾 Game Saved!</h2>

          <p className="text-gray-300 mb-6">
            Write down this code to continue your game later:
          </p>

          <div className="bg-black/40 border-4 border-gray-500 rounded-lg p-6 mb-6">
            <div className="text-6xl font-bold text-gray-300 tracking-widest font-mono">
              {saveCode}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full px-6 py-3 rounded-lg font-bold text-lg mb-3 transition-all ${
              copied
                ? 'bg-green-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg"
          >
            Close
          </button>

          <div className="mt-4 text-sm text-gray-400">
            💡 Your game is also auto-saved in your browser
          </div>
        </div>
      </div>
    </div>
  );
}
