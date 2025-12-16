'use client';

import { GameState } from '@/types/game';

interface FishingMarketProps {
  gameState: GameState;
  onClose: () => void;
}

export default function FishingMarket({ gameState, onClose }: FishingMarketProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border-4 border-cyan-500/50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-900/40 to-blue-900/40">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🐟</div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">FISHING MARKET</h2>
              <p className="text-cyan-300 text-sm">Buy fishing equipment and upgrades</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Money Display */}
            <div className="bg-black/60 px-6 py-3 rounded-xl border-2 border-yellow-500/50">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Balance</div>
              <div className="text-2xl font-bold text-yellow-400">${gameState.player.money}</div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-3xl hover:text-red-400 transition-colors w-12 h-12 flex items-center justify-center rounded-full hover:bg-red-500/20"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">🎣</div>
            <h3 className="text-3xl font-bold text-cyan-400 mb-4">Coming Soon!</h3>
            <p className="text-gray-400 text-lg max-w-md">
              The Fishing Market will be stocked with nets, traps, rods, and all your fishing needs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t-2 border-cyan-500/30 p-4 bg-black/40">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xl rounded-xl shadow-lg transition-all hover:scale-105"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
