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
  // Upgrade old jobs with maxTiles < 20 to the new 20 tile limit on mount
  const [jobs, setJobs] = useState<SeedBotJob[]>(() =>
    seedBot.jobs.map(job => job.maxTiles < 20 ? { ...job, maxTiles: 20 } : job)
  );
  const [autoBuySeeds, setAutoBuySeeds] = useState(seedBot.autoBuySeeds ?? true); // Default to true

  // Sync jobs state with seedBot prop when it changes (e.g., after tile selection)
  // Also upgrade old jobs with maxTiles < 20 to the new 20 tile limit
  useEffect(() => {
    const upgradedJobs = seedBot.jobs.map(job =>
      job.maxTiles < 20 ? { ...job, maxTiles: 20 } : job
    );
    setJobs(upgradedJobs);
  }, [seedBot.jobs]);

  const addJob = () => {
    if (jobs.length >= 3) return; // Max 3 jobs

    const newJob: SeedBotJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cropType: 'carrot', // Default to carrot
      targetTiles: [],
      maxTiles: 20,
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900 to-green-950 text-white rounded-xl max-w-4xl w-full max-h-[90vh] border-4 border-green-600 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-green-700/50">
          <h2 className="text-3xl font-bold">🌱 Seed Bot Configuration</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Section */}
          <div className="bg-gradient-to-r from-green-800/40 to-green-900/40 border border-green-500/50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-300">{jobs.length}/3</div>
                <div className="text-xs text-gray-400">Active Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">
                  {jobs.reduce((sum, job) => sum + job.targetTiles.length, 0)}/60
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
            Configure up to 3 planting jobs. Each job can plant up to 20 tiles of a specific crop. Select tiles directly on the map to assign planting locations.
          </p>

          {/* Jobs List - Simple Card View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {jobs.map((job, idx) => {
              const jobColor = JOB_COLORS[idx % JOB_COLORS.length];
              const tilePercent = (job.targetTiles.length / job.maxTiles) * 100;
              const cropInfo = CROP_INFO[job.cropType as keyof typeof CROP_INFO];

              return (
                <div key={job.id} className={`bg-gradient-to-br from-green-800/40 to-green-900/40 border-2 ${jobColor.border} rounded-lg p-4 hover:shadow-xl transition-shadow`}>
                  {/* Header with crop emoji */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{cropInfo.emoji}</span>
                      <h3 className={`text-lg font-bold ${jobColor.text}`}>Job {idx + 1}</h3>
                    </div>
                    <button
                      onClick={() => removeJob(job.id)}
                      className="text-red-400 hover:text-red-300 text-xl transition-colors"
                      title="Remove job"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Crop Selection */}
                  <select
                    value={job.cropType}
                    onChange={(e) => updateJobCrop(job.id, e.target.value as Exclude<CropType, null>)}
                    className="w-full px-3 py-2 bg-black/40 border border-green-600 rounded text-white mb-3 hover:bg-black/60 transition-colors text-sm"
                  >
                    {Object.entries(CROP_INFO).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.emoji} {info.name}
                      </option>
                    ))}
                  </select>

                  {/* Tile Count Display */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Tiles</span>
                      <span className={`font-bold ${tilePercent === 100 ? 'text-yellow-400' : jobColor.text}`}>
                        {job.targetTiles.length}/{job.maxTiles}
                      </span>
                    </div>
                    <div className="w-full bg-gray-900/60 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${jobColor.bg} transition-all duration-300`}
                        style={{ width: `${tilePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSelectTiles(job.id, job.cropType)}
                      className={`w-full px-3 py-2 ${jobColor.bg} hover:opacity-90 rounded font-bold text-sm transition-all`}
                    >
                      📍 Select Tiles
                    </button>
                    {job.targetTiles.length > 0 && (
                      <button
                        onClick={() => clearAllTilesFromJob(job.id)}
                        className="w-full px-3 py-1.5 bg-red-600/60 hover:bg-red-600 rounded text-xs transition-colors"
                      >
                        Clear All Tiles
                      </button>
                    )}
                  </div>
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

        {/* Sticky Footer with CTAs */}
        <div className="flex-shrink-0 border-t border-green-700/50 p-6 bg-green-950/50">
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg shadow-lg transition-colors"
            >
              💾 Save Configuration
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg shadow-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
