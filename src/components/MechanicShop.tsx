'use client';

import { GameState } from '@/types/game';
import { WATERBOT_COST, HARVESTBOT_COST, SEEDBOT_COST } from '@/lib/gameEngine';
import Image from 'next/image';

interface MechanicShopProps {
  gameState: GameState;
  onClose: () => void;
  onBuyWaterbots: (amount: number) => void;
  onBuyHarvestbots: (amount: number) => void;
  onBuySeedbots: (amount: number) => void;
  onRelocate: () => void;
}

export default function MechanicShop({ gameState, onClose, onBuyWaterbots, onBuyHarvestbots, onBuySeedbots, onRelocate }: MechanicShopProps) {
  const TRANSPORTBOT_COST = 2000; // Placeholder cost for transport bot

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-orange-900 to-orange-950 text-white p-8 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-4 border-orange-600 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold">⚙️ Bot Command Center</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 text-xl font-bold bg-black/40 px-6 py-3 rounded-lg border-2 border-yellow-600/50">
          💰 Available Funds: ${gameState.player.money}
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-base mb-6 leading-relaxed">
            Welcome to the Bot Command Center! Each bot is a specialized farming assistant designed to automate specific tasks on your farm. Choose wisely and build your automated farming empire!
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Water Bot */}
            <div className={`bg-gradient-to-br from-cyan-900/40 to-blue-950/40 p-5 rounded-xl border-3 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.waterbots >= 2
                ? 'border-green-500 shadow-lg shadow-green-500/30'
                : 'border-cyan-500/50 shadow-lg shadow-cyan-500/20'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/water bot.png"
                    alt="Water Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.waterbots >= 2 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-2">Water Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Water Bot is your tireless hydration specialist. Equipped with advanced moisture sensors and a 10-gallon tank, it autonomously waters your crops to ensure optimal growth.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-cyan-400">Owned: {gameState.player.inventory.waterbots}/2</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-waters crops • ✓ 10-gallon capacity • ✓ Self-refilling
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.waterbots >= 2 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => onBuyWaterbots(1)}
                  disabled={gameState.player.money < WATERBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= WATERBOT_COST
                      ? 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= WATERBOT_COST ? `Purchase for $${WATERBOT_COST}` : `Insufficient Funds ($${WATERBOT_COST})`}
                </button>
              )}
            </div>

            {/* Harvest Bot */}
            <div className="bg-gradient-to-br from-amber-900/40 to-yellow-950/40 p-5 rounded-xl border-3 border-amber-500/50 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/harvest bot.png"
                    alt="Harvest Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-amber-300 mb-2">Harvest Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Harvest Bot is a precision harvesting machine. With gentle mechanical arms and crop-detection AI, it collects mature crops and deposits them directly to your warehouse.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-amber-400">Owned: {gameState.player.inventory.harvestbots}</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-harvests crops • ✓ 8-slot inventory • ✓ Auto-deposits
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => onBuyHarvestbots(1)}
                disabled={gameState.player.money < HARVESTBOT_COST}
                className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                  gameState.player.money >= HARVESTBOT_COST
                    ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/50'
                    : 'bg-gray-700 cursor-not-allowed text-gray-500'
                }`}
              >
                {gameState.player.money >= HARVESTBOT_COST ? `Purchase for $${HARVESTBOT_COST}` : `Insufficient Funds ($${HARVESTBOT_COST})`}
              </button>
            </div>

            {/* Seed Bot */}
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-950/40 p-5 rounded-xl border-3 border-green-500/50 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/plant seeds.png"
                    alt="Seed Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-300 mb-2">Seed Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Seed Bot is your intelligent planting assistant. Program up to 3 jobs with custom crop selections, and it will autonomously plant seeds across your farm zones.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-green-400">Owned: {gameState.player.inventory.seedbots}</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-plants seeds • ✓ 3 job slots • ✓ Auto-buy seeds option
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => onBuySeedbots(1)}
                disabled={gameState.player.money < SEEDBOT_COST}
                className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                  gameState.player.money >= SEEDBOT_COST
                    ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/50'
                    : 'bg-gray-700 cursor-not-allowed text-gray-500'
                }`}
              >
                {gameState.player.money >= SEEDBOT_COST ? `Purchase for $${SEEDBOT_COST}` : `Insufficient Funds ($${SEEDBOT_COST})`}
              </button>
            </div>

            {/* Transport Bot */}
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-950/40 p-5 rounded-xl border-3 border-purple-500/50 shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform duration-200 opacity-60">
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/transport bot.png"
                    alt="Transport Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full rotate-[-15deg]">
                      COMING SOON
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">Transport Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Transport Bot is your logistics specialist. It automatically transports crops from your warehouse to the export station and handles all sales transactions.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-purple-400">Owned: 0</span>
                </div>
                <div className="text-xs text-gray-400">
                  ⧗ Auto-transports • ⧗ Auto-sells • ⧗ Large cargo capacity
                </div>
              </div>

              {/* Disabled Button */}
              <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-gray-700 text-gray-400 text-center border-2 border-gray-600">
                Under Development ($${TRANSPORTBOT_COST})
              </div>
            </div>
          </div>
        </div>

        {/* Relocate Button */}
        <button
          onClick={() => {
            onRelocate();
            onClose();
          }}
          className="mt-6 w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-lg"
        >
          🔄 Relocate Mechanic Shop
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
        >
          Close Mechanic Shop
        </button>
      </div>
    </div>
  );
}
