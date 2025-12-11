import { GameState } from '@/types/game';

const SUPERCHARGE_BOT_COST = 500; // Cost to supercharge a single bot

interface SuperchargerModalProps {
  gameState: GameState;
  onClose: () => void;
  onSupercharge?: (botId: string, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish') => void;
  onRelocate?: () => void;
}

export default function SuperchargerModal({ gameState, onClose, onSupercharge, onRelocate }: SuperchargerModalProps) {
  const waterBots = gameState.waterBots || [];
  const harvestBots = gameState.harvestBots || [];
  const seedBots = gameState.seedBots || [];
  const transportBots = gameState.transportBots || [];
  const demolishBots = gameState.demolishBots || [];

  const totalBots = waterBots.length + harvestBots.length + seedBots.length + transportBots.length + demolishBots.length;

  // Helper to render a bot tile
  const renderBotTile = (bot: any, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish', icon: string, color: string) => {
    const isSupercharged = bot.supercharged === true;
    const canAfford = gameState.player.money >= SUPERCHARGE_BOT_COST;

    return (
      <div key={bot.id} className={`bg-gradient-to-br ${color} p-3 rounded-lg border-2 ${isSupercharged ? 'border-yellow-400' : 'border-purple-500'} relative`}>
        {isSupercharged && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-purple-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            ⚡
          </div>
        )}
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl">{icon}</div>
          <p className="text-white text-xs font-bold opacity-75">#{bot.id.slice(0, 6)}</p>
          <p className="text-white text-sm font-semibold">{bot.status}</p>

          {isSupercharged ? (
            <div className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
              SUPERCHARGED
            </div>
          ) : (
            <button
              onClick={() => onSupercharge && onSupercharge(bot.id, botType)}
              disabled={!canAfford}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                canAfford
                  ? 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              ${SUPERCHARGE_BOT_COST}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 md:p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-4 md:p-8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border-2 md:border-4 border-purple-400" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 pb-2 z-10">
          <h2 className="text-2xl md:text-4xl font-bold text-purple-100 flex items-center gap-2 md:gap-3">
            ⚡ Supercharger Station
          </h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-100 text-4xl md:text-3xl font-bold transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 md:space-y-6">
          {/* Description */}
          <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
            <p className="text-purple-100 text-sm md:text-base leading-relaxed">
              Supercharge individual bots to give them <span className="font-bold text-yellow-400">200% movement and work speed</span>!
              Each bot upgrade costs <span className="font-bold text-green-400">${SUPERCHARGE_BOT_COST}</span>.
            </p>
            <p className="text-purple-300 text-xs md:text-sm mt-2">
              Your balance: <span className="font-bold text-green-400">${gameState.player.money}</span>
            </p>
          </div>

          {totalBots === 0 && (
            <div className="bg-purple-950 bg-opacity-50 p-6 rounded-lg border-2 border-purple-600 text-center">
              <p className="text-purple-300 text-lg">No bots available to supercharge yet!</p>
              <p className="text-purple-400 text-sm mt-2">Purchase bots from the shop first.</p>
            </div>
          )}

          {/* Water Bots */}
          {waterBots.length > 0 && (
            <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
              <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-3">💧 Water Bots ({waterBots.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {waterBots.map(bot => renderBotTile(bot, 'water', '💧', 'from-blue-600 to-blue-700'))}
              </div>
            </div>
          )}

          {/* Harvest Bots */}
          {harvestBots.length > 0 && (
            <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
              <h3 className="text-lg md:text-xl font-bold text-amber-400 mb-3">🌾 Harvest Bots ({harvestBots.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {harvestBots.map(bot => renderBotTile(bot, 'harvest', '🌾', 'from-amber-600 to-amber-700'))}
              </div>
            </div>
          )}

          {/* Seed Bots */}
          {seedBots.length > 0 && (
            <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
              <h3 className="text-lg md:text-xl font-bold text-green-400 mb-3">🌱 Seed Bots ({seedBots.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {seedBots.map(bot => renderBotTile(bot, 'seed', '🌱', 'from-green-600 to-green-700'))}
              </div>
            </div>
          )}

          {/* Transport Bots */}
          {transportBots.length > 0 && (
            <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
              <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-3">🚚 Transport Bots ({transportBots.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {transportBots.map(bot => renderBotTile(bot, 'transport', '🚚', 'from-yellow-600 to-yellow-700'))}
              </div>
            </div>
          )}

          {/* Demolish Bots */}
          {demolishBots.length > 0 && (
            <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
              <h3 className="text-lg md:text-xl font-bold text-red-400 mb-3">💥 Demolish Bots ({demolishBots.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {demolishBots.map(bot => renderBotTile(bot, 'demolish', '💥', 'from-red-600 to-red-700'))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 md:mt-6 flex flex-col md:flex-row gap-2 md:gap-4">
          {onRelocate && (
            <button
              onClick={() => {
                onRelocate();
                onClose();
              }}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg text-base md:text-lg transition-colors"
            >
              📍 Relocate Supercharger
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg text-base md:text-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
