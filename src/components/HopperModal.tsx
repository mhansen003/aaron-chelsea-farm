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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border-4 border-cyan-500/50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-900/40 to-blue-900/40">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎒</div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">HOPPER UPGRADES</h2>
              <p className="text-cyan-300 text-sm">Upgrade bots for increased inventory capacity</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Info Banner */}
          <div className="bg-cyan-900/40 border border-cyan-500/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-cyan-300">Upgrade Cost</p>
              <p className="text-xl font-bold text-white">${HOPPER_UPGRADE_COST} per bot</p>
            </div>
            <div className="bg-black/40 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Effect</p>
              <p className="text-lg font-black text-yellow-400">+Inventory</p>
            </div>
          </div>

          {totalBots === 0 ? (
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">No bots in this zone yet</p>
              <p className="text-gray-500 text-sm mt-2">Purchase bots from the Bot Factory to get started</p>
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
        <div className="flex-shrink-0 border-t-2 border-cyan-500/30 bg-gradient-to-r from-slate-900 to-slate-800 p-6">
          <div className="flex items-center justify-between gap-4">
            {onRelocate && (
              <button
                onClick={() => {
                  onRelocate();
                  onClose();
                }}
                className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-bold text-sm transition-colors"
              >
                📍 Move Building
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-colors ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
