'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO } from '@/lib/gameEngine';
import { getMarketPrice } from '@/lib/marketEconomy';

interface ExportShopProps {
  gameState: GameState;
  onClose: () => void;
}

type ZoneTab = 'farm' | 'beach' | 'barn' | 'mountain' | 'desert';

const ZONE_INFO: Record<ZoneTab, { name: string; emoji: string; crops: Array<Exclude<CropType, null>> }> = {
  farm: {
    name: 'Farm Zone',
    emoji: '🌾',
    crops: ['carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon', 'peppers']
  },
  beach: {
    name: 'Beach Zone',
    emoji: '🏖️',
    crops: [] // No crops yet
  },
  barn: {
    name: 'Barn Zone',
    emoji: '🏚️',
    crops: ['grapes', 'oranges', 'avocado']
  },
  mountain: {
    name: 'Mountain Zone',
    emoji: '⛰️',
    crops: [] // No crops yet
  },
  desert: {
    name: 'Desert Zone',
    emoji: '🏜️',
    crops: ['rice', 'corn']
  },
};

const CROP_EMOJIS: Record<Exclude<CropType, null>, string> = {
  carrot: '🥕',
  wheat: '🌾',
  tomato: '🍅',
  pumpkin: '🎃',
  watermelon: '🍉',
  peppers: '🌶️',
  grapes: '🍇',
  oranges: '🍊',
  avocado: '🥑',
  rice: '🍚',
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

export default function ExportShop({ gameState, onClose }: ExportShopProps) {
  const [activeZone, setActiveZone] = useState<ZoneTab>('farm');

  // Get current market prices
  const marketPrices: Record<Exclude<CropType, null>, number> = useMemo(() => {
    const crops: Array<Exclude<CropType, null>> = [
      'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
      'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
    ];

    const prices: any = {};
    crops.forEach(crop => {
      prices[crop] = gameState.market
        ? getMarketPrice(crop, gameState)
        : CROP_INFO[crop].sellPrice;
    });

    return prices;
  }, [gameState.market]);

  // Calculate price deltas (compare current to base price)
  const priceDeltas: Record<Exclude<CropType, null>, number> = useMemo(() => {
    const crops: Array<Exclude<CropType, null>> = [
      'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
      'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
    ];

    const deltas: any = {};
    crops.forEach(crop => {
      const currentPrice = marketPrices[crop];
      const basePrice = CROP_INFO[crop].sellPrice;
      const percentChange = ((currentPrice - basePrice) / basePrice) * 100;
      deltas[crop] = percentChange;
    });

    return deltas;
  }, [marketPrices]);

  // Get price history for a crop (last 10 data points)
  const getPriceHistory = (crop: Exclude<CropType, null>) => {
    if (!gameState.market?.priceHistory) return [];

    return gameState.market.priceHistory
      .slice(-10)
      .map(snapshot => ({
        day: snapshot.day,
        price: snapshot.prices[crop]
      }));
  };

  const currentZoneCrops = ZONE_INFO[activeZone].crops;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-6 rounded-xl max-w-6xl w-full max-h-[95vh] border-2 border-slate-600 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <span>📊</span>
            Market Data Center
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Season & Market Info */}
        <div className="mb-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {gameState.market?.currentSeason === 'spring' && '🌸'}
                {gameState.market?.currentSeason === 'summer' && '☀️'}
                {gameState.market?.currentSeason === 'fall' && '🍂'}
                {gameState.market?.currentSeason === 'winter' && '❄️'}
              </span>
              <div>
                <div className="font-bold capitalize">{gameState.market?.currentSeason || 'Spring'} Season</div>
                <div className="text-xs text-slate-400">Day {gameState.currentDay}</div>
              </div>
            </div>
            {gameState.market?.epicPriceCrop && (
              <div className="bg-purple-900/50 px-3 py-1.5 rounded-lg border border-purple-400 flex items-center gap-2">
                <span className="text-purple-300 font-bold">⚡ EPIC PRICES!</span>
                <span>{CROP_EMOJIS[gameState.market.epicPriceCrop]} {CROP_NAMES[gameState.market.epicPriceCrop]} (5x)</span>
              </div>
            )}
          </div>
        </div>

        {/* Zone Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(Object.keys(ZONE_INFO) as ZoneTab[]).map((zone) => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                activeZone === zone
                  ? 'bg-emerald-600 ring-2 ring-emerald-400'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span>{ZONE_INFO[zone].emoji}</span>
              <span>{ZONE_INFO[zone].name}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto mb-4">
          {currentZoneCrops.length === 0 ? (
            <div className="text-center text-slate-400 my-8 text-lg">
              <div className="text-5xl mb-4">{ZONE_INFO[activeZone].emoji}</div>
              <div>No crops available in {ZONE_INFO[activeZone].name} yet.</div>
              <div className="text-sm mt-2">Unlock this zone to access new crops!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentZoneCrops.map((crop) => {
                const currentPrice = marketPrices[crop];
                const basePrice = CROP_INFO[crop].sellPrice;
                const delta = priceDeltas[crop];
                const history = getPriceHistory(crop);
                const isEpic = gameState.market?.epicPriceCrop === crop;
                const isHighDemand = gameState.market?.highDemandCrops.includes(crop);

                return (
                  <div
                    key={crop}
                    className={`p-4 rounded-lg border-2 ${
                      isEpic
                        ? 'bg-purple-900/30 border-purple-400 ring-2 ring-purple-400'
                        : isHighDemand
                        ? 'bg-yellow-900/20 border-yellow-500'
                        : 'bg-slate-800/50 border-slate-600'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Image src={`/${crop}.png`} alt={crop} width={32} height={32} className="object-contain" />
                        <div>
                          <div className="font-bold">{CROP_NAMES[crop]}</div>
                          <div className="text-xs text-slate-400">Base: ${basePrice}</div>
                        </div>
                      </div>
                      {isEpic && (
                        <div className="bg-purple-600 px-2 py-1 rounded text-xs font-bold">⚡ EPIC</div>
                      )}
                      {!isEpic && isHighDemand && (
                        <div className="bg-yellow-600 px-2 py-1 rounded text-xs font-bold">🔥 HOT</div>
                      )}
                    </div>

                    {/* Current Price & Delta */}
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-emerald-400">${currentPrice}</div>
                      <div className={`text-sm font-semibold ${
                        delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {Math.abs(delta).toFixed(1)}%
                        {delta > 0 ? ' above' : delta < 0 ? ' below' : ' at'} base
                      </div>
                    </div>

                    {/* Mini Price Chart */}
                    {history.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-400 mb-1">Price History (Last {history.length} days)</div>
                        <div className="flex items-end gap-1 h-16 bg-slate-900/50 rounded p-2">
                          {history.map((point, idx) => {
                            const maxPrice = Math.max(...history.map(h => h.price));
                            const heightPercent = (point.price / maxPrice) * 100;
                            return (
                              <div
                                key={idx}
                                className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t relative group"
                                style={{ height: `${heightPercent}%` }}
                                title={`Day ${point.day}: $${point.price}`}
                              >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Day {point.day}: ${point.price}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Market Indicators */}
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Trend:</span>
                        <span className={`font-semibold ${
                          delta > 10 ? 'text-green-400' : delta < -10 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {delta > 10 ? '📈 Rising' : delta < -10 ? '📉 Falling' : '➡️ Stable'}
                        </span>
                      </div>
                      {isHighDemand && (
                        <div className="text-yellow-400">🔥 High demand this season!</div>
                      )}
                      {isEpic && (
                        <div className="text-purple-400">⚡ Epic event: 5x multiplier!</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-400">
              💡 Tip: Watch for 🔥 High Demand and ⚡ Epic events to maximize profits!
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-lg transition-colors"
          >
            Close Market Data
          </button>
        </div>
      </div>
    </div>
  );
}
