'use client';

import { useMemo } from 'react';
import { GameState, ZoneEarnings } from '@/types/game';

interface ZoneEarningsModalProps {
  gameState: GameState;
  onClose: () => void;
}

export default function ZoneEarningsModal({ gameState, onClose }: ZoneEarningsModalProps) {
  // Sort zones by earnings (highest first)
  const sortedZones = useMemo(() => {
    if (!gameState.zoneEarnings) return [];

    return Object.values(gameState.zoneEarnings)
      .filter(zone => zone.totalEarnings > 0)
      .sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [gameState.zoneEarnings]);

  const maxEarnings = useMemo(() => {
    if (sortedZones.length === 0) return 0;
    return sortedZones[0].totalEarnings;
  }, [sortedZones]);

  const totalEarnings = useMemo(() => {
    return sortedZones.reduce((sum, zone) => sum + zone.totalEarnings, 0);
  }, [sortedZones]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border-4 border-green-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">💰 Zone Earnings</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 bg-black/30 px-4 py-3 rounded">
          <div className="text-xl font-bold">
            Total Earnings: 💰 ${totalEarnings.toLocaleString()}
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Current Money: 💰 ${gameState.player.money.toLocaleString()}
          </div>
        </div>

        {sortedZones.length === 0 ? (
          <div className="text-center text-gray-400 my-8 text-lg">
            No earnings tracked yet. Start selling crops to see zone performance!
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">📊 Earnings by Zone</h3>

            {sortedZones.map((zone, index) => {
              const percentage = maxEarnings > 0 ? (zone.totalEarnings / maxEarnings) * 100 : 0;
              const barWidth = `${percentage}%`;

              // Color based on rank
              const barColor = index === 0
                ? 'bg-yellow-500'
                : index === 1
                ? 'bg-gray-400'
                : index === 2
                ? 'bg-orange-600'
                : 'bg-green-600';

              const borderColor = index === 0
                ? 'border-yellow-600'
                : index === 1
                ? 'border-gray-500'
                : index === 2
                ? 'border-orange-700'
                : 'border-green-700';

              return (
                <div
                  key={zone.zoneKey}
                  className={`bg-black/40 p-4 rounded-lg border-2 ${borderColor}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      <span className="font-bold text-lg">{zone.zoneName}</span>
                      <span className="text-sm text-gray-400">({zone.zoneKey})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-green-400">
                        ${zone.totalEarnings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {zone.earningsHistory.length} sales
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="relative h-8 bg-black/40 rounded overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-500 flex items-center justify-end px-2`}
                      style={{ width: barWidth }}
                    >
                      {percentage > 15 && (
                        <span className="text-white font-bold text-sm">
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    {percentage <= 15 && percentage > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white font-bold text-sm">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
