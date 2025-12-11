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
  const [pendingChanges, setPendingChanges] = useState<Record<string, Exclude<CropType, null>>>({});

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

  const handleJobClick = (bot: SeedBot, job: SeedBotJob) => {
    if (selectedCrop) {
      // Use a separator that won't appear in IDs: "|||"
      const jobKey = `${bot.id}|||${job.id}`;
      setPendingChanges(prev => ({
        ...prev,
        [jobKey]: selectedCrop,
      }));
    }
  };

  const handleSaveChanges = () => {
    console.log('=== SAVE CHANGES CLICKED ===');
    console.log('Pending changes:', pendingChanges);

    if (onUpdateSeedBotJob) {
      Object.entries(pendingChanges).forEach(([jobKey, newCrop]) => {
        // Split using the special separator
        const [botId, jobId] = jobKey.split('|||');
        console.log(`Updating job: botId=${botId}, jobId=${jobId}, newCrop=${newCrop}`);
        onUpdateSeedBotJob(botId, jobId, newCrop);
      });
    }
    setPendingChanges({});
    setSelectedCrop(null);
    onClose();
  };

  const handleCancelChanges = () => {
    setPendingChanges({});
    setSelectedCrop(null);
  };

  // Calculate time until next market cycle (8 minutes = 480000ms)
  const MARKET_CYCLE_DURATION = 480000; // 8 minutes in milliseconds
  const timeSinceLastUpdate = gameState.gameTime - (market.lastForecastTime || 0);
  const timeUntilNext = Math.max(0, MARKET_CYCLE_DURATION - timeSinceLastUpdate);
  const minutesUntilNext = Math.floor(timeUntilNext / 60000);
  const secondsUntilNext = Math.floor((timeUntilNext % 60000) / 1000);

  // Calculate progress percentage (0-100)
  const cycleProgress = ((MARKET_CYCLE_DURATION - timeUntilNext) / MARKET_CYCLE_DURATION) * 100;

  // Season info
  const SEASON_INFO = {
    spring: { name: 'Spring', emoji: '🌸', color: 'from-pink-500 to-green-500' },
    summer: { name: 'Summer', emoji: '☀️', color: 'from-yellow-500 to-orange-500' },
    fall: { name: 'Fall', emoji: '🍂', color: 'from-orange-500 to-red-500' },
    winter: { name: 'Winter', emoji: '❄️', color: 'from-blue-400 to-cyan-400' },
  };

  const currentSeasonInfo = SEASON_INFO[market.currentSeason];

  // Determine next season (cycles through spring -> summer -> fall -> winter -> spring)
  const seasonOrder: Array<keyof typeof SEASON_INFO> = ['spring', 'summer', 'fall', 'winter'];
  const currentSeasonIndex = seasonOrder.indexOf(market.currentSeason);
  const nextSeasonIndex = (currentSeasonIndex + 1) % 4;
  const nextSeason = seasonOrder[nextSeasonIndex];
  const nextSeasonInfo = SEASON_INFO[nextSeason];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border-2 border-blue-500/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-blue-500/30">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                📊 Market Analysis
              </h2>
              <p className="text-sm text-gray-400 mt-1">Click crop → click jobs to reassign → save</p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Market Cycle Progress Bar */}
          <div className="bg-slate-900/60 rounded-xl border-2 border-blue-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentSeasonInfo.emoji}</span>
                <div>
                  <div className="text-sm text-gray-400">Current Market</div>
                  <div className="text-lg font-bold">{currentSeasonInfo.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Next Update</div>
                  <div className="text-lg font-bold text-cyan-400">
                    {minutesUntilNext}:{secondsUntilNext.toString().padStart(2, '0')}
                  </div>
                </div>
                <span className="text-2xl">{nextSeasonInfo.emoji}</span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative w-full h-8 bg-gray-900/60 rounded-full overflow-hidden border-2 border-gray-700">
              {/* Animated Progress Fill */}
              <div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${currentSeasonInfo.color} transition-all duration-1000 ease-linear`}
                style={{ width: `${cycleProgress}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                     style={{
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s infinite linear'
                     }}
                />
              </div>

              {/* Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {cycleProgress.toFixed(1)}%
                </span>
              </div>

              {/* Arrow Indicator pointing to next season */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
                style={{ left: `${cycleProgress}%` }}
              >
                <div className="relative -translate-x-1/2">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Helper Text */}
            <div className="text-xs text-gray-400 mt-2 text-center">
              Market cycles update every 8 minutes with new prices and trends
            </div>
          </div>
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

        {/* Footer with Seed Bot Jobs */}
        <div className="flex-shrink-0 border-t border-blue-500/30 p-4 bg-slate-900/50">
          {allSeedBots.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No seed bots available. Purchase seed bots from the Bot Factory!
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selected Crop Indicator */}
              {selectedCrop && (
                <div className="bg-blue-900/40 border border-blue-500/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CROP_INFO[selectedCrop].emoji}</span>
                    <span className="font-bold">Assigning {CROP_INFO[selectedCrop].name}</span>
                    <span className="text-sm text-gray-400">- Click jobs below to reassign</span>
                  </div>
                  <button
                    onClick={handleCancelChanges}
                    className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-white/10"
                  >
                    Cancel Selection
                  </button>
                </div>
              )}

              {/* Seed Bot Jobs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                {allSeedBots.map(({ bot, zoneName }, botIndex) => (
                  bot.jobs.map((job, jobIndex) => {
                    const jobKey = `${bot.id}|||${job.id}`;
                    const currentCrop = CROP_INFO[job.cropType];
                    const pendingCrop = pendingChanges[jobKey] ? CROP_INFO[pendingChanges[jobKey]] : null;
                    const isPending = !!pendingCrop;

                    return (
                      <button
                        key={jobKey}
                        onClick={() => handleJobClick(bot, job)}
                        disabled={!selectedCrop}
                        className={`rounded-lg p-2 text-sm transition-all border-2 ${
                          isPending
                            ? 'bg-yellow-700/60 border-yellow-400 shadow-lg shadow-yellow-400/30'
                            : selectedCrop
                            ? 'bg-green-700/40 hover:bg-green-600/60 border-green-500/50 hover:scale-[1.02] cursor-pointer'
                            : 'bg-slate-800/60 border-slate-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="font-bold text-xs mb-1">
                          Bot {botIndex + 1} • Job {jobIndex + 1}
                        </div>
                        <div className="text-xs text-gray-300 mb-1">{zoneName}</div>
                        <div className="text-xs text-green-300 mb-2">{job.targetTiles.length} tiles</div>

                        {/* Current and Pending Assignment */}
                        <div className="flex items-center justify-center gap-1 text-lg">
                          {isPending ? (
                            <>
                              <span className="opacity-50">{currentCrop.emoji}</span>
                              <span className="text-yellow-400">→</span>
                              <span>{pendingCrop.emoji}</span>
                            </>
                          ) : (
                            <span>{currentCrop.emoji}</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {Object.keys(pendingChanges).length > 0 && (
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-lg transition-all shadow-lg"
                  >
                    💾 Save Changes ({Object.keys(pendingChanges).length})
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`${Object.keys(pendingChanges).length > 0 ? '' : 'flex-1'} px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-bold text-lg transition-all`}
                >
                  {Object.keys(pendingChanges).length > 0 ? 'Cancel' : 'Close Market'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
