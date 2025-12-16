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

  // Draw income history chart - line chart per crop type
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || salesHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    if (salesHistory.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Start selling crops to see income history', width / 2, height / 2);
      return;
    }

    // Calculate cumulative revenue over time for each crop
    const cropData: Record<Exclude<CropType, null>, Array<{ timestamp: number; revenue: number }>> = {
      carrot: [],
      wheat: [],
      tomato: [],
      pumpkin: [],
      watermelon: [],
      peppers: [],
      grapes: [],
      oranges: [],
      avocado: [],
      rice: [],
      corn: [],
    };

    const cropCumulative: Record<Exclude<CropType, null>, number> = {
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
      cropCumulative[sale.crop] += sale.totalRevenue;
      cropData[sale.crop].push({
        timestamp: sale.timestamp,
        revenue: cropCumulative[sale.crop]
      });
    });

    // Find min/max for scaling
    const minTime = salesHistory[0].timestamp;
    const maxTime = salesHistory[salesHistory.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;

    let maxRevenue = 0;
    Object.values(cropData).forEach(data => {
      if (data.length > 0) {
        maxRevenue = Math.max(maxRevenue, data[data.length - 1].revenue);
      }
    });

    // Draw line for each crop type
    Object.entries(cropData).forEach(([crop, data]) => {
      if (data.length === 0) return;

      const cropType = crop as Exclude<CropType, null>;
      ctx.strokeStyle = CROP_COLORS[cropType];
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + ((point.timestamp - minTime) / timeRange) * chartWidth;
        const y = height - padding - (point.revenue / maxRevenue) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw dots at data points
      data.forEach((point) => {
        const x = padding + ((point.timestamp - minTime) / timeRange) * chartWidth;
        const y = height - padding - (point.revenue / maxRevenue) * chartHeight;

        ctx.fillStyle = CROP_COLORS[cropType];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const revenue = maxRevenue - ((maxRevenue) / 5) * i;
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(`$${Math.round(revenue)}`, padding - 10, y + 4);
    }

    // Draw axis labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Revenue Over Time', width / 2, 20);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Revenue ($)', 0, 0);
    ctx.restore();
  }, [salesHistory]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border-4 border-cyan-500/50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-900/40 to-blue-900/40">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💰</div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">INCOME HISTORY</h2>
              <p className="text-cyan-300 text-sm">Track your farming empire's revenue</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-3xl hover:text-red-400 transition-colors w-12 h-12 flex items-center justify-center rounded-full hover:bg-red-500/20"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Total Revenue Summary */}
          <div className="bg-cyan-900/40 border-2 border-cyan-500/30 rounded-xl p-6 text-center">
            <div className="text-sm text-cyan-300 mb-2">Total Lifetime Revenue</div>
            <div className="text-5xl font-bold text-yellow-400">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-2">{salesHistory.length} transactions</div>
          </div>

          {/* Revenue by Crop Type Chart */}
          <div className="bg-slate-800/60 rounded-xl p-4 border-2 border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-cyan-400">📈 Revenue by Crop Type Over Time</h3>
            </div>
            <canvas
              ref={canvasRef}
              width={900}
              height={350}
              className="w-full"
              style={{ maxHeight: '350px' }}
            />

            {/* Legend */}
            {sortedCrops.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {sortedCrops.map(crop => (
                  <div key={crop} className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CROP_COLORS[crop] }}
                    />
                    <span className="text-xs">{CROP_EMOJI[crop]} {crop}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue by Crop */}
          <div className="bg-slate-800/60 rounded-xl p-4 border-2 border-cyan-500/30">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">🌾 Revenue Breakdown</h3>
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
          <div className="bg-slate-800/60 rounded-xl p-4 border-2 border-cyan-500/30">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">📋 Recent Transactions</h3>
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
        <div className="flex-shrink-0 border-t-2 border-cyan-500/30 bg-gradient-to-r from-slate-900 to-slate-800 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold text-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
