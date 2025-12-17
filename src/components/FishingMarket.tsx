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
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">

            {/* Fish Market */}
            <div className="relative group bg-gradient-to-br from-cyan-500 to-blue-600 p-1 rounded-2xl hover:scale-105 transition-transform">
              <div className="bg-slate-900 rounded-xl p-2 h-full flex flex-col">
                <div className="relative w-full aspect-square mb-2">
                  <img src="/fishmarket.png" alt="Fish Market" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <h3 className="text-sm font-bold text-cyan-400 mb-1">🐟 Fish Market</h3>
                <p className="text-[10px] text-gray-400 mb-2 flex-1">
                  Sell your fresh catch at premium prices
                </p>
                <div className="space-y-1">
                  <div className="text-lg font-black text-yellow-400">$5,000</div>
                  <button
                    disabled={gameState.player.money < 5000}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      gameState.player.money >= 5000
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    BUILD
                  </button>
                </div>
              </div>
            </div>

            {/* Bait Shop */}
            <div className="relative group bg-gradient-to-br from-amber-500 to-orange-600 p-1 rounded-2xl hover:scale-105 transition-transform">
              <div className="bg-slate-900 rounded-xl p-2 h-full flex flex-col">
                <div className="relative w-full aspect-square mb-2">
                  <img src="/baitshop.png" alt="Bait Shop" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <h3 className="text-sm font-bold text-amber-400 mb-1">🪱 Bait Shop</h3>
                <p className="text-[10px] text-gray-400 mb-2 flex-1">
                  Increase rare fish spawn rates
                </p>
                <div className="space-y-1">
                  <div className="text-lg font-black text-yellow-400">$3,500</div>
                  <button
                    disabled={gameState.player.money < 3500}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      gameState.player.money >= 3500
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    BUILD
                  </button>
                </div>
              </div>
            </div>

            {/* Sub Depot */}
            <div className="relative group bg-gradient-to-br from-purple-500 to-indigo-600 p-1 rounded-2xl hover:scale-105 transition-transform">
              <div className="bg-slate-900 rounded-xl p-2 h-full flex flex-col">
                <div className="relative w-full aspect-square mb-2">
                  <img src="/subdepot.png" alt="Sub Depot" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <h3 className="text-sm font-bold text-purple-400 mb-1">🚢 Sub Depot</h3>
                <p className="text-[10px] text-gray-400 mb-2 flex-1">
                  Deploy submarine fishing bots
                </p>
                <div className="space-y-1">
                  <div className="text-lg font-black text-yellow-400">$8,000</div>
                  <button
                    disabled={gameState.player.money < 8000}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      gameState.player.money >= 8000
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    BUILD
                  </button>
                </div>
              </div>
            </div>

            {/* Fishing Boat */}
            <div className="relative group bg-gradient-to-br from-green-500 to-emerald-600 p-1 rounded-2xl hover:scale-105 transition-transform">
              <div className="bg-slate-900 rounded-xl p-2 h-full flex flex-col">
                <div className="relative w-full aspect-square mb-2">
                  <img src="/boat.png" alt="Fishing Boat" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <h3 className="text-sm font-bold text-green-400 mb-1">⛵ Fishing Boat</h3>
                <p className="text-[10px] text-gray-400 mb-2 flex-1">
                  Access deeper waters for rare catches
                </p>
                <div className="space-y-1">
                  <div className="text-lg font-black text-yellow-400">$12,000</div>
                  <button
                    disabled={gameState.player.money < 12000}
                    className={`w-full px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      gameState.player.money >= 12000
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
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
    </div>
  );
}
