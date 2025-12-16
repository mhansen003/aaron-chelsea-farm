'use client';

import { useState } from 'react';
import { GameState, CropType, TransportBotConfig, CropInventoryConfig } from '@/types/game';
import { CROP_INFO } from '@/lib/cropConstants';
import { getMarketPrice, getEpicSeasonalEvent } from '@/lib/marketEconomy';

interface TransportBotConfigModalProps {
  gameState: GameState;
  botName?: string;
  existingConfig?: TransportBotConfig;
  onSave: (config: TransportBotConfig) => void;
  onCancel: () => void;
}

const CROP_LIST: Array<Exclude<CropType, null>> = [
  'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
  'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
];

const CROP_COLORS: Record<Exclude<CropType, null>, string> = {
  carrot: '#ff6b35',
  wheat: '#f4b942',
  tomato: '#e63946',
  pumpkin: '#ff9f1c',
  watermelon: '#06ffa5',
  peppers: '#d62828',
  grapes: '#7209b7',
  oranges: '#fb5607',
  avocado: '#588157',
  rice: '#f1faee',
  corn: '#ffb703',
};

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

function createDefaultConfig(): TransportBotConfig {
  return {
    sellMode: 'market-based', // Default to market-based as requested
    perCropSettings: CROP_LIST.map(crop => ({
      crop,
      maxInventory: 0, // Not used in simplified UI
      sellOnHighDemand: true, // Default ON
      sellOnEpic: true, // Default ON
    })),
  };
}

export default function TransportBotConfigModal({
  gameState,
  botName = 'Transport Bot',
  existingConfig,
  onSave,
  onCancel,
}: TransportBotConfigModalProps) {
  const [config, setConfig] = useState<TransportBotConfig>(
    existingConfig || createDefaultConfig()
  );

  // Extract global settings from first crop (all crops share same settings in simplified UI)
  const globalSellOnHighDemand = config.perCropSettings[0]?.sellOnHighDemand ?? true;
  const globalSellOnEpic = config.perCropSettings[0]?.sellOnEpic ?? true;

  const handleSave = () => {
    onSave(config);
  };

  // Update all crops when global setting changes
  const updateGlobalSetting = (setting: 'sellOnHighDemand' | 'sellOnEpic', value: boolean) => {
    setConfig({
      ...config,
      perCropSettings: config.perCropSettings.map(crop => ({
        ...crop,
        [setting]: value,
      })),
    });
  };

  const currentEpicEvent = getEpicSeasonalEvent(gameState.gameTime);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl max-w-5xl w-full max-h-[95vh] border border-slate-600/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🚛</span>
                {botName} - Sell Configuration
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Control when this bot sells crops from the warehouse
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Sell Mode Radio Buttons */}
          <div className="mt-6 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Sell Strategy</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                <input
                  type="radio"
                  name="sellMode"
                  checked={config.sellMode === 'everything'}
                  onChange={() => setConfig({ ...config, sellMode: 'everything' })}
                  className="mt-0.5 w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white">💰 Sell Everything</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Bot sells all crops immediately - ignore market conditions and maximize sales
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                <input
                  type="radio"
                  name="sellMode"
                  checked={config.sellMode === 'market-based'}
                  onChange={() => setConfig({ ...config, sellMode: 'market-based' })}
                  className="mt-0.5 w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white">📈 Sell Based on Market Conditions</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Wait for high demand, epic events, or inventory limits - strategic selling for max profit
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {config.sellMode === 'everything' ? (
            /* Sell Everything Mode - Simple Display */
            <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Sell Everything Mode Active</h3>
              <p className="text-slate-300">
                This bot will sell all crops immediately regardless of market conditions.
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Great for maximizing cash flow and keeping warehouse inventory low.
              </p>
            </div>
          ) : (
            /* Market-Based Mode - Simplified Global Settings */
            <div className="space-y-6">
              <div className="bg-cyan-900/20 border border-cyan-600/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  📈 Market-Based Selling
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Choose when to automatically sell crops from the warehouse. These settings apply to <strong>all crops</strong>.
                </p>

                {/* Global Checkboxes */}
                <div className="space-y-4">
                  {/* High Demand Checkbox */}
                  <label className="flex items-start gap-4 cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 transition-colors border-2 border-transparent hover:border-yellow-500/30">
                    <input
                      type="checkbox"
                      checked={globalSellOnHighDemand}
                      onChange={(e) => updateGlobalSetting('sellOnHighDemand', e.target.checked)}
                      className="mt-1 w-5 h-5 text-yellow-600 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="text-base font-semibold text-yellow-400 flex items-center gap-2">
                        🔥 Sell on High Demand
                        <span className="text-xs bg-yellow-500/20 px-2 py-0.5 rounded">Recommended</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        Automatically sell crops when they enter high demand (forecast shows price increasing significantly).
                        Great for maximizing profit on trending crops.
                      </p>
                    </div>
                  </label>

                  {/* Epic Checkbox */}
                  <label className="flex items-start gap-4 cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-4 transition-colors border-2 border-transparent hover:border-purple-500/30">
                    <input
                      type="checkbox"
                      checked={globalSellOnEpic}
                      onChange={(e) => updateGlobalSetting('sellOnEpic', e.target.checked)}
                      className="mt-1 w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="text-base font-semibold text-purple-400 flex items-center gap-2">
                        ⚡ Sell on Epic Events
                        <span className="text-xs bg-purple-500/20 px-2 py-0.5 rounded">Recommended</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        Automatically sell crops during epic seasonal events when prices are 3x-5x higher.
                        Perfect for taking advantage of peak market opportunities.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-600/50 rounded-lg">
                  <div className="text-sm font-semibold text-emerald-400 mb-2">💡 Pro Tip</div>
                  <p className="text-xs text-slate-300">
                    Both options are enabled by default for optimal profit. The bot will continuously monitor market conditions
                    and automatically sell when opportunities arise. You can disable either option if you prefer more manual control.
                  </p>
                </div>
              </div>

              {/* Current Market Status Preview */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-3">📊 Current Market Opportunities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {CROP_LIST.map((crop) => {
                    const isHighDemand = gameState.market?.highDemandCrops.includes(crop) || false;
                    const isRandomEpic = gameState.market?.epicPriceCrop === crop;
                    const isSeasonalEpic = currentEpicEvent && currentEpicEvent.epicCrops.includes(crop);
                    const isEpic = isRandomEpic || isSeasonalEpic;
                    const warehouseCount = gameState.warehouse.filter(item => item.crop === crop).length;

                    if (!isHighDemand && !isEpic && warehouseCount === 0) return null;

                    return (
                      <div key={crop} className="bg-slate-700/30 rounded-lg p-2 text-center">
                        <div className="text-2xl mb-1">{CROP_ICONS[crop]}</div>
                        <div className="text-[10px] text-slate-400">{CROP_NAMES[crop]}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {isHighDemand && <span className="text-xs">🔥</span>}
                          {isSeasonalEpic && <span className="text-xs text-purple-400">⚡3X</span>}
                          {isRandomEpic && <span className="text-xs text-purple-400">⚡5X</span>}
                          {warehouseCount > 0 && <span className="text-xs text-cyan-400">({warehouseCount})</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {CROP_LIST.every(crop => {
                  const isHighDemand = gameState.market?.highDemandCrops.includes(crop) || false;
                  const isRandomEpic = gameState.market?.epicPriceCrop === crop;
                  const isSeasonalEpic = currentEpicEvent && currentEpicEvent.epicCrops.includes(crop);
                  const isEpic = isRandomEpic || isSeasonalEpic;
                  const warehouseCount = gameState.warehouse.filter(item => item.crop === crop).length;
                  return !isHighDemand && !isEpic && warehouseCount === 0;
                }) && (
                  <div className="text-center text-slate-500 text-sm py-4">
                    No active market opportunities at the moment
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-700/50 p-4 bg-slate-900/50">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold text-lg transition-all border border-emerald-500/30 shadow-lg hover:shadow-emerald-500/50"
            >
              Save Configuration
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-lg transition-all border border-slate-600/50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
