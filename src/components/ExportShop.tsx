'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO } from '@/lib/gameEngine';
import { getMarketPrice, getNextSeasonForecast } from '@/lib/marketEconomy';

interface ExportShopProps {
  gameState: GameState;
  onClose: () => void;
  onRelocate?: () => void;
}

const ALL_CROPS: Array<Exclude<CropType, null>> = [
  'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon', 'peppers',
  'grapes', 'oranges', 'avocado', 'rice', 'corn'
];

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

const SEASON_EMOJIS = {
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
  winter: '❄️',
};

const SEASON_IMAGES: Record<string, string> = {
  spring: '/spring.png',
  summer: '/summer.png',
  fall: '/fall.png',
  winter: '/winter.png',
};

function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function getSeasonTimeRemaining(gameTime: number): number {
  const SEASON_DURATION = 7 * 60 * 1000; // 7 minutes
  const seasonProgress = gameTime % SEASON_DURATION;
  return SEASON_DURATION - seasonProgress;
}

export default function ExportShop({ gameState, onClose, onRelocate }: ExportShopProps) {
  const [selectedCrop, setSelectedCrop] = useState<Exclude<CropType, null> | null>(null);

  // Get current market prices
  const marketPrices: Record<Exclude<CropType, null>, number> = useMemo(() => {
    const prices: any = {};
    ALL_CROPS.forEach(crop => {
      prices[crop] = gameState.market
        ? getMarketPrice(crop, gameState)
        : CROP_INFO[crop].sellPrice;
    });
    return prices;
  }, [gameState.market]);

  // Calculate price deltas (compare current to base price)
  const priceDeltas: Record<Exclude<CropType, null>, number> = useMemo(() => {
    const deltas: any = {};
    ALL_CROPS.forEach(crop => {
      const currentPrice = marketPrices[crop];
      const basePrice = CROP_INFO[crop].sellPrice;
      const percentChange = ((currentPrice - basePrice) / basePrice) * 100;
      deltas[crop] = percentChange;
    });
    return deltas;
  }, [marketPrices]);

  // Get next season forecast
  const nextSeasonForecast = useMemo(() => {
    return getNextSeasonForecast(gameState.gameTime);
  }, [gameState.gameTime]);

  // Get price history for a crop (last 20 data points)
  const getPriceHistory = (crop: Exclude<CropType, null>) => {
    if (!gameState.market?.priceHistory) return [];
    return gameState.market.priceHistory
      .slice(-20)
      .map(snapshot => ({
        day: snapshot.day,
        price: snapshot.prices[crop]
      }));
  };

  // Get price forecast for a crop (next 10 cycles)
  const getPriceForecast = (crop: Exclude<CropType, null>) => {
    if (!gameState.market?.priceForecast) return [];
    return gameState.market.priceForecast
      .slice(0, 10)
      .map(snapshot => ({
        day: snapshot.day,
        price: snapshot.prices[crop]
      }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-6 rounded-xl max-w-7xl w-full h-[95vh] border-2 border-slate-600 flex flex-col">
        {/* Season Banner with Background Images - 75/25 Split */}
        <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-gray-600/50 shadow-2xl h-48">
          {/* Background Images */}
          <div className="absolute inset-0 flex">
            {/* Current Season - 75% */}
            <div className="w-[75%] relative">
              <img
                src={SEASON_IMAGES[gameState.market?.currentSeason || 'spring']}
                alt={gameState.market?.currentSeason || 'spring'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-transparent" />
            </div>

            {/* Next Season - 25% */}
            <div className="w-[25%] relative">
              <img
                src={SEASON_IMAGES[nextSeasonForecast.season]}
                alt={nextSeasonForecast.season}
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="absolute left-[75%] top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400/50 via-cyan-300/50 to-cyan-400/50 shadow-lg shadow-cyan-500/30" />

          {/* Content Overlay */}
          <div className="relative h-full flex">
            {/* Current Season Info - Left 75% */}
            <div className="w-[75%] p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs text-cyan-300 font-bold mb-1">CURRENT SEASON</div>
                <div className="text-4xl font-bold text-white capitalize drop-shadow-lg mb-1">
                  {gameState.market?.currentSeason || 'Spring'}
                </div>
                <div className="text-sm text-cyan-200 font-mono mb-2">
                  {formatTimeRemaining(getSeasonTimeRemaining(gameState.gameTime))} remaining
                </div>
              </div>

              {/* Bottom Info */}
              <div className="flex gap-4 flex-wrap">
                {/* High Demand Crops */}
                {gameState.market?.highDemandCrops && gameState.market.highDemandCrops.length > 0 && (
                  <div>
                    <div className="text-xs text-yellow-300 font-bold mb-1">🔥 HIGH DEMAND</div>
                    <div className="flex gap-1">
                      {gameState.market.highDemandCrops.map(crop => (
                        <div key={crop} className="bg-black/40 rounded-lg px-2 py-1 border border-yellow-500/50">
                          <span className="text-xl">{CROP_EMOJIS[crop]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Epic Price */}
                {gameState.market?.epicPriceCrop && (
                  <div>
                    <div className="text-xs text-purple-300 font-bold mb-1">⚡ EPIC PRICE</div>
                    <div className="bg-purple-900/60 rounded-lg px-2 py-1 border border-purple-400/50">
                      <span className="text-xl">{CROP_EMOJIS[gameState.market.epicPriceCrop]}</span>
                      <span className="text-xs text-purple-200 ml-1 font-bold">5x</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Season Info - Right 25% */}
            <div className="w-[25%] p-3 flex flex-col items-center justify-center text-center">
              <div className="text-xs text-cyan-300 font-bold mb-2">UP NEXT</div>
              <div className="text-3xl mb-2">{SEASON_EMOJIS[nextSeasonForecast.season]}</div>
              <div className="text-2xl font-bold text-white capitalize drop-shadow-lg mb-1">
                {nextSeasonForecast.season}
              </div>
              <div className="text-xs text-cyan-200 font-mono">
                in {nextSeasonForecast.minutesUntil}m
              </div>

              {/* Upcoming High Demand */}
              <div className="mt-3 w-full">
                <div className="text-xs text-blue-300 font-bold mb-1">📈 DEMAND</div>
                <div className="flex gap-1 justify-center flex-wrap">
                  {nextSeasonForecast.crops.slice(0, 3).map(crop => (
                    <span key={crop} className="text-sm">{CROP_EMOJIS[crop]}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ALL_CROPS.map((crop) => {
              const currentPrice = marketPrices[crop];
              const basePrice = CROP_INFO[crop].sellPrice;
              const delta = priceDeltas[crop];
              const history = getPriceHistory(crop);
              const forecast = getPriceForecast(crop);
              const isEpic = gameState.market?.epicPriceCrop === crop;
              const isHighDemand = gameState.market?.highDemandCrops.includes(crop);
              const isNextSeasonDemand = nextSeasonForecast.crops.includes(crop);

              return (
                <div
                  key={crop}
                  onClick={() => setSelectedCrop(selectedCrop === crop ? null : crop)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isEpic
                      ? 'bg-purple-900/30 border-purple-400 ring-2 ring-purple-400'
                      : isHighDemand
                      ? 'bg-yellow-900/20 border-yellow-500'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  } ${selectedCrop === crop ? 'ring-2 ring-emerald-400' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image src={`/${crop}.png`} alt={crop} width={28} height={28} className="object-contain" />
                      <div>
                        <div className="font-bold text-sm">{CROP_NAMES[crop]}</div>
                        <div className="text-xs text-slate-400">Base: ${basePrice}</div>
                      </div>
                    </div>
                    {isEpic && (
                      <div className="bg-purple-600 px-1.5 py-0.5 rounded text-xs font-bold">⚡</div>
                    )}
                    {!isEpic && isHighDemand && (
                      <div className="bg-yellow-600 px-1.5 py-0.5 rounded text-xs font-bold">🔥</div>
                    )}
                    {!isEpic && !isHighDemand && isNextSeasonDemand && (
                      <div className="bg-blue-600 px-1.5 py-0.5 rounded text-xs font-bold">📅</div>
                    )}
                  </div>

                  {/* Current Price & Delta */}
                  <div className="mb-2">
                    <div className="text-xl font-bold text-emerald-400">${currentPrice}</div>
                    <div className={`text-xs font-semibold ${
                      delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {Math.abs(delta).toFixed(1)}%
                    </div>
                  </div>

                  {/* Mini Combined History + Forecast Chart */}
                  {(history.length > 0 || forecast.length > 0) && (
                    <div className="mb-2">
                      <div className="text-xs text-slate-400 mb-1 flex justify-between">
                        <span>Past ━━</span>
                        <span className="text-yellow-400">Now</span>
                        <span>Future ┉┉</span>
                      </div>
                      <div className="flex items-end gap-0.5 h-12 bg-slate-900/50 rounded p-1">
                        {/* Historical prices (50% - last 10) */}
                        {history.slice(-10).map((point, idx) => {
                          const allPrices = [...history.map(h => h.price), ...forecast.map(f => f.price), currentPrice];
                          const maxPrice = Math.max(...allPrices);
                          const heightPercent = (point.price / maxPrice) * 100;
                          return (
                            <div
                              key={`hist-${idx}`}
                              className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t relative group"
                              style={{ height: `${heightPercent}%`, minHeight: '2px' }}
                              title={`Day ${point.day}: $${point.price}`}
                            />
                          );
                        })}

                        {/* Current price (different color) */}
                        <div
                          className="flex-1 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t relative group shadow-lg shadow-yellow-500/50"
                          style={{ height: `${(currentPrice / Math.max(...[...history.map(h => h.price), ...forecast.map(f => f.price), currentPrice])) * 100}%`, minHeight: '2px' }}
                          title={`Current: $${currentPrice}`}
                        />

                        {/* Forecasted prices (50% - next 10) */}
                        {forecast.slice(0, 10).map((point, idx) => {
                          const allPrices = [...history.map(h => h.price), ...forecast.map(f => f.price), currentPrice];
                          const maxPrice = Math.max(...allPrices);
                          const heightPercent = (point.price / maxPrice) * 100;
                          return (
                            <div
                              key={`forecast-${idx}`}
                              className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t opacity-70 relative group"
                              style={{ height: `${heightPercent}%`, minHeight: '2px' }}
                              title={`Forecast Day ${point.day}: $${point.price}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Trend indicator */}
                  <div className="text-xs">
                    <span className={`font-semibold ${
                      delta > 10 ? 'text-green-400' : delta < -10 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {delta > 10 ? '📈 Rising' : delta < -10 ? '📉 Falling' : '➡️ Stable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed View for Selected Crop */}
          {selectedCrop && (
            <div className="mt-4 bg-slate-800 border-2 border-emerald-500 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Image src={`/${selectedCrop}.png`} alt={selectedCrop} width={48} height={48} className="object-contain" />
                  <div>
                    <h3 className="text-2xl font-bold">{CROP_NAMES[selectedCrop]}</h3>
                    <p className="text-slate-400">Detailed Market Analysis</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCrop(null);
                  }}
                  className="text-xl hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Large Combined Chart */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-slate-300 mb-2 flex items-center justify-between">
                  <span className="font-bold">Price History & 10-Cycle Forecast</span>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded" />
                      <span>Historical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded opacity-70" />
                      <span>Forecast</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-48 bg-slate-950/50 rounded p-3">
                  {/* Historical prices */}
                  {getPriceHistory(selectedCrop).map((point, idx) => {
                    const history = getPriceHistory(selectedCrop);
                    const forecast = getPriceForecast(selectedCrop);
                    const allPrices = [...history.map(h => h.price), ...forecast.map(f => f.price)];
                    const maxPrice = Math.max(...allPrices);
                    const minPrice = Math.min(...allPrices);
                    const range = maxPrice - minPrice;
                    const heightPercent = range > 0 ? ((point.price - minPrice) / range) * 100 : 50;

                    return (
                      <div
                        key={`detail-hist-${idx}`}
                        className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-300 rounded-t relative group"
                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Day {point.day}: ${point.price}
                        </div>
                      </div>
                    );
                  })}

                  {/* Divider */}
                  {getPriceForecast(selectedCrop).length > 0 && (
                    <div className="w-1 bg-blue-400 self-stretch opacity-50 mx-0.5" />
                  )}

                  {/* Forecasted prices */}
                  {getPriceForecast(selectedCrop).map((point, idx) => {
                    const history = getPriceHistory(selectedCrop);
                    const forecast = getPriceForecast(selectedCrop);
                    const allPrices = [...history.map(h => h.price), ...forecast.map(f => f.price)];
                    const maxPrice = Math.max(...allPrices);
                    const minPrice = Math.min(...allPrices);
                    const range = maxPrice - minPrice;
                    const heightPercent = range > 0 ? ((point.price - minPrice) / range) * 100 : 50;

                    return (
                      <div
                        key={`detail-forecast-${idx}`}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-blue-300 rounded-t opacity-70 relative group"
                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Forecast: ${point.price}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-slate-400 text-center">
                  Each bar represents a 10-minute market cycle
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Current Price</div>
                  <div className="text-2xl font-bold text-emerald-400">${marketPrices[selectedCrop]}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Base Price</div>
                  <div className="text-2xl font-bold text-slate-300">${CROP_INFO[selectedCrop].sellPrice}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Price Change</div>
                  <div className={`text-2xl font-bold ${
                    priceDeltas[selectedCrop] > 0 ? 'text-green-400' : priceDeltas[selectedCrop] < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {priceDeltas[selectedCrop] > 0 ? '+' : ''}{priceDeltas[selectedCrop].toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Avg Forecast</div>
                  <div className="text-2xl font-bold text-blue-400">
                    ${getPriceForecast(selectedCrop).length > 0
                      ? Math.round(getPriceForecast(selectedCrop).reduce((sum, p) => sum + p.price, 0) / getPriceForecast(selectedCrop).length)
                      : marketPrices[selectedCrop]
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 pt-4 flex gap-3 justify-between">
          {onRelocate && (
            <button
              onClick={() => {
                onRelocate();
                onClose();
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              📍 Move Building
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
