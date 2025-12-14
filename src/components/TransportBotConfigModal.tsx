'use client';

import { useState } from 'react';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO } from '@/lib/cropConstants';
import { getMarketPrice } from '@/lib/marketEconomy';

interface CropSellConfig {
  crop: Exclude<CropType, null>;
  enabled: boolean;
  minPriceMultiplier: number;
  waitForHighDemand: boolean;
  waitForEpic: boolean;
}

interface TransportBotConfig {
  mode: 'simple' | 'advanced';
  globalMinPriceMultiplier: number;
  globalWaitForHighDemand: boolean;
  globalWaitForEpic: boolean;
  perCropSettings: CropSellConfig[];
  sellWhenFull: boolean;
}

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

function createDefaultConfig(): TransportBotConfig {
  return {
    mode: 'simple',
    globalMinPriceMultiplier: 1.2,
    globalWaitForHighDemand: false,
    globalWaitForEpic: false,
    perCropSettings: CROP_LIST.map(crop => ({
      crop,
      enabled: true,
      minPriceMultiplier: 1.2,
      waitForHighDemand: false,
      waitForEpic: false,
    })),
    sellWhenFull: true,
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
                Control when this bot sells crops based on market conditions
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setConfig({ ...config, mode: 'simple' })}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                config.mode === 'simple'
                  ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>⚡ Simple Mode</span>
              </div>
              <div className="text-xs text-white/70 mt-1">One setting for all crops</div>
            </button>
            <button
              onClick={() => setConfig({ ...config, mode: 'advanced' })}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                config.mode === 'advanced'
                  ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>🎯 Advanced Mode</span>
              </div>
              <div className="text-xs text-white/70 mt-1">Configure each crop individually</div>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {config.mode === 'simple' ? (
            /* Simple Mode - Global Settings */
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-emerald-400">Global Sell Rules</h3>

                {/* Price Multiplier */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Minimum Price Multiplier: {config.globalMinPriceMultiplier.toFixed(1)}x
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Only sell when market price is at least this multiple of base price
                    <br />
                    Example: 1.2x means sell when price is 120% or more of base price
                  </p>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={config.globalMinPriceMultiplier}
                    onChange={(e) =>
                      setConfig({ ...config, globalMinPriceMultiplier: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1.0x (Base Price)</span>
                    <span>2.0x (Double Base)</span>
                  </div>
                </div>

                {/* Wait for High Demand */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.globalWaitForHighDemand}
                      onChange={(e) =>
                        setConfig({ ...config, globalWaitForHighDemand: e.target.checked })
                      }
                      className="w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">Wait for High Demand 🔥</div>
                      <div className="text-xs text-slate-400">Only sell crops marked as high demand</div>
                    </div>
                  </label>
                </div>

                {/* Wait for Epic */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.globalWaitForEpic}
                      onChange={(e) => setConfig({ ...config, globalWaitForEpic: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">Wait for Epic Pricing ⚡</div>
                      <div className="text-xs text-slate-400">Only sell crops with 5x epic pricing</div>
                    </div>
                  </label>
                </div>

                {/* Sell When Full */}
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.sellWhenFull}
                      onChange={(e) => setConfig({ ...config, sellWhenFull: e.target.checked })}
                      className="w-5 h-5 text-yellow-600 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
                    />
                    <div>
                      <div className="font-semibold text-yellow-300">Override: Sell When Inventory Full</div>
                      <div className="text-xs text-yellow-400/80">
                        Ignore all rules and sell immediately when inventory reaches capacity
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview: What gets sold now? */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Current Market Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CROP_LIST.map((crop) => {
                    const basePrice = CROP_INFO[crop].sellPrice;
                    const marketPrice = getMarketPrice(crop, gameState);
                    const multiplier = marketPrice / basePrice;
                    const isHighDemand = gameState.market?.highDemandCrops.includes(crop) || false;
                    const isEpic = gameState.market?.epicPriceCrop === crop;

                    const wouldSell =
                      multiplier >= config.globalMinPriceMultiplier &&
                      (!config.globalWaitForHighDemand || isHighDemand) &&
                      (!config.globalWaitForEpic || isEpic);

                    return (
                      <div
                        key={crop}
                        className={`rounded-lg p-3 border-2 transition-all ${
                          wouldSell
                            ? 'bg-emerald-900/30 border-emerald-500/50'
                            : 'bg-slate-700/30 border-slate-600/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{CROP_INFO[crop].icon}</span>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white">{CROP_INFO[crop].name}</div>
                            <div className="text-xs" style={{ color: CROP_COLORS[crop] }}>
                              ${marketPrice} ({multiplier.toFixed(1)}x)
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold">
                          {wouldSell ? (
                            <span className="text-emerald-400">✓ Will Sell</span>
                          ) : (
                            <span className="text-slate-500">✗ Will Hold</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Advanced Mode - Per-Crop Settings */
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">🎯 Advanced Mode</h3>
                <p className="text-xs text-slate-400">
                  Configure sell rules individually for each crop type. Great for specializing in specific crops!
                </p>
              </div>

              {CROP_LIST.map((crop) => {
                const cropConfig = config.perCropSettings.find((c) => c.crop === crop);
                if (!cropConfig) return null;

                const basePrice = CROP_INFO[crop].sellPrice;
                const marketPrice = getMarketPrice(crop, gameState);
                const multiplier = marketPrice / basePrice;
                const isHighDemand = gameState.market?.highDemandCrops.includes(crop) || false;
                const isEpic = gameState.market?.epicPriceCrop === crop;

                const wouldSell =
                  cropConfig.enabled &&
                  multiplier >= cropConfig.minPriceMultiplier &&
                  (!cropConfig.waitForHighDemand || isHighDemand) &&
                  (!cropConfig.waitForEpic || isEpic);

                return (
                  <div
                    key={crop}
                    className={`bg-slate-800/50 rounded-xl border-2 p-4 transition-all ${
                      cropConfig.enabled
                        ? wouldSell
                          ? 'border-emerald-500/50'
                          : 'border-slate-700'
                        : 'border-slate-700/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{CROP_INFO[crop].icon}</span>
                        <div>
                          <div className="font-semibold text-white">{CROP_INFO[crop].name}</div>
                          <div className="text-xs" style={{ color: CROP_COLORS[crop] }}>
                            Market: ${marketPrice} ({multiplier.toFixed(1)}x base)
                            {isHighDemand && <span className="ml-2">🔥</span>}
                            {isEpic && <span className="ml-2">⚡</span>}
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cropConfig.enabled}
                          onChange={(e) => {
                            const newSettings = config.perCropSettings.map((c) =>
                              c.crop === crop ? { ...c, enabled: e.target.checked } : c
                            );
                            setConfig({ ...config, perCropSettings: newSettings });
                          }}
                          className="w-5 h-5 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-semibold">
                          {cropConfig.enabled ? (
                            <span className="text-emerald-400">Enabled</span>
                          ) : (
                            <span className="text-slate-500">Disabled</span>
                          )}
                        </span>
                      </label>
                    </div>

                    {cropConfig.enabled && (
                      <div className="space-y-3 pl-12">
                        {/* Price Multiplier */}
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-300">
                            Min Price: {cropConfig.minPriceMultiplier.toFixed(1)}x
                          </label>
                          <input
                            type="range"
                            min="1.0"
                            max="2.0"
                            step="0.1"
                            value={cropConfig.minPriceMultiplier}
                            onChange={(e) => {
                              const newSettings = config.perCropSettings.map((c) =>
                                c.crop === crop
                                  ? { ...c, minPriceMultiplier: parseFloat(e.target.value) }
                                  : c
                              );
                              setConfig({ ...config, perCropSettings: newSettings });
                            }}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        {/* Wait for High Demand */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cropConfig.waitForHighDemand}
                            onChange={(e) => {
                              const newSettings = config.perCropSettings.map((c) =>
                                c.crop === crop ? { ...c, waitForHighDemand: e.target.checked } : c
                              );
                              setConfig({ ...config, perCropSettings: newSettings });
                            }}
                            className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-xs text-slate-300">Wait for High Demand 🔥</span>
                        </label>

                        {/* Wait for Epic */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cropConfig.waitForEpic}
                            onChange={(e) => {
                              const newSettings = config.perCropSettings.map((c) =>
                                c.crop === crop ? { ...c, waitForEpic: e.target.checked } : c
                              );
                              setConfig({ ...config, perCropSettings: newSettings });
                            }}
                            className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-xs text-slate-300">Wait for Epic Pricing ⚡</span>
                        </label>

                        {/* Status */}
                        <div className="text-xs font-semibold pt-1">
                          {wouldSell ? (
                            <span className="text-emerald-400">✓ Would sell at current market price</span>
                          ) : (
                            <span className="text-slate-500">
                              ✗ Waiting for better conditions
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Sell When Full Override */}
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sellWhenFull}
                    onChange={(e) => setConfig({ ...config, sellWhenFull: e.target.checked })}
                    className="w-5 h-5 text-yellow-600 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
                  />
                  <div>
                    <div className="font-semibold text-yellow-300">Override: Sell When Inventory Full</div>
                    <div className="text-xs text-yellow-400/80">
                      Ignore all rules and sell immediately when inventory reaches capacity
                    </div>
                  </div>
                </label>
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
