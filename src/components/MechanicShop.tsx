'use client';

import { GameState } from '@/types/game';
import { WATERBOT_COST, HARVESTBOT_COST } from '@/lib/gameEngine';

interface MechanicShopProps {
  gameState: GameState;
  onClose: () => void;
  onBuyWaterbots: (amount: number) => void;
  onBuyHarvestbots: (amount: number) => void;
}

export default function MechanicShop({ gameState, onClose, onBuyWaterbots, onBuyHarvestbots }: MechanicShopProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-orange-900 to-orange-950 text-white p-8 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto border-4 border-orange-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">⚙️ Mechanic Shop - Bots</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-xl font-bold bg-black/30 px-4 py-2 rounded">
          Your Money: 💰 ${gameState.player.money}
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-4">
            Purchase farming bots to automate your farm! These bots work tirelessly to help you manage your crops.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {/* Water Bot */}
            <div className={`bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 flex flex-col items-center ${
              gameState.player.inventory.waterbots >= 2
                ? 'border-green-600'
                : 'border-orange-600'
            }`}>
              {/* Icon */}
              <div className="text-5xl mb-2">
                {gameState.player.inventory.waterbots >= 2 ? '✓' : '💧'}
              </div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Water Bot</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-green-400">Auto-waters crops</div>
                <div className="text-blue-400">Owned: {gameState.player.inventory.waterbots}/2</div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.waterbots >= 2 ? (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-green-900/40 text-green-400 text-center">
                  Max (2/2)
                </div>
              ) : (
                <button
                  onClick={() => onBuyWaterbots(1)}
                  disabled={gameState.player.money < WATERBOT_COST}
                  className={`w-full px-3 py-2 rounded font-bold text-sm ${
                    gameState.player.money >= WATERBOT_COST
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  ${WATERBOT_COST}
                </button>
              )}
            </div>

            {/* Harvest Bot */}
            <div className="bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 border-orange-600 flex flex-col items-center">
              {/* Icon */}
              <div className="text-5xl mb-2">🌾</div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Harvest Bot</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-green-400">Auto-harvests</div>
                <div className="text-blue-400">Owned: {gameState.player.inventory.harvestbots}</div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => onBuyHarvestbots(1)}
                disabled={gameState.player.money < HARVESTBOT_COST}
                className={`w-full px-3 py-2 rounded font-bold text-sm ${
                  gameState.player.money >= HARVESTBOT_COST
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                ${HARVESTBOT_COST}
              </button>
            </div>

            {/* Seed Planting Bot - Coming Soon */}
            <div className="bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 border-gray-600 opacity-50 flex flex-col items-center">
              {/* Icon */}
              <div className="text-5xl mb-2">🌱</div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Seed Bot</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-gray-400">Auto-plants seeds</div>
                <div className="text-gray-400">Coming Soon</div>
              </div>

              {/* Buy Button */}
              <div className="w-full px-3 py-2 rounded font-bold text-sm bg-gray-800/40 text-gray-500 text-center">
                Locked
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
        >
          Close Mechanic Shop
        </button>
      </div>
    </div>
  );
}
