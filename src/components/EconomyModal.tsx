'use client';

import { useState, useRef, useEffect } from 'react';
import { GameState, CropType } from '@/types/game';
import { getMarketPrice } from '@/lib/marketEconomy';

interface EconomyModalProps {
  gameState: GameState;
  onClose: () => void;
}

type ZoneTab = 'farm' | 'beach' | 'barn' | 'mountain' | 'desert';

const ZONE_INFO: Record<ZoneTab, { name: string; emoji: string; zoneKeys: string[] }> = {
  farm: { name: 'Farm Zone', emoji: '🌾', zoneKeys: ['0,0'] },
  beach: { name: 'Beach Zone', emoji: '🏖️', zoneKeys: ['1,0', '-1,0'] },
  barn: { name: 'Barn Zone', emoji: '🏚️', zoneKeys: ['0,1', '0,-1'] },
  mountain: { name: 'Mountain Zone', emoji: '⛰️', zoneKeys: ['1,1', '-1,-1'] },
  desert: { name: 'Desert Zone', emoji: '🏜️', zoneKeys: ['2,0', '-2,0'] },
};

const CROP_LIST: Array<Exclude<CropType, null>> = [
  'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
  'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
];

const CROP_INFO: Record<Exclude<CropType, null>, { name: string; emoji: string }> = {
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

interface MiniChartProps {
  crop: Exclude<CropType, null>;
  gameState: GameState;
  color: string;
}

function MiniChart({ crop, gameState, color }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState.market) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const market = gameState.market;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Combine history and forecast
    const allData = [...market.priceHistory, ...market.priceForecast];
    if (allData.length < 2) return;

    // Get price range for this crop
    const prices = allData.map(snapshot => snapshot.prices[crop]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const historyLength = market.priceHistory.length;

    // Draw historical line (solid)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();

    market.priceHistory.forEach((snapshot, index) => {
      const x = (index / (allData.length - 1)) * width;
      const price = snapshot.prices[crop];
      const y = height - ((price - minPrice) / priceRange) * (height - 10) - 5;

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw forecast line (dashed)
    if (market.priceForecast.length > 0) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      market.priceForecast.forEach((snapshot, forecastIndex) => {
        const index = historyLength + forecastIndex;
        const x = (index / (allData.length - 1)) * width;
        const price = snapshot.prices[crop];
        const y = height - ((price - minPrice) / priceRange) * (height - 10) - 5;

        if (forecastIndex === 0) {
          // Connect to last historical point
          const lastPrice = market.priceHistory[historyLength - 1].prices[crop];
          const lastX = ((historyLength - 1) / (allData.length - 1)) * width;
          const lastY = height - ((lastPrice - minPrice) / priceRange) * (height - 10) - 5;
          ctx.moveTo(lastX, lastY);
        }
        ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);
    }

    // Draw current price indicator (vertical line at end of history)
    if (historyLength > 0) {
      const x = ((historyLength - 1) / (allData.length - 1)) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Draw dot at current price
      const currentPrice = market.priceHistory[historyLength - 1].prices[crop];
      const y = height - ((currentPrice - minPrice) / priceRange) * (height - 10) - 5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [crop, gameState.market, color]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className="w-full h-full"
    />
  );
}

export default function EconomyModal({ gameState, onClose }: EconomyModalProps) {
  const [activeTab, setActiveTab] = useState<ZoneTab>('farm');

  const market = gameState.market;
  if (!market) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 text-white p-8 rounded-xl max-w-md w-full border border-slate-600">
          <p className="text-center text-lg mb-4">Market system initializing...</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Check if a zone is owned/active
  const isZoneActive = (zoneTab: ZoneTab): boolean => {
    const zoneKeys = ZONE_INFO[zoneTab].zoneKeys;
    return zoneKeys.some(key => {
      const zone = gameState.zones[key];
      return zone && zone.owned;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border border-slate-600/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">📊 Market Economy</h2>
              <p className="text-sm text-slate-400 mt-1">Price history & forecasts by zone</p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Zone Tabs */}
          <div className="flex gap-2 mt-6">
            {(Object.keys(ZONE_INFO) as ZoneTab[]).map(zoneTab => {
              const zone = ZONE_INFO[zoneTab];
              const isActive = isZoneActive(zoneTab);
              const isSelected = activeTab === zoneTab;

              return (
                <button
                  key={zoneTab}
                  onClick={() => isActive && setActiveTab(zoneTab)}
                  disabled={!isActive}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                    isSelected && isActive
                      ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30'
                      : isActive
                      ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
                      : 'bg-slate-800/50 border-slate-700/50 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">{zone.emoji}</span>
                    <span>{zone.name}</span>
                  </div>
                  {!isActive && (
                    <div className="text-xs text-slate-500 mt-1">Not Owned</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Season and Market Info */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {market.currentSeason === 'spring' && '🌸'}
                  {market.currentSeason === 'summer' && '☀️'}
                  {market.currentSeason === 'fall' && '🍂'}
                  {market.currentSeason === 'winter' && '❄️'}
                </span>
                <div>
                  <div className="text-xs text-slate-400">Current Season</div>
                  <div className="text-lg font-bold capitalize">{market.currentSeason}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">High Demand Crops</div>
                <div className="flex gap-2 mt-1">
                  {market.highDemandCrops.map(crop => (
                    <span key={crop} className="text-2xl" title={CROP_INFO[crop].name}>
                      {CROP_INFO[crop].emoji}
                    </span>
                  ))}
                </div>
              </div>
              {market.epicPriceCrop && (
                <div className="text-right">
                  <div className="text-xs text-purple-400">⚡ EPIC PRICE (5x)</div>
                  <div className="text-3xl mt-1">
                    {CROP_INFO[market.epicPriceCrop].emoji}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Crop Grid for Selected Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CROP_LIST.map(crop => {
              const price = getMarketPrice(crop, gameState);
              const info = CROP_INFO[crop];
              const color = CROP_COLORS[crop];
              const isHighDemand = market.highDemandCrops.includes(crop);
              const isEpic = market.epicPriceCrop === crop;

              // Calculate price change from forecast
              let priceChange = 0;
              let forecastPrice = 0;
              if (market.priceForecast.length > 0 && market.priceHistory.length > 0) {
                const currentPrice = market.priceHistory[market.priceHistory.length - 1].prices[crop];
                forecastPrice = market.priceForecast[market.priceForecast.length - 1].prices[crop];
                priceChange = ((forecastPrice - currentPrice) / currentPrice) * 100;
              }

              return (
                <div
                  key={crop}
                  className={`relative bg-slate-800/60 rounded-xl border-2 p-4 transition-all ${
                    isEpic
                      ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                      : isHighDemand
                      ? 'border-yellow-500/60 shadow-lg shadow-yellow-500/20'
                      : 'border-slate-700'
                  }`}
                >
                  {/* Epic or High Demand Badge */}
                  {isEpic && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                      ⚡ EPIC 5X
                    </div>
                  )}
                  {isHighDemand && !isEpic && (
                    <div className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🔥 HIGH DEMAND
                    </div>
                  )}

                  {/* Crop Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{info.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold text-base">{info.name}</div>
                      <div className="text-2xl font-bold" style={{ color }}>
                        ${price}
                      </div>
                    </div>
                  </div>

                  {/* Price Chart */}
                  <div className="bg-black/40 rounded-lg p-2 mb-3 h-16 relative">
                    <MiniChart crop={crop} gameState={gameState} color={color} />
                    <div className="absolute bottom-1 left-2 text-[10px] text-slate-400">
                      Past ━━ Future ┉┉
                    </div>
                  </div>

                  {/* Forecast & Trend */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Forecast:</span>
                      <span
                        className={`font-bold ${
                          priceChange > 5
                            ? 'text-green-400'
                            : priceChange < -5
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {priceChange > 0 ? '↗' : priceChange < 0 ? '↘' : '→'} {priceChange > 0 ? '+' : ''}
                        {priceChange.toFixed(1)}%
                      </span>
                    </div>
                    {forecastPrice > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Future Price:</span>
                        <span className="font-bold text-cyan-400">${forecastPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-700/50 p-4 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-lg transition-all border border-slate-600"
          >
            Close Market
          </button>
        </div>
      </div>
    </div>
  );
}
