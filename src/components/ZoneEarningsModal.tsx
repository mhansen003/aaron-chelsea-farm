'use client';

import { useMemo } from 'react';
import { GameState, ZoneEarnings } from '@/types/game';

interface ZoneEarningsModalProps {
  gameState: GameState;
  onClose: () => void;
}

// Zone colors for the line chart (Factorio-inspired palette)
const ZONE_COLORS = [
  '#fbbf24', // yellow
  '#60a5fa', // blue
  '#34d399', // green
  '#f87171', // red
  '#a78bfa', // purple
  '#fb923c', // orange
  '#22d3ee', // cyan
  '#f472b6', // pink
];

interface ChartDataPoint {
  timestamp: number;
  cumulativeEarnings: number;
}

interface ZoneChartData {
  zone: ZoneEarnings;
  color: string;
  dataPoints: ChartDataPoint[];
}

export default function ZoneEarningsModal({ gameState, onClose }: ZoneEarningsModalProps) {
  // Prepare chart data for each zone
  const chartData = useMemo((): ZoneChartData[] => {
    if (!gameState.zoneEarnings) return [];

    const zones = Object.values(gameState.zoneEarnings)
      .filter(zone => zone.totalEarnings > 0)
      .sort((a, b) => b.totalEarnings - a.totalEarnings);

    return zones.map((zone, index) => {
      // Convert earnings history to cumulative data points
      let cumulative = 0;
      const dataPoints: ChartDataPoint[] = zone.earningsHistory.map(entry => {
        cumulative += entry.amount;
        return {
          timestamp: entry.timestamp,
          cumulativeEarnings: cumulative,
        };
      });

      return {
        zone,
        color: ZONE_COLORS[index % ZONE_COLORS.length],
        dataPoints,
      };
    });
  }, [gameState.zoneEarnings]);

  // Calculate chart bounds
  const chartBounds = useMemo(() => {
    if (chartData.length === 0) {
      return { minTime: 0, maxTime: 1, maxEarnings: 100 };
    }

    let minTime = Infinity;
    let maxTime = -Infinity;
    let maxEarnings = 0;

    chartData.forEach(({ dataPoints }) => {
      dataPoints.forEach(point => {
        minTime = Math.min(minTime, point.timestamp);
        maxTime = Math.max(maxTime, point.timestamp);
        maxEarnings = Math.max(maxEarnings, point.cumulativeEarnings);
      });
    });

    // Add some padding to the time range
    const timeRange = maxTime - minTime;
    const timePadding = timeRange * 0.05;

    return {
      minTime: minTime - timePadding,
      maxTime: maxTime + timePadding,
      maxEarnings: maxEarnings * 1.1, // 10% padding on top
    };
  }, [chartData]);

  const totalEarnings = useMemo(() => {
    return chartData.reduce((sum, { zone }) => sum + zone.totalEarnings, 0);
  }, [chartData]);

  // Convert data points to SVG path
  const generatePath = (dataPoints: ChartDataPoint[], width: number, height: number): string => {
    if (dataPoints.length === 0) return '';

    const { minTime, maxTime, maxEarnings } = chartBounds;
    const timeRange = maxTime - minTime;

    const points = dataPoints.map(point => {
      const x = ((point.timestamp - minTime) / timeRange) * width;
      const y = height - (point.cumulativeEarnings / maxEarnings) * height;
      return `${x},${y}`;
    });

    // Start from bottom-left
    const firstPoint = dataPoints[0];
    const startX = ((firstPoint.timestamp - minTime) / timeRange) * width;
    return `M ${startX},${height} L ${points.join(' L ')}`;
  };

  const chartWidth = 800;
  const chartHeight = 400;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-4 border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">📈 Zone Earnings Over Time</h2>
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

        {chartData.length === 0 ? (
          <div className="text-center text-gray-400 my-8 text-lg">
            No earnings tracked yet. Start selling crops to see zone performance!
          </div>
        ) : (
          <div className="space-y-6">
            {/* Line Chart */}
            <div className="bg-black/40 p-6 rounded-lg border-2 border-gray-600">
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full"
                  style={{ maxHeight: '400px' }}
                >
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
                    const y = chartHeight - fraction * chartHeight;
                    return (
                      <g key={fraction}>
                        <line
                          x1="0"
                          y1={y}
                          x2={chartWidth}
                          y2={y}
                          stroke="#374151"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                        <text
                          x="-5"
                          y={y + 5}
                          fill="#9ca3af"
                          fontSize="12"
                          textAnchor="end"
                        >
                          ${Math.round(chartBounds.maxEarnings * fraction).toLocaleString()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Zone lines */}
                  {chartData.map(({ zone, color, dataPoints }) => (
                    <path
                      key={zone.zoneKey}
                      d={generatePath(dataPoints, chartWidth, chartHeight)}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-black/40 p-4 rounded-lg border-2 border-gray-600">
              <h3 className="text-lg font-bold mb-3">Zones</h3>
              <div className="grid grid-cols-2 gap-3">
                {chartData.map(({ zone, color }, index) => (
                  <div key={zone.zoneKey} className="flex items-center gap-3">
                    <div
                      className="w-8 h-1 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-lg">🥇</span>}
                        {index === 1 && <span className="text-lg">🥈</span>}
                        {index === 2 && <span className="text-lg">🥉</span>}
                        <span className="font-bold">{zone.zoneName}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        ${zone.totalEarnings.toLocaleString()} • {zone.earningsHistory.length} sales
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
