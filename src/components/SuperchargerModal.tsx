'use client';

import { GameState } from '@/types/game';
import { SUPERCHARGE_BOT_COST } from '@/lib/gameEngine';

interface SuperchargerModalProps {
  gameState: GameState;
  onClose: () => void;
  onSupercharge: (botId: string, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish') => void;
}

export default function SuperchargerModal({ gameState, onClose, onSupercharge }: SuperchargerModalProps) {
  const waterBots = gameState.waterBots || [];
  const harvestBots = gameState.harvestBots || [];
  const seedBots = gameState.seedBots || [];
  const transportBots = gameState.transportBots || [];
  const demolishBots = gameState.demolishBots || [];

  const canAfford = gameState.player.money >= SUPERCHARGE_BOT_COST;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-purple-950 text-white p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border-4 border-purple-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">⚡ Supercharger Station</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="mb-6 bg-black/40 p-6 rounded-lg border-2 border-purple-400">
          <p className="text-lg leading-relaxed mb-4">
            Welcome to the <span className="font-bold text-purple-300">Supercharger Station</span> – where your bots receive powerful performance upgrades! For ${SUPERCHARGE_BOT_COST} per bot, you can boost their movement and work speed to 200%, making them twice as efficient at their tasks.
          </p>
          <p className="text-base leading-relaxed text-purple-300">
            Each bot can only be supercharged once, so choose wisely. The upgrade is permanent and will help your farm run at maximum efficiency!
          </p>
        </div>

        {/* Player Money */}
        <div className="mb-4 text-xl font-bold bg-black/30 px-4 py-2 rounded">
          Your Money: 💰 ${gameState.player.money}
        </div>

        {/* Bot Lists */}
        <div className="space-y-4">
          {/* Water Bots */}
          {waterBots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2 text-cyan-300">💧 Water Bots</h3>
              <div className="grid grid-cols-4 gap-3">
                {waterBots.map((bot, idx) => (
                  <button
                    key={bot.id}
                    onClick={() => onSupercharge(bot.id, 'water')}
                    disabled={bot.supercharged || !canAfford}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      bot.supercharged
                        ? 'bg-green-900/40 border-green-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-cyan-900/40 border-cyan-500 hover:bg-cyan-800/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💧</div>
                      <div className="text-sm font-bold">Bot #{idx + 1}</div>
                      {bot.supercharged ? (
                        <div className="text-xs text-green-400 font-bold mt-1">⚡ UPGRADED</div>
                      ) : (
                        <div className="text-xs text-yellow-400 mt-1">${SUPERCHARGE_BOT_COST}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Harvest Bots */}
          {harvestBots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2 text-orange-300">🧺 Harvest Bots</h3>
              <div className="grid grid-cols-4 gap-3">
                {harvestBots.map((bot, idx) => (
                  <button
                    key={bot.id}
                    onClick={() => onSupercharge(bot.id, 'harvest')}
                    disabled={bot.supercharged || !canAfford}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      bot.supercharged
                        ? 'bg-green-900/40 border-green-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-orange-900/40 border-orange-500 hover:bg-orange-800/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🧺</div>
                      <div className="text-sm font-bold">Bot #{idx + 1}</div>
                      {bot.supercharged ? (
                        <div className="text-xs text-green-400 font-bold mt-1">⚡ UPGRADED</div>
                      ) : (
                        <div className="text-xs text-yellow-400 mt-1">${SUPERCHARGE_BOT_COST}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seed Bots */}
          {seedBots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2 text-green-300">🌱 Seed Bots</h3>
              <div className="grid grid-cols-4 gap-3">
                {seedBots.map((bot, idx) => (
                  <button
                    key={bot.id}
                    onClick={() => onSupercharge(bot.id, 'seed')}
                    disabled={bot.supercharged || !canAfford}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      bot.supercharged
                        ? 'bg-green-900/40 border-green-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-green-900/40 border-green-500 hover:bg-green-800/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🌱</div>
                      <div className="text-sm font-bold">Bot #{idx + 1}</div>
                      {bot.supercharged ? (
                        <div className="text-xs text-green-400 font-bold mt-1">⚡ UPGRADED</div>
                      ) : (
                        <div className="text-xs text-yellow-400 mt-1">${SUPERCHARGE_BOT_COST}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transport Bots */}
          {transportBots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2 text-blue-300">🚚 Transport Bots</h3>
              <div className="grid grid-cols-4 gap-3">
                {transportBots.map((bot, idx) => (
                  <button
                    key={bot.id}
                    onClick={() => onSupercharge(bot.id, 'transport')}
                    disabled={bot.supercharged || !canAfford}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      bot.supercharged
                        ? 'bg-green-900/40 border-green-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-blue-900/40 border-blue-500 hover:bg-blue-800/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🚚</div>
                      <div className="text-sm font-bold">Bot #{idx + 1}</div>
                      {bot.supercharged ? (
                        <div className="text-xs text-green-400 font-bold mt-1">⚡ UPGRADED</div>
                      ) : (
                        <div className="text-xs text-yellow-400 mt-1">${SUPERCHARGE_BOT_COST}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Demolish Bots */}
          {demolishBots.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2 text-red-300">🔨 Demolish Bots</h3>
              <div className="grid grid-cols-4 gap-3">
                {demolishBots.map((bot, idx) => (
                  <button
                    key={bot.id}
                    onClick={() => onSupercharge(bot.id, 'demolish')}
                    disabled={bot.supercharged || !canAfford}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      bot.supercharged
                        ? 'bg-green-900/40 border-green-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-red-900/40 border-red-500 hover:bg-red-800/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔨</div>
                      <div className="text-sm font-bold">Bot #{idx + 1}</div>
                      {bot.supercharged ? (
                        <div className="text-xs text-green-400 font-bold mt-1">⚡ UPGRADED</div>
                      ) : (
                        <div className="text-xs text-yellow-400 mt-1">${SUPERCHARGE_BOT_COST}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Bots Message */}
          {waterBots.length === 0 && harvestBots.length === 0 && seedBots.length === 0 && transportBots.length === 0 && demolishBots.length === 0 && (
            <div className="text-center py-8 text-purple-300">
              <p className="text-lg">You don't have any bots yet!</p>
              <p className="text-sm mt-2">Purchase bots from the Mechanic Shop first.</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
