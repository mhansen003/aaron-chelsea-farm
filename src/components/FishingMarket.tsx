'use client';

import { GameState } from '@/types/game';

interface FishingMarketProps {
  gameState: GameState;
  onClose: () => void;
}

export default function FishingMarket({ gameState, onClose }: FishingMarketProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl w-auto max-w-5xl max-h-[95vh] border-4 border-cyan-500/50 shadow-2xl flex flex-col">

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

        {/* Buildings Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Fish Market */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all">
              <div className="aspect-square bg-black/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src="/fishmarket.png" alt="Fish Market" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">🐟 Fish Market</h3>
              <p className="text-gray-400 text-sm mb-4">
                Sell your fresh catch at premium prices. Unlocks fish trading.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-yellow-400">$5,000</span>
                <button
                  disabled={gameState.player.money < 5000}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    gameState.player.money >= 5000
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  BUILD
                </button>
              </div>
            </div>

            {/* Bait Shop */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all">
              <div className="aspect-square bg-black/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src="/baitshop.png" alt="Bait Shop" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">🪱 Bait Shop</h3>
              <p className="text-gray-400 text-sm mb-4">
                Purchase bait and lures to attract rarer fish. Increases rare fish spawn rates.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-yellow-400">$3,500</span>
                <button
                  disabled={gameState.player.money < 3500}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    gameState.player.money >= 3500
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  BUILD
                </button>
              </div>
            </div>

            {/* Sub Depot */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all">
              <div className="aspect-square bg-black/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src="/subdepot.png" alt="Sub Depot" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">🚢 Sub Depot</h3>
              <p className="text-gray-400 text-sm mb-4">
                Deploy submarine bots to automatically catch fish in deeper waters.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-yellow-400">$8,000</span>
                <button
                  disabled={gameState.player.money < 8000}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    gameState.player.money >= 8000
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  BUILD
                </button>
              </div>
            </div>

            {/* Fishing Boat */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all">
              <div className="aspect-square bg-black/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img src="/boat.png" alt="Fishing Boat" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">⛵ Fishing Boat</h3>
              <p className="text-gray-400 text-sm mb-4">
                Sail out to deeper waters for bigger catches and rare ocean treasures.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-yellow-400">$12,000</span>
                <button
                  disabled={gameState.player.money < 12000}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    gameState.player.money >= 12000
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  BUILD
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
