import { GameState } from '@/types/game';
import Image from 'next/image';

const SUPERCHARGE_BOT_COST = 500; // Cost to supercharge a single bot

interface SuperchargerModalProps {
  gameState: GameState;
  onClose: () => void;
  onSupercharge?: (botId: string, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'fertilizer') => void;
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

export default function SuperchargerModal({ gameState, onClose, onSupercharge, onRelocate }: SuperchargerModalProps) {
  // Get bots from current zone
  const currentZoneKey = `${gameState.currentZone.x},${gameState.currentZone.y}`;
  const currentZone = gameState.zones[currentZoneKey];

  const waterBots = currentZone?.waterBots || [];
  const harvestBots = currentZone?.harvestBots || [];
  const seedBots = currentZone?.seedBots || [];
  const transportBots = currentZone?.transportBots || [];
  const demolishBots = currentZone?.demolishBots || [];
  const fertilizerBot = currentZone?.fertilizerBot ? [currentZone.fertilizerBot] : [];

  const totalBots = waterBots.length + harvestBots.length + seedBots.length + transportBots.length + demolishBots.length + fertilizerBot.length;

  // Helper to render a bot card
  const renderBotCard = (bot: any, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'fertilizer') => {
    const config = BOT_CONFIG[botType];
    const isSupercharged = bot.supercharged === true;
    const canAfford = gameState.player.money >= SUPERCHARGE_BOT_COST;

    const handleUpgrade = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('Upgrading bot:', bot.id, botType);
      if (onSupercharge && canAfford && !isSupercharged) {
        onSupercharge(bot.id, botType);
      }
    };

    return (
      <div
        key={bot.id}
        className={`relative border-2 ${config.color} ${isSupercharged ? 'ring-2 ring-yellow-400' : ''} rounded-lg p-4 hover:shadow-lg transition-all`}
      >
        {isSupercharged && (
          <div className="absolute -top-2 -right-2 w-10 h-10">
            <Image src="/charged.png" alt="Supercharged" width={40} height={40} className="drop-shadow-lg" />
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          {/* Bot Image - Bigger */}
          <div className="w-24 h-24 relative">
            <Image
              src={config.image}
              alt={config.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Bot Info */}
          <div className="text-center">
            <p className="text-white text-sm font-semibold">{bot.name || config.name}</p>
            <p className="text-gray-400 text-xs capitalize">{bot.status}</p>
          </div>

          {/* Upgrade Button or Status */}
          {isSupercharged ? (
            <div className="bg-yellow-400 text-black px-4 py-2 rounded text-sm font-bold">
              ACTIVE
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={!canAfford}
              className={`w-full px-4 py-2 rounded text-sm font-bold transition-all ${
                canAfford
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upgrade ${SUPERCHARGE_BOT_COST}
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
              <Image src="/charged.png" alt="Supercharger" width={32} height={32} className="inline-block" />
              Supercharger Station
            </h2>
            <p className="text-sm text-gray-400 mt-1">Upgrade bots for 200% speed boost</p>
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
              <p className="text-xl font-bold text-white">${SUPERCHARGE_BOT_COST} per bot</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className={`text-xl font-bold ${gameState.player.money >= SUPERCHARGE_BOT_COST ? 'text-green-400' : 'text-red-400'}`}>
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
            <div>
              <h3 className="text-xl font-bold text-white mb-4">All Bots ({totalBots})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {waterBots.map(bot => renderBotCard(bot, 'water'))}
                {harvestBots.map(bot => renderBotCard(bot, 'harvest'))}
                {seedBots.map(bot => renderBotCard(bot, 'seed'))}
                {transportBots.map(bot => renderBotCard(bot, 'transport'))}
                {demolishBots.map(bot => renderBotCard(bot, 'demolish'))}
                {fertilizerBot.map(bot => renderBotCard(bot, 'fertilizer'))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-600 p-4 flex gap-3 justify-between">
          {onRelocate && (
            <button
              onClick={() => {
                onRelocate();
                onClose();
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              📍 Move Building
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
