'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GameState, CropType, SeedBot, SeedBotJob } from '@/types/game';
import { getMarketPrice, getPriceTrend } from '@/lib/marketEconomy';

interface EconomyModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateSeedBotJob?: (botId: string, jobId: string, newCrop: Exclude<CropType, null>) => void;
}

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
    const currentIndex = historyLength - 1;

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
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
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

    // Draw current price indicator (vertical line)
    if (currentIndex >= 0) {
      const x = (currentIndex / (allData.length - 1)) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Draw dot at current price
      const currentPrice = market.priceHistory[currentIndex].prices[crop];
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

export default function EconomyModal({ gameState, onClose, onUpdateSeedBotJob }: EconomyModalProps) {
  const [selectedCrop, setSelectedCrop] = useState<Exclude<CropType, null> | null>(null);
  const [selectedBot, setSelectedBot] = useState<{ bot: SeedBot; job: SeedBotJob } | null>(null);

  // Initialize market if it doesn't exist
  const market = gameState.market;
  if (!market) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-8 rounded-xl max-w-4xl w-full">
          <p className="text-center text-lg">Market system initializing...</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Get all seed bots from all zones
  const allSeedBots: Array<{ bot: SeedBot; zoneName: string; zoneKey: string }> = [];
  Object.entries(gameState.zones).forEach(([zoneKey, zone]) => {
    zone.seedBots?.forEach(bot => {
      allSeedBots.push({ bot, zoneName: zone.name, zoneKey });
    });
  });

  const handleCropClick = (crop: Exclude<CropType, null>) => {
    setSelectedCrop(crop);
  };

  const handleAssignJob = (bot: SeedBot, job: SeedBotJob) => {
    if (selectedCrop && onUpdateSeedBotJob) {
      const botZone = allSeedBots.find(b => b.bot.id === bot.id);
      if (botZone) {
        onUpdateSeedBotJob(bot.id, job.id, selectedCrop);
        setSelectedCrop(null);
        setSelectedBot(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border-2 border-blue-500/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-blue-500/30">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              📊 Market Analysis
            </h2>
            <p className="text-sm text-gray-400 mt-1">Click any crop to assign to seed bot jobs</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Crop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CROP_LIST.map(crop => {
              const price = getMarketPrice(crop, gameState);
              const trend = getPriceTrend(crop, market);
              const isHighDemand = market.highDemandCrops.includes(crop);
              const info = CROP_INFO[crop];
              const color = CROP_COLORS[crop];

              // Calculate price change from forecast
              let priceChange = 0;
              if (market.priceForecast.length > 0 && market.priceHistory.length > 0) {
                const currentPrice = market.priceHistory[market.priceHistory.length - 1].prices[crop];
                const futurePrice = market.priceForecast[market.priceForecast.length - 1].prices[crop];
                priceChange = ((futurePrice - currentPrice) / currentPrice) * 100;
              }

              // Show HOT badge for crops with strong positive forecast (>10% increase)
              const isHot = priceChange > 10;

              return (
                <div
                  key={crop}
                  onClick={() => handleCropClick(crop)}
                  className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border-2 p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                    selectedCrop === crop
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/30'
                      : isHot
                      ? 'border-green-400/60'
                      : 'border-slate-700 hover:border-blue-500/60'
                  }`}
                  style={{
                    boxShadow: selectedCrop === crop ? `0 0 20px ${color}40` : undefined,
                  }}
                >
                  {/* Hot Market Badge - for strong upward forecast */}
                  {isHot && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                      🚀 HOT
                    </div>
                  )}

                  {/* Crop Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{info.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{info.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold" style={{ color }}>
                          ${price}
                        </span>
                        <span className="text-xl">
                          {trend === 'rising' && '📈'}
                          {trend === 'falling' && '📉'}
                          {trend === 'stable' && '➡️'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="bg-black/30 rounded-lg p-2 mb-3 h-16">
                    <MiniChart crop={crop} gameState={gameState} color={color} />
                  </div>

                  {/* Forecast Indicator */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Forecast:</span>
                    <span
                      className={`font-bold ${
                        priceChange > 5
                          ? 'text-green-400'
                          : priceChange < -5
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {priceChange > 0 ? '+' : ''}
                      {priceChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Seed Bot Assignment */}
        <div className="flex-shrink-0 border-t border-blue-500/30 p-4 bg-slate-900/50">
          {selectedCrop ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CROP_INFO[selectedCrop].emoji}</span>
                  <span className="font-bold">Assign {CROP_INFO[selectedCrop].name} to:</span>
                </div>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {allSeedBots.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No seed bots available. Purchase seed bots from the Bot Factory!
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {allSeedBots.map(({ bot, zoneName, zoneKey }) => (
                    bot.jobs.map((job, idx) => {
                      const currentCrop = CROP_INFO[job.cropType];
                      const newCrop = selectedCrop ? CROP_INFO[selectedCrop] : null;
                      return (
                        <button
                          key={`${bot.id}-${job.id}`}
                          onClick={() => handleAssignJob(bot, job)}
                          className="bg-green-700/40 hover:bg-green-600/60 border border-green-500/50 rounded-lg p-2 text-sm transition-all hover:scale-[1.02]"
                        >
                          <div className="font-bold">Bot #{allSeedBots.findIndex(b => b.bot.id === bot.id) + 1} - Job {idx + 1}</div>
                          <div className="text-xs text-gray-300">{zoneName}</div>
                          <div className="text-xs text-green-300">{job.targetTiles.length} tiles</div>
                          <div className="text-xs text-yellow-300 mt-1 flex items-center justify-center gap-1">
                            {currentCrop.emoji} → {newCrop?.emoji}
                          </div>
                        </button>
                      );
                    })
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-bold text-lg transition-all"
            >
              Close Market
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
