'use client';

import { useState, useEffect } from 'react';
import { GameState, SeedBot, SeedBotJob, CropType } from '@/types/game';

interface SeedBotConfigModalProps {
  seedBot: SeedBot;
  gameState: GameState;
  onClose: () => void;
  onUpdateJobs: (jobs: SeedBotJob[], autoBuySeeds: boolean) => void;
  onEnterTileSelectionMode: (jobId: string, cropType: Exclude<CropType, null>, jobs: SeedBotJob[], autoBuySeeds: boolean) => void;
}

// Job colors for visual distinction
const JOB_COLORS = [
  { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-300', light: 'bg-blue-900/30' },
  { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-300', light: 'bg-purple-900/30' },
  { bg: 'bg-pink-500', border: 'border-pink-400', text: 'text-pink-300', light: 'bg-pink-900/30' },
];

const CROP_INFO = {
  carrot: { name: 'Carrot', emoji: '🥕' },
  wheat: { name: 'Wheat', emoji: '🌾' },
  tomato: { name: 'Tomato', emoji: '🍅' },
  pumpkin: { name: 'Pumpkin', emoji: '🎃' },
  watermelon: { name: 'Watermelon', emoji: '🍉' },
  peppers: { name: 'Peppers', emoji: '🌶️' },
  grapes: { name: 'Grapes', emoji: '🍇' },
  oranges: { name: 'Oranges', emoji: '🍊' },
  avocado: { name: 'Avocado', emoji: '🥑' },
  rice: { name: 'Rice', emoji: '🍚' },
  corn: { name: 'Corn', emoji: '🌽' },
};

export default function SeedBotConfigModal({ seedBot, gameState, onClose, onUpdateJobs, onEnterTileSelectionMode }: SeedBotConfigModalProps) {
  const [jobs, setJobs] = useState<SeedBotJob[]>(seedBot.jobs);
  const [autoBuySeeds, setAutoBuySeeds] = useState(seedBot.autoBuySeeds ?? true); // Default to true

  // Sync jobs state with seedBot prop when it changes (e.g., after tile selection)
  useEffect(() => {
    setJobs(seedBot.jobs);
  }, [seedBot.jobs]);

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

  const removeTileFromJob = (jobId: string, tileIndex: number) => {
    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        const newTargetTiles = [...j.targetTiles];
        newTargetTiles.splice(tileIndex, 1);
        return { ...j, targetTiles: newTargetTiles };
      }
      return j;
    }));
  };

  const clearAllTilesFromJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, targetTiles: [] } : j));
  };

  const handleSave = () => {
    onUpdateJobs(jobs, autoBuySeeds);
    onClose();
  };

  const handleSelectTiles = (jobId: string, cropType: Exclude<CropType, null>) => {
    // Pass the current jobs to be saved before entering tile selection
    onEnterTileSelectionMode(jobId, cropType, jobs, autoBuySeeds);
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
          {/* Summary Section */}
          <div className="bg-gradient-to-r from-green-800/40 to-green-900/40 border border-green-500/50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-300">{jobs.length}/3</div>
                <div className="text-xs text-gray-400">Active Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">
                  {jobs.reduce((sum, job) => sum + job.targetTiles.length, 0)}/30
                </div>
                <div className="text-xs text-gray-400">Total Tiles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">
                  {jobs.filter(j => j.targetTiles.length > 0).length}/{jobs.length}
                </div>
                <div className="text-xs text-gray-400">Jobs Ready</div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            Configure up to 3 planting jobs. Each job can plant up to 10 tiles of a specific crop type. Color-coded tiles help you track which job each tile belongs to.
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
            {jobs.map((job, idx) => {
              const jobColor = JOB_COLORS[idx % JOB_COLORS.length];
              const tilePercent = (job.targetTiles.length / job.maxTiles) * 100;

              return (
                <div key={job.id} className={`bg-gradient-to-br from-green-800/50 to-green-900/50 border-2 ${jobColor.border} rounded-lg p-4 shadow-lg`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 ${jobColor.bg} rounded-full`}></div>
                      <h3 className={`text-xl font-bold ${jobColor.text}`}>Job #{idx + 1}</h3>
                      <span className="text-2xl">{CROP_INFO[job.cropType as keyof typeof CROP_INFO].emoji}</span>
                    </div>
                    <button
                      onClick={() => removeJob(job.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded font-bold text-sm transition-colors"
                    >
                      ✕ Remove Job
                    </button>
                  </div>

                  {/* Tile Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Tiles Configured</span>
                      <span className={`font-bold ${tilePercent === 100 ? 'text-yellow-400' : jobColor.text}`}>
                        {job.targetTiles.length}/{job.maxTiles}
                      </span>
                    </div>
                    <div className="w-full bg-gray-900/60 rounded-full h-3 overflow-hidden border border-gray-700">
                      <div
                        className={`h-full ${jobColor.bg} transition-all duration-300`}
                        style={{ width: `${tilePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Crop Selection and Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Crop Selection */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Crop Type:</label>
                      <select
                        value={job.cropType}
                        onChange={(e) => updateJobCrop(job.id, e.target.value as Exclude<CropType, null>)}
                        className="w-full px-3 py-2 bg-black/40 border border-green-600 rounded text-white hover:bg-black/60 transition-colors"
                      >
                        {Object.entries(CROP_INFO).map(([key, info]) => (
                          <option key={key} value={key}>
                            {info.emoji} {info.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tile Selection Button */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Tile Selection:</label>
                      <button
                        onClick={() => handleSelectTiles(job.id, job.cropType)}
                        className={`w-full px-3 py-2 ${jobColor.bg} hover:opacity-90 rounded font-bold transition-all shadow-md`}
                      >
                        📍 Select on Map
                      </button>
                    </div>
                  </div>

                  {/* Visual Tile Display */}
                  {job.targetTiles.length > 0 && (
                    <div className={`mt-3 ${jobColor.light} border ${jobColor.border} rounded-lg p-3`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-200">Selected Tiles:</span>
                        <button
                          onClick={() => clearAllTilesFromJob(job.id)}
                          className="text-xs px-2 py-1 bg-red-600/80 hover:bg-red-600 rounded transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {job.targetTiles.map((tile, i) => (
                          <div
                            key={i}
                            className={`group relative ${jobColor.bg} px-2 py-1 rounded text-xs font-mono flex items-center gap-1 hover:opacity-75 transition-opacity`}
                          >
                            <span>({tile.x},{tile.y})</span>
                            <button
                              onClick={() => removeTileFromJob(job.id, i)}
                              className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-100 font-bold transition-opacity"
                              title="Remove this tile"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      {job.targetTiles.length > job.maxTiles && (
                        <div className="mt-2 text-xs text-yellow-400">
                          ⚠️ Warning: {job.targetTiles.length - job.maxTiles} tiles over limit
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {job.targetTiles.length === 0 && (
                    <div className="mt-3 bg-black/20 border border-dashed border-gray-600 rounded-lg p-4 text-center text-gray-400">
                      <div className="text-3xl mb-2">📍</div>
                      <div className="text-sm">No tiles selected yet</div>
                      <div className="text-xs mt-1">Click "Select on Map" to choose planting locations</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State - No Jobs */}
          {jobs.length === 0 && (
            <div className="bg-black/20 border-2 border-dashed border-green-600 rounded-lg p-8 text-center mb-4">
              <div className="text-6xl mb-3">🌱</div>
              <h3 className="text-xl font-bold text-green-300 mb-2">No Planting Jobs Configured</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first planting job below!</p>
            </div>
          )}

          {/* Add Job Button */}
          {jobs.length < 3 && (
            <button
              onClick={addJob}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span className="text-2xl">+</span>
              <span>Add New Planting Job</span>
              <span className="ml-2 bg-black/30 px-2 py-0.5 rounded text-sm">
                {jobs.length}/3
              </span>
            </button>
          )}

          {/* Max Jobs Reached */}
          {jobs.length >= 3 && (
            <div className="text-center text-yellow-400 text-sm font-semibold bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-3">
              ✓ Maximum jobs configured (3/3)
            </div>
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
