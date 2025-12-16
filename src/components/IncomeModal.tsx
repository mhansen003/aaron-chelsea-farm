'use client';

import { useRef, useEffect } from 'react';
import { GameState, CropType, SaleRecord } from '@/types/game';

interface IncomeModalProps {
  gameState: GameState;
  onClose: () => void;
}

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

const CROP_EMOJI: Record<Exclude<CropType, null>, string> = {
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

export default function IncomeModal({ gameState, onClose }: IncomeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const salesHistory = gameState.salesHistory || [];

  // Calculate revenue by crop
  const revenueByCrop: Record<Exclude<CropType, null>, number> = {
    carrot: 0,
    wheat: 0,
    tomato: 0,
    pumpkin: 0,
    watermelon: 0,
    peppers: 0,
    grapes: 0,
    oranges: 0,
    avocado: 0,
    rice: 0,
    corn: 0,
  };

  salesHistory.forEach(sale => {
    revenueByCrop[sale.crop] += sale.totalRevenue;
  });

  // Calculate total revenue
  const totalRevenue = Object.values(revenueByCrop).reduce((sum, val) => sum + val, 0);

  // Sort crops by revenue
  const sortedCrops = (Object.keys(revenueByCrop) as Array<Exclude<CropType, null>>)
    .filter(crop => revenueByCrop[crop] > 0)
    .sort((a, b) => revenueByCrop[b] - revenueByCrop[a]);

  // Draw income history chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || salesHistory.length === 0) return;

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

    if (salesHistory.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Start selling crops to see income history', width / 2, height / 2);
      return;
    }

    // Calculate cumulative revenue over time
    const cumulativeData: Array<{ timestamp: number; revenue: number }> = [];
    let cumulative = 0;
    salesHistory.forEach(sale => {
      cumulative += sale.totalRevenue;
      cumulativeData.push({ timestamp: sale.timestamp, revenue: cumulative });
    });

    // Find min/max for scaling
    const maxRevenue = cumulativeData[cumulativeData.length - 1].revenue;
    const minTime = cumulativeData[0].timestamp;
    const maxTime = cumulativeData[cumulativeData.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;

    // Draw cumulative revenue line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();

    cumulativeData.forEach((point, index) => {
      const x = ((point.timestamp - minTime) / timeRange) * width;
      const y = height - (point.revenue / maxRevenue) * (height - 20) - 10;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const revenue = maxRevenue - ((maxRevenue) / 5) * i;
      const y = (height / 5) * i;
      ctx.fillText(`$${Math.round(revenue)}`, width - 5, y + 4);
    }
  }, [salesHistory]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl max-w-6xl w-full max-h-[95vh] border-2 border-gray-600/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-600/30">
          <div>
            <h2 className="text-3xl font-bold text-gray-300">
              💰 Income History
            </h2>
            <p className="text-sm text-gray-400 mt-1">Track your farming empire's revenue</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Total Revenue Summary */}
          <div className="bg-gray-800/40 border-2 border-gray-600/50 rounded-xl p-6 text-center">
            <div className="text-sm text-gray-300 mb-2">Total Lifetime Revenue</div>
            <div className="text-5xl font-bold text-green-400">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-2">{salesHistory.length} transactions</div>
          </div>

          {/* Cumulative Revenue Chart */}
          <div className="bg-gray-800/60 rounded-xl p-4 border-2 border-gray-600/30">
            <h3 className="text-xl font-bold mb-3">📈 Cumulative Revenue Over Time</h3>
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>

          {/* Revenue by Crop */}
          <div className="bg-gray-800/60 rounded-xl p-4 border-2 border-gray-600/30">
            <h3 className="text-xl font-bold mb-4">🌾 Revenue by Crop Type</h3>
            <div className="space-y-3">
              {sortedCrops.map((crop, index) => {
                const revenue = revenueByCrop[crop];
                const percentage = (revenue / totalRevenue) * 100;

                return (
                  <div key={crop} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{CROP_EMOJI[crop]}</span>
                        <span className="font-bold capitalize">{crop}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{percentage.toFixed(1)}%</span>
                        <span className="font-bold text-green-400">${revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-900/60 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: CROP_COLORS[crop],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedCrops.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No sales yet. Harvest crops and sell them to see revenue breakdown!
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-800/60 rounded-xl p-4 border-2 border-gray-600/30">
            <h3 className="text-xl font-bold mb-4">📋 Recent Transactions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {salesHistory.slice().reverse().slice(0, 20).map((sale, index) => (
                <div
                  key={index}
                  className="bg-black/30 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CROP_EMOJI[sale.crop]}</span>
                    <div>
                      <div className="font-bold capitalize">{sale.crop}</div>
                      <div className="text-xs text-gray-400">
                        Day {sale.day} • {sale.quantity} units @ ${sale.pricePerUnit}
                      </div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">
                    +${sale.totalRevenue}
                  </div>
                </div>
              ))}
            </div>

            {salesHistory.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No transactions yet. Start farming and selling!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-600/30 p-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
