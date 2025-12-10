import { GameState } from '@/types/game';

interface SuperchargerModalProps {
  gameState: GameState;
  onClose: () => void;
  onSupercharge?: (botId: any, botType: any) => void;
}

export default function SuperchargerModal({ gameState, onClose }: SuperchargerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 md:p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-4 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border-2 md:border-4 border-purple-400" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 pb-2 z-10">
          <h2 className="text-2xl md:text-4xl font-bold text-purple-100 flex items-center gap-2 md:gap-3">
            ⚡ Supercharger
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
            <p className="text-purple-100 text-sm md:text-lg leading-relaxed">
              The Supercharger Station doubles the speed of all bots in this zone!
              Bots working near this powerful energy source will complete their tasks twice as fast.
            </p>
          </div>

          {/* Active Bots */}
          <div className="bg-purple-950 bg-opacity-50 p-3 md:p-4 rounded-lg border-2 border-purple-600">
            <h3 className="text-xl md:text-2xl font-bold text-purple-200 mb-3 md:mb-4">🤖 Active Bots in Zone</h3>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-purple-900 p-2 md:p-3 rounded">
                <p className="text-purple-300 text-xs md:text-sm">Water Bots</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-400">{gameState.player.inventory.waterbots}</p>
                <p className="text-purple-400 text-xs mt-1">2x ⚡</p>
              </div>
              <div className="bg-purple-900 p-2 md:p-3 rounded">
                <p className="text-purple-300 text-xs md:text-sm">Harvest Bots</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-400">{gameState.player.inventory.harvestbots}</p>
                <p className="text-purple-400 text-xs mt-1">2x ⚡</p>
              </div>
              <div className="bg-purple-900 p-2 md:p-3 rounded">
                <p className="text-purple-300 text-xs md:text-sm">Seed Bots</p>
                <p className="text-2xl md:text-3xl font-bold text-green-400">{gameState.player.inventory.seedbots}</p>
                <p className="text-purple-400 text-xs mt-1">2x ⚡</p>
              </div>
              <div className="bg-purple-900 p-2 md:p-3 rounded">
                <p className="text-purple-300 text-xs md:text-sm">Transport Bots</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-400">{gameState.player.inventory.transportbots || 0}</p>
                <p className="text-purple-400 text-xs mt-1">2x ⚡</p>
              </div>
              <div className="bg-purple-900 p-2 md:p-3 rounded">
                <p className="text-purple-300 text-xs md:text-sm">Demolish Bots</p>
                <p className="text-2xl md:text-3xl font-bold text-red-400">{gameState.player.inventory.demolishbots || 0}</p>
                <p className="text-purple-400 text-xs mt-1">2x ⚡</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 md:p-4 rounded-lg text-center">
            <p className="text-purple-100 text-lg md:text-xl font-bold">
              ⚡ Supercharger Active ⚡
            </p>
            <p className="text-purple-200 text-xs md:text-sm mt-1">
              All bots operating at maximum efficiency!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 md:mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg text-base md:text-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
