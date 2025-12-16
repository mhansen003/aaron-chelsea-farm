'use client';

import { useState } from 'react';
import { CropType, FertilizerBotConfig } from '@/types/game';

interface FertilizerBotConfigModalProps {
  botName?: string;
  existingConfig?: FertilizerBotConfig;
  onSave: (config: FertilizerBotConfig) => void;
  onCancel: () => void;
}

const CROP_LIST: Array<Exclude<CropType, null>> = [
  'avocado', 'oranges', 'grapes', 'watermelon', 'pumpkin', 'corn',
  'tomato', 'rice', 'peppers', 'carrot', 'wheat'
];

const CROP_ICONS: Record<Exclude<CropType, null>, string> = {
  carrot: '🥕',
  wheat: '🌾',
  tomato: '🍅',
  pumpkin: '🎃',
  watermelon: '🍉',
  peppers: '🌶️',
  grapes: '🍇',
  oranges: '🍊',
  avocado: '🥑',
  rice: '🌾',
  corn: '🌽',
};

const CROP_NAMES: Record<Exclude<CropType, null>, string> = {
  carrot: 'Carrot',
  wheat: 'Wheat',
  tomato: 'Tomato',
  pumpkin: 'Pumpkin',
  watermelon: 'Watermelon',
  peppers: 'Peppers',
  grapes: 'Grapes',
  oranges: 'Oranges',
  avocado: 'Avocado',
  rice: 'Rice',
  corn: 'Corn',
};

function createDefaultConfig(): FertilizerBotConfig {
  return {
    cropPriority: [...CROP_LIST], // Default priority: high profit first
  };
}

export default function FertilizerBotConfigModal({
  botName = 'Fertilizer Bot',
  existingConfig,
  onSave,
  onCancel,
}: FertilizerBotConfigModalProps) {
  const [config, setConfig] = useState<FertilizerBotConfig>(
    existingConfig || createDefaultConfig()
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPriority = [...config.cropPriority];
    const draggedCrop = newPriority[draggedIndex];
    newPriority.splice(draggedIndex, 1);
    newPriority.splice(index, 0, draggedCrop);

    setConfig({ cropPriority: newPriority });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl max-w-2xl w-full max-h-[95vh] border border-gray-600/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-600/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🌱</span>
                {botName} - Crop Priority
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Drag and drop to reorder which crops to fertilize first
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-800/40 rounded-xl border border-gray-600 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">🎯 Priority System</h3>
            <p className="text-xs text-gray-400">
              The bot will fertilize crops from top to bottom. Drag crops to change their priority.
              Higher priority crops get fertilized first when the bot has fertilizer available.
            </p>
          </div>

          <div className="space-y-2">
            {config.cropPriority.map((crop, index) => (
              <div
                key={crop}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-800/50 rounded-xl border-2 p-4 transition-all cursor-move hover:bg-gray-700/50 ${
                  draggedIndex === index
                    ? 'border-gray-400 opacity-50'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-900/60 rounded-lg font-bold text-gray-300">
                    {index + 1}
                  </div>
                  <span className="text-3xl">{CROP_ICONS[crop]}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{CROP_NAMES[crop]}</div>
                    <div className="text-xs text-gray-400">
                      {index === 0 && 'Highest Priority'}
                      {index === config.cropPriority.length - 1 && index !== 0 && 'Lowest Priority'}
                      {index > 0 && index < config.cropPriority.length - 1 && `Priority ${index + 1}`}
                    </div>
                  </div>
                  <div className="text-green-400 text-2xl">
                    ⇅
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-600/50 p-4 bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-all border border-green-500/30 shadow-lg hover:shadow-green-500/50"
            >
              Save Priority
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition-all border border-gray-600/50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
