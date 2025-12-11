'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GameState, CropType } from '@/types/game';
import { getMarketPrice, getPriceTrend, getNextSeasonForecast } from '@/lib/marketEconomy';

interface EconomyModalProps {
  gameState: GameState;
  onClose: () => void;
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

const SEASON_COLORS: Record<string, string> = {
  spring: '#90ee90',
  summer: '#ffeb3b',
  fall: '#ff9800',
  winter: '#64b5f6',
};

export default function EconomyModal({ gameState, onClose }: EconomyModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleCrops, setVisibleCrops] = useState<Record<Exclude<CropType, null>, boolean>>({
    carrot: true,
    wheat: true,
    tomato: true,
    pumpkin: false,
    watermelon: false,
    peppers: false,
    grapes: false,
    oranges: false,
    avocado: false,
    rice: false,
    corn: false,
  });

  // Initialize market if it doesn't exist
  const market = gameState.market;
  if (!market) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-4 md:p-8 rounded-xl max-w-4xl w-full">
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

  const nextSeason = getNextSeasonForecast(gameState.currentDay);

  // Draw price chart
  useEffect(() => {
    if (!canvasRef.current || !market) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    if (market.priceHistory.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Price data collecting...', width / 2, height / 2);
      return;
    }

    // Find min/max prices for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    CROP_LIST.forEach(crop => {
      if (!visibleCrops[crop]) return;
      market.priceHistory.forEach(snapshot => {
        const price = snapshot.prices[crop];
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      });
    });

    const priceRange = maxPrice - minPrice || 1;

    // Draw price lines for each visible crop
    CROP_LIST.forEach(crop => {
      if (!visibleCrops[crop]) return;

      ctx.strokeStyle = CROP_COLORS[crop];
      ctx.lineWidth = 2;
      ctx.beginPath();

      market.priceHistory.forEach((snapshot, index) => {
        const x = (index / (market.priceHistory.length - 1)) * width;
        const price = snapshot.prices[crop];
        const y = height - ((price - minPrice) / priceRange) * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - ((maxPrice - minPrice) / 5) * i;
      const y = (height / 5) * i;
      ctx.fillText(`$${Math.round(price)}`, width - 5, y + 4);
    }
  }, [market, visibleCrops]);

  const toggleCrop = (crop: Exclude<CropType, null>) => {
    setVisibleCrops(prev => ({ ...prev, [crop]: !prev[crop] }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-4 md:p-8 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border-2 md:border-4 border-blue-600">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-gradient-to-br from-blue-900 to-blue-950 pb-2 z-10">
          <h2 className="text-2xl md:text-3xl font-bold">📈 Market Economy</h2>
          <button
            onClick={onClose}
            className="text-4xl md:text-2xl hover:text-red-400 transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Current Season */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg border-2" style={{ backgroundColor: SEASON_COLORS[market.currentSeason] + '20', borderColor: SEASON_COLORS[market.currentSeason] }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold capitalize">{market.currentSeason} Season</h3>
              <p className="text-sm md:text-base text-gray-200">Day {gameState.currentDay}</p>
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm text-gray-300">High Demand:</p>
              <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
                {market.highDemandCrops.map(crop => (
                  <Image key={crop} src={`/${crop}.png`} alt={crop} width={24} height={24} className="md:w-8 md:h-8 object-contain" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Price Trends</h3>
          <div className="bg-slate-900 p-2 md:p-4 rounded-lg border-2 border-blue-500">
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>
        </div>

        {/* Crop Toggle Buttons */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold mb-2">Show/Hide Crops:</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
            {CROP_LIST.map(crop => (
              <button
                key={crop}
                onClick={() => toggleCrop(crop)}
                className={`px-2 md:px-3 py-1 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-1 justify-center transition-all ${
                  visibleCrops[crop]
                    ? 'ring-2'
                    : 'opacity-40 hover:opacity-70'
                }`}
                style={{
                  backgroundColor: CROP_COLORS[crop] + '40',
                  borderColor: CROP_COLORS[crop],
                  ringColor: CROP_COLORS[crop],
                }}
              >
                <Image src={`/${crop}.png`} alt={crop} width={20} height={20} className="object-contain" />
                <span className="capitalize hidden md:inline">{crop}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Prices Table */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Current Market Prices</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {CROP_LIST.map(crop => {
              const price = getMarketPrice(crop, gameState);
              const trend = getPriceTrend(crop, market);
              const isHighDemand = market.highDemandCrops.includes(crop);

              return (
                <div
                  key={crop}
                  className={`bg-slate-800/60 p-2 md:p-3 rounded-lg border-2 ${
                    isHighDemand ? 'border-yellow-400' : 'border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image src={`/${crop}.png`} alt={crop} width={32} height={32} className="object-contain" />
                    <div className="flex-1">
                      <div className="font-bold capitalize text-sm md:text-base">{crop}</div>
                      {isHighDemand && (
                        <div className="text-xs text-yellow-400">🔥 High Demand</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg md:text-xl font-bold text-green-400">${price}</div>
                    <div className="text-lg md:text-xl">
                      {trend === 'rising' && '📈'}
                      {trend === 'falling' && '📉'}
                      {trend === 'stable' && '➡️'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Season Forecast */}
        <div className="mb-4 p-3 md:p-4 rounded-lg border-2" style={{ backgroundColor: SEASON_COLORS[nextSeason.season] + '15', borderColor: SEASON_COLORS[nextSeason.season] }}>
          <h3 className="text-base md:text-lg font-bold mb-2">📅 Forecast: Next Season</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base capitalize">
                <span className="font-bold">{nextSeason.season}</span> arrives in {nextSeason.daysUntil} days
              </p>
              <p className="text-xs md:text-sm text-gray-300">Prepare to plant high-demand crops!</p>
            </div>
            <div className="flex gap-1 md:gap-2">
              {nextSeason.crops.map(crop => (
                <Image key={crop} src={`/${crop}.png`} alt={crop} width={28} height={28} className="md:w-10 md:h-10 object-contain" />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 md:px-6 py-2 md:py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-base md:text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
