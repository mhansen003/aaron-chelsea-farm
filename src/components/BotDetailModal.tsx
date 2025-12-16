'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { GameState } from '@/types/game';

interface BotDetailModalProps {
  bot: any;
  botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'hunter' | 'fertilizer';
  gameState: GameState;
  onClose: () => void;
  onRename: (newName: string) => void;
  onSupercharge?: () => void;
  onHopperUpgrade?: () => void;
  onConfigure?: () => void;
}

// Unified gray color scheme for all bot types
const BOT_COLORS = {
  water: { primary: 'gray', secondary: 'gray' },
  harvest: { primary: 'gray', secondary: 'gray' },
  seed: { primary: 'gray', secondary: 'gray' },
  transport: { primary: 'gray', secondary: 'gray' },
  demolish: { primary: 'gray', secondary: 'gray' },
  hunter: { primary: 'gray', secondary: 'gray' },
  fertilizer: { primary: 'gray', secondary: 'gray' },
};

const BOT_IMAGES = {
  water: '/water bot.png',
  harvest: '/harvest bot.png',
  seed: '/seed-bot.png',
  transport: '/transport-bot.png',
  demolish: '/demolish-bot.png',
  hunter: '/fishing-bot.png',
  fertilizer: '/fertilizer-bot.png',
};

const BOT_LABELS = {
  water: 'Water Bot',
  harvest: 'Harvest Bot',
  seed: 'Seed Bot',
  transport: 'Transport Bot',
  demolish: 'Demolish Bot',
  hunter: 'Hunter Bot',
  fertilizer: 'Fertilizer Bot',
};

export default function BotDetailModal({
  bot,
  botType,
  gameState,
  onClose,
  onRename,
  onSupercharge,
  onHopperUpgrade,
  onConfigure,
}: BotDetailModalProps) {
  const [editingName, setEditingName] = useState(bot.name);
  const colors = BOT_COLORS[botType];
  const image = BOT_IMAGES[botType];
  const label = BOT_LABELS[botType];

  const handleNameChange = (newName: string) => {
    setEditingName(newName);
  };

  const handleSaveName = () => {
    if (editingName.trim() !== bot.name) {
      onRename(editingName.trim());
    }
  };

  // Get bot capabilities
  const isSupercharged = bot.supercharged || false;
  const hasHopperUpgrade = bot.hopperUpgrade || false;

  // Check if required buildings exist
  const hasSuperchargerBuilding = gameState.player.inventory.superchargerPlaced;
  const hasHopperBuilding = gameState.player.inventory.hopperPlaced;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br from-${colors.primary}-900 to-${colors.primary}-950 border-4 border-${colors.primary}-500 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-${colors.primary}-600 to-${colors.primary}-700 p-4 border-b-4 border-${colors.primary}-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 bg-${colors.primary}-800 rounded-full border-4 border-${colors.primary}-400 overflow-hidden flex items-center justify-center p-2`}>
                <NextImage
                  src={image}
                  alt={label}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-sm text-white/70">{label}</div>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleSaveName}
                  className={`text-2xl font-bold text-white bg-${colors.primary}-800/50 border-2 border-${colors.primary}-600 rounded px-2 py-1 focus:outline-none focus:border-${colors.primary}-400`}
                  maxLength={20}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-4xl font-bold transition-colors leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Stats & Status */}
            <div className="space-y-4">
              {/* Current Status */}
              <div className={`bg-gradient-to-br from-${colors.primary}-800/50 to-${colors.primary}-900/30 border-2 border-${colors.primary}-500/60 rounded-xl p-4`}>
                <div className={`text-sm text-${colors.primary}-300 font-bold mb-2`}>Current Status</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">Status:</span>
                    <span className="text-sm text-white font-semibold">{bot.status}</span>
                  </div>
                  {bot.inventory && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Inventory:</span>
                      <span className="text-sm text-white font-semibold">
                        {bot.inventory.length}/{bot.inventoryCapacity || bot.waterCapacity || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">Position:</span>
                    <span className="text-sm text-white font-semibold">
                      ({bot.x}, {bot.y})
                    </span>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className={`bg-gradient-to-br from-${colors.primary}-800/50 to-${colors.primary}-900/30 border-2 border-${colors.primary}-500/60 rounded-xl p-4`}>
                <div className={`text-sm text-${colors.primary}-300 font-bold mb-3`}>Capabilities</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSupercharged ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>
                      ⚡
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Supercharged</div>
                      <div className="text-xs text-white/60">
                        {isSupercharged ? '2x speed boost active' : 'Not supercharged'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${hasHopperUpgrade ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                      📦
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Hopper Upgrade</div>
                      <div className="text-xs text-white/60">
                        {hasHopperUpgrade ? 'Increased capacity' : 'Standard capacity'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Stats */}
              <div className={`bg-gradient-to-br from-${colors.primary}-800/50 to-${colors.primary}-900/30 border-2 border-${colors.primary}-500/60 rounded-xl p-4`}>
                <div className={`text-sm text-${colors.primary}-300 font-bold mb-2`}>Statistics</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Total Actions:</span>
                    <span className="text-white font-semibold">{bot.totalActions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Tiles Worked:</span>
                    <span className="text-white font-semibold">{bot.tilesWorked || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Upgrades & Actions */}
            <div className="space-y-4">
              {/* Available Upgrades */}
              <div className={`bg-gradient-to-br from-${colors.primary}-800/50 to-${colors.primary}-900/30 border-2 border-${colors.primary}-500/60 rounded-xl p-4`}>
                <div className={`text-sm text-${colors.primary}-300 font-bold mb-3`}>Available Upgrades</div>
                <div className="space-y-2">
                  {!isSupercharged && onSupercharge && (
                    <button
                      onClick={hasSuperchargerBuilding ? onSupercharge : undefined}
                      disabled={!hasSuperchargerBuilding}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                        hasSuperchargerBuilding
                          ? 'bg-yellow-600/30 hover:bg-yellow-600/50 border-yellow-500 cursor-pointer'
                          : 'bg-gray-600/20 border-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-2xl">⚡</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-white">Supercharge</div>
                        <div className="text-xs text-yellow-200">
                          {hasSuperchargerBuilding ? 'Double speed boost' : 'Build Supercharger first'}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-yellow-300">$500</div>
                    </button>
                  )}
                  {!hasHopperUpgrade && onHopperUpgrade && (
                    <button
                      onClick={hasHopperBuilding ? onHopperUpgrade : undefined}
                      disabled={!hasHopperBuilding}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                        hasHopperBuilding
                          ? 'bg-blue-600/30 hover:bg-blue-600/50 border-blue-500 cursor-pointer'
                          : 'bg-gray-600/20 border-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-2xl">📦</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-white">Hopper Upgrade</div>
                        <div className="text-xs text-blue-200">
                          {hasHopperBuilding ? 'Increase capacity' : 'Build Hopper first'}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-300">$400</div>
                    </button>
                  )}
                  {isSupercharged && hasHopperUpgrade && (
                    <div className="text-center text-sm text-white/60 py-4">
                      All upgrades installed! 🎉
                    </div>
                  )}
                </div>
              </div>

              {/* Configuration */}
              {onConfigure && (
                <div className={`bg-gradient-to-br from-${colors.primary}-800/50 to-${colors.primary}-900/30 border-2 border-${colors.primary}-500/60 rounded-xl p-4`}>
                  <div className={`text-sm text-${colors.primary}-300 font-bold mb-3`}>Configuration</div>
                  <button
                    onClick={onConfigure}
                    className={`w-full p-3 bg-${colors.primary}-600/30 hover:bg-${colors.primary}-600/50 border-2 border-${colors.primary}-500 rounded-lg transition-all font-bold text-white`}
                  >
                    ⚙️ Configure Bot
                  </button>
                </div>
              )}

              {/* Activity History */}
              <div className={`bg-gradient-to-br from-${colors.primary}-800/50 to-${colors.primary}-900/30 border-2 border-${colors.primary}-500/60 rounded-xl p-4`}>
                <div className={`text-sm text-${colors.primary}-300 font-bold mb-2`}>Recent Activity</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• Bot created and deployed</div>
                  <div>• Completed {bot.totalActions || 0} actions</div>
                  <div>• Currently {bot.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
