import { GameState } from '@/types/game';
import Image from 'next/image';
import { HOPPER_UPGRADE_COST } from '@/lib/gameEngine';

interface HopperModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpgrade?: (botId: string, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'fertilizer') => void;
  onRelocate?: () => void;
}

const BOT_CONFIG = {
  water: { name: 'Water Bot', image: '/water-bot.png', color: 'border-cyan-600 bg-cyan-950/30' },
  harvest: { name: 'Harvest Bot', image: '/harvest-bot.png', color: 'border-orange-600 bg-orange-950/30' },
  seed: { name: 'Seed Bot', image: '/seed-bot.png', color: 'border-green-600 bg-green-950/30' },
  transport: { name: 'Transport Bot', image: '/transport-bot.png', color: 'border-purple-600 bg-purple-950/30' },
  demolish: { name: 'Demolish Bot', image: '/demolish-bot.png', color: 'border-red-600 bg-red-950/30' },
  fertilizer: { name: 'Fertilizer Bot', image: '/fertilizer-bot.png', color: 'border-lime-600 bg-lime-950/30' },
};

export default function HopperModal({ gameState, onClose, onUpgrade, onRelocate }: HopperModalProps) {
  // Get bots from current zone
  const currentZoneKey = `${gameState.currentZone.x},${gameState.currentZone.y}`;
  const currentZone = gameState.zones[currentZoneKey];

  const waterBots = currentZone?.waterBots || [];
  const harvestBots = currentZone?.harvestBots || [];
  // Seed bots don't get hopper upgrades
  const transportBots = currentZone?.transportBots || [];
  const demolishBots = currentZone?.demolishBots || [];
  const fertilizerBots = currentZone?.fertilizerBot ? [currentZone.fertilizerBot] : [];

  const totalBots = waterBots.length + harvestBots.length + transportBots.length + demolishBots.length + fertilizerBots.length;

  // Helper to render a bot card
  const renderBotCard = (bot: any, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'fertilizer') => {
    const config = BOT_CONFIG[botType];
    const hasHopper = bot.hopperUpgrade === true;
    const canAfford = gameState.player.money >= HOPPER_UPGRADE_COST;

    const handleUpgrade = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('Upgrading bot:', bot.id, botType);
      if (onUpgrade && canAfford && !hasHopper) {
        onUpgrade(bot.id, botType);
      }
    };

    return (
      <div
        key={bot.id}
        className={`relative border-2 ${config.color} ${hasHopper ? 'ring-2 ring-cyan-400' : ''} rounded-lg p-3 hover:shadow-lg transition-all`}
      >
        {hasHopper && (
          <div className="absolute -top-2 -right-2 w-8 h-8 text-2xl">
            🎒
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          {/* Bot Image */}
          <div className="w-16 h-16 relative">
            <Image
              src={config.image}
              alt={config.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Bot Info */}
          <div className="text-center">
            <p className="text-white text-xs font-semibold">{bot.name || `Bot #${bot.id.slice(0, 6)}`}</p>
            <p className="text-gray-400 text-xs capitalize">{bot.status}</p>
          </div>

          {/* Upgrade Button or Status */}
          {hasHopper ? (
            <div className="bg-cyan-400 text-black px-3 py-1 rounded text-xs font-bold">
              UPGRADED
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={!canAfford}
              className={`w-full px-3 py-1.5 rounded text-xs font-bold transition-all ${
                canAfford
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upgrade ${HOPPER_UPGRADE_COST}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-600" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-600 p-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🎒</span>
              Hopper Upgrade Station
            </h2>
            <p className="text-sm text-gray-400 mt-1">Upgrade bots for increased inventory capacity</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Balance Info */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Upgrade Cost</p>
              <p className="text-xl font-bold text-white">${HOPPER_UPGRADE_COST} per bot</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className={`text-xl font-bold ${gameState.player.money >= HOPPER_UPGRADE_COST ? 'text-green-400' : 'text-red-400'}`}>
                ${gameState.player.money}
              </p>
            </div>
          </div>

          {totalBots === 0 ? (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">No bots in this zone yet</p>
              <p className="text-gray-500 text-sm mt-2">Purchase bots from the shop to get started</p>
            </div>
          ) : (
            <>
              {/* Water Bots */}
              {waterBots.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">Water Bots ({waterBots.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {waterBots.map(bot => renderBotCard(bot, 'water'))}
                  </div>
                </div>
              )}

              {/* Harvest Bots */}
              {harvestBots.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-orange-400 mb-3">Harvest Bots ({harvestBots.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {harvestBots.map(bot => renderBotCard(bot, 'harvest'))}
                  </div>
                </div>
              )}

              {/* Transport Bots */}
              {transportBots.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Transport Bots ({transportBots.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {transportBots.map(bot => renderBotCard(bot, 'transport'))}
                  </div>
                </div>
              )}

              {/* Demolish Bots */}
              {demolishBots.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-3">Demolish Bots ({demolishBots.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {demolishBots.map(bot => renderBotCard(bot, 'demolish'))}
                  </div>
                </div>
              )}

              {/* Fertilizer Bots */}
              {fertilizerBots.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-lime-400 mb-3">Fertilizer Bot ({fertilizerBots.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {fertilizerBots.map(bot => renderBotCard(bot, 'fertilizer'))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-600 p-4 flex gap-3">
          {onRelocate && (
            <button
              onClick={() => {
                onRelocate();
                onClose();
              }}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📍 Relocate
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
