'use client';

import { useState } from 'react';
import { GameState, SeedBot, SeedBotJob, CropType } from '@/types/game';

interface SeedBotConfigModalProps {
  seedBot: SeedBot;
  gameState: GameState;
  onClose: () => void;
  onUpdateJobs: (jobs: SeedBotJob[], autoBuySeeds: boolean) => void;
  onEnterTileSelectionMode: (jobId: string, cropType: Exclude<CropType, null>) => void;
}

const CROP_INFO = {
  carrot: { name: 'Carrot', emoji: '🥕' },
  wheat: { name: 'Wheat', emoji: '🌾' },
  tomato: { name: 'Tomato', emoji: '🍅' },
};

export default function SeedBotConfigModal({ seedBot, gameState, onClose, onUpdateJobs, onEnterTileSelectionMode }: SeedBotConfigModalProps) {
  const [jobs, setJobs] = useState<SeedBotJob[]>(seedBot.jobs);
  const [autoBuySeeds, setAutoBuySeeds] = useState(seedBot.autoBuySeeds);

  const addJob = () => {
    if (jobs.length >= 3) return; // Max 3 jobs

    const newJob: SeedBotJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cropType: 'carrot', // Default to carrot
      targetTiles: [],
      maxTiles: 10,
    };

    setJobs([...jobs, newJob]);
  };

  const removeJob = (jobId: string) => {
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  const updateJobCrop = (jobId: string, cropType: Exclude<CropType, null>) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, cropType } : j));
  };

  const handleSave = () => {
    onUpdateJobs(jobs, autoBuySeeds);
    onClose();
  };

  const handleSelectTiles = (jobId: string, cropType: Exclude<CropType, null>) => {
    onEnterTileSelectionMode(jobId, cropType);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border-4 border-green-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🌱 Seed Bot Configuration</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-4">
            Configure up to 3 planting jobs. Each job can plant up to 10 tiles of a specific crop type (30 tiles total).
          </p>

          {/* Auto-Buy Seeds Toggle */}
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBuySeeds}
                onChange={(e) => setAutoBuySeeds(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-lg font-semibold">
                🔄 Auto-Buy Seeds (automatically purchase seeds when inventory is low)
              </span>
            </label>
          </div>

          {/* Jobs List */}
          <div className="space-y-4 mb-4">
            {jobs.map((job, idx) => (
              <div key={job.id} className="bg-gradient-to-br from-green-800/50 to-green-900/50 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">Job #{idx + 1}</h3>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded font-bold text-sm"
                  >
                    ✕ Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Crop Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Crop Type:</label>
                    <select
                      value={job.cropType}
                      onChange={(e) => updateJobCrop(job.id, e.target.value as Exclude<CropType, null>)}
                      className="w-full px-3 py-2 bg-black/40 border border-green-600 rounded text-white"
                    >
                      {Object.entries(CROP_INFO).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.emoji} {info.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tile Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tiles Selected: {job.targetTiles.length}/{job.maxTiles}
                    </label>
                    <button
                      onClick={() => handleSelectTiles(job.id, job.cropType)}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
                    >
                      📍 Select Tiles on Map
                    </button>
                  </div>
                </div>

                {/* Tile List Preview */}
                {job.targetTiles.length > 0 && (
                  <div className="mt-3 text-xs text-gray-300">
                    <div className="font-semibold mb-1">Selected Tiles:</div>
                    <div className="flex flex-wrap gap-1">
                      {job.targetTiles.slice(0, 10).map((tile, i) => (
                        <span key={i} className="bg-black/40 px-2 py-0.5 rounded">
                          ({tile.x},{tile.y})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Job Button */}
          {jobs.length < 3 && (
            <button
              onClick={addJob}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg"
            >
              + Add New Job ({jobs.length}/3)
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg"
          >
            💾 Save Configuration
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
