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
    sellMode: 'market-based',
    perCropSettings: CROP_LIST.map(crop => ({
      crop,
      maxInventory: 0, // 0 = no limit
      sellOnHighDemand: true,
      sellOnEpic: true,
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

  const handleSave = () => {
    onSave(config);
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
            /* Market-Based Mode - Per-Crop Configuration */
            <div className="space-y-4">
              <div className="bg-cyan-900/20 border border-cyan-600/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">📈 Market-Based Selling</h3>
                <p className="text-xs text-slate-400 mb-2">
                  For each crop, you can configure:
                </p>
                <ul className="text-xs text-slate-300 space-y-1 ml-4">
                  <li><strong>🔥 Sell on High Demand:</strong> Auto-sell when crop enters high demand season</li>
                  <li><strong>⚡ Sell on Epic:</strong> Auto-sell during epic seasonal events (3x price)</li>
                  <li><strong>📦 Max Inventory:</strong> Sell when warehouse has this many (prevents overflow)</li>
                </ul>
                <p className="text-xs text-yellow-400 mt-3">
                  💡 Tip: Enable high demand/epic tags to auto-sell when markets peak. Use max inventory to prevent warehouse from filling up.
                </p>
              </div>

              {CROP_LIST.map((crop) => {
                const cropConfig = config.perCropSettings.find((c) => c.crop === crop);
                if (!cropConfig) return null;

                const basePrice = CROP_INFO[crop].sellPrice;
                const marketPrice = getMarketPrice(crop, gameState);
                const isHighDemand = gameState.market?.highDemandCrops.includes(crop) || false;
                const isRandomEpic = gameState.market?.epicPriceCrop === crop;
                const isSeasonalEpic = currentEpicEvent && currentEpicEvent.epicCrops.includes(crop);
                const isEpic = isRandomEpic || isSeasonalEpic;

                // Get current warehouse inventory for this crop
                const warehouseInventory = gameState.warehouse.filter(item => item.crop === crop).length;

                const wouldSellNow =
                  (cropConfig.sellOnHighDemand && isHighDemand) ||
                  (cropConfig.sellOnEpic && isEpic) ||
                  (cropConfig.maxInventory > 0 && warehouseInventory >= cropConfig.maxInventory);

                return (
                  <div
                    key={crop}
                    className={`bg-slate-800/50 rounded-xl border-2 p-4 transition-all ${
                      wouldSellNow ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' : 'border-slate-700'
                    }`}
                  >
                    {/* Crop Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{CROP_ICONS[crop]}</span>
                        <div>
                          <div className="font-semibold text-white">{CROP_NAMES[crop]}</div>
                          <div className="text-xs flex items-center gap-2">
                            <span style={{ color: CROP_COLORS[crop] }}>
                              ${marketPrice}
                            </span>
                            {isHighDemand && <span className="text-yellow-400">🔥</span>}
                            {isSeasonalEpic && <span className="text-purple-400">⚡ 3X</span>}
                            {isRandomEpic && <span className="text-purple-400">⚡ 5X</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Warehouse</div>
                        <div className="text-lg font-bold text-cyan-400">{warehouseInventory}</div>
                      </div>
                    </div>

                    {/* Configuration Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      {/* Sell on High Demand */}
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-700/30 rounded-lg p-2">
                        <input
                          type="checkbox"
                          checked={cropConfig.sellOnHighDemand}
                          onChange={(e) => {
                            const newSettings = config.perCropSettings.map((c) =>
                              c.crop === crop ? { ...c, sellOnHighDemand: e.target.checked } : c
                            );
                            setConfig({ ...config, perCropSettings: newSettings });
                          }}
                          className="w-4 h-4 text-yellow-600 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-yellow-400">🔥 High Demand</div>
                          <div className="text-[10px] text-slate-400">Auto-sell +75%</div>
                        </div>
                      </label>

                      {/* Sell on Epic */}
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-700/30 rounded-lg p-2">
                        <input
                          type="checkbox"
                          checked={cropConfig.sellOnEpic}
                          onChange={(e) => {
                            const newSettings = config.perCropSettings.map((c) =>
                              c.crop === crop ? { ...c, sellOnEpic: e.target.checked } : c
                            );
                            setConfig({ ...config, perCropSettings: newSettings });
                          }}
                          className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-purple-400">⚡ Epic</div>
                          <div className="text-[10px] text-slate-400">Auto-sell 3x</div>
                        </div>
                      </label>

                      {/* Max Inventory */}
                      <div className="bg-slate-700/30 rounded-lg p-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1">📦 Max Inventory</div>
                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={cropConfig.maxInventory}
                          onChange={(e) => {
                            const newSettings = config.perCropSettings.map((c) =>
                              c.crop === crop ? { ...c, maxInventory: parseInt(e.target.value) || 0 } : c
                            );
                            setConfig({ ...config, perCropSettings: newSettings });
                          }}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="0 = no limit"
                        />
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="text-xs font-semibold pt-2 border-t border-slate-700">
                      {wouldSellNow ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          ✓ Would sell now
                          {cropConfig.sellOnHighDemand && isHighDemand && <span>(High Demand)</span>}
                          {cropConfig.sellOnEpic && isEpic && <span>(Epic)</span>}
                          {cropConfig.maxInventory > 0 && warehouseInventory >= cropConfig.maxInventory && <span>(Inventory Full)</span>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                          Waiting for conditions
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
