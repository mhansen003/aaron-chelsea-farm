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

          {/* Water Bots */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-orange-700 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">💧</span>
                <span className="font-bold">Water Bot</span>
              </div>
              <div className="text-orange-300 font-bold">${WATERBOT_COST} each</div>
            </div>
            <div className="text-sm mb-2">
              <span className="text-green-400">Automatically patrols and waters crops</span>
              {' • '}
              <span className="text-blue-400">Owned: {gameState.player.inventory.waterbots}/2</span>
            </div>
            {gameState.player.inventory.waterbots >= 2 ? (
              <div className="px-4 py-2 rounded font-bold bg-gray-600 text-center text-gray-400">
                Max Capacity (2/2)
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onBuyWaterbots(1)}
                  disabled={gameState.player.money < WATERBOT_COST}
                  className={`px-4 py-2 rounded font-bold flex-1 ${
                    gameState.player.money >= WATERBOT_COST
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  Buy 1
                </button>
              </div>
            )}
          </div>

          {/* Harvest Bots */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-orange-700">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">🌾</span>
                <span className="font-bold">Harvest Bot</span>
              </div>
              <div className="text-orange-300 font-bold">${HARVESTBOT_COST} each</div>
            </div>
            <div className="text-sm mb-2">
              <span className="text-green-400">Auto-harvests grown crops</span>
              {' • '}
              <span className="text-blue-400">Owned: {gameState.player.inventory.harvestbots}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onBuyHarvestbots(1)}
                disabled={gameState.player.money < HARVESTBOT_COST}
                className={`px-4 py-2 rounded font-bold flex-1 ${
                  gameState.player.money >= HARVESTBOT_COST
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Buy 1
              </button>
            </div>
          </div>

          {/* Coming Soon: Seed Planting Bot */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-gray-600 mt-4 opacity-60">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">🌱</span>
                <span className="font-bold">Seed Planting Bot</span>
              </div>
              <span className="text-gray-400 font-bold">Coming Soon</span>
            </div>
            <div className="text-sm mb-2 text-gray-400">
              Auto-plants seeds on cleared dirt
            </div>
            <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
              Not Available Yet
            </button>
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
