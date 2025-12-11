'use client';

import { GameState } from '@/types/game';

interface GarageModalProps {
  gameState: GameState;
  onClose: () => void;
  onRelocate: () => void;
}

export default function GarageModal({ gameState, onClose, onRelocate }: GarageModalProps) {
  // Count idle bots
  const harvestBots = gameState.harvestBots || [];
  const waterBots = gameState.waterBots || [];
  const seedBots = gameState.seedBots || [];
  const transportBots = gameState.transportBots || [];
  const demolishBots = gameState.demolishBots || [];

  const allBots = [...harvestBots, ...waterBots, ...seedBots, ...transportBots, ...demolishBots];
  const idleBots = allBots.filter(bot => bot.status === 'idle');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-4 md:p-8 rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border-2 md:border-4 border-slate-500">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-gradient-to-br from-slate-700 to-slate-900 pb-2 z-10">
          <h2 className="text-2xl md:text-3xl font-bold">🏗️ Bot Garage</h2>
          <button
            onClick={onClose}
            className="text-4xl md:text-2xl hover:text-red-400 transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Garage Description */}
        <div className="mb-4 md:mb-6 bg-black/40 p-4 md:p-6 rounded-lg border-2 border-slate-400">
          <p className="text-base md:text-lg leading-relaxed mb-3 md:mb-4">
            Welcome to your <span className="font-bold text-blue-300">Bot Garage</span> – the central hub where your tireless mechanical workers rest and recharge between tasks. When bots complete their assignments and find themselves idle, they automatically navigate back here to await new orders.
          </p>
          <p className="text-sm md:text-base leading-relaxed text-slate-300">
            The garage serves as both a maintenance facility and a coordination center. Think of it as mission control for your automated workforce. Keep it centrally located for optimal efficiency, ensuring bots don&apos;t waste precious time traveling long distances between their work zones and home base.
          </p>
        </div>

        {/* Bot Status */}
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-blue-300">Current Status:</h3>
          <div className="bg-black/30 p-3 md:p-4 rounded space-y-2">
            <div className="text-base md:text-lg">
              🤖 <span className="font-bold">Total Bots:</span> {allBots.length}
            </div>
            <div className="text-base md:text-lg">
              😴 <span className="font-bold">Idle Bots:</span> {idleBots.length}
            </div>
            <div className="text-base md:text-lg">
              ⚙️ <span className="font-bold">Working Bots:</span> {allBots.length - idleBots.length}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 md:gap-4">
          <button
            onClick={onRelocate}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-base md:text-lg"
          >
            📍 Relocate Garage
          </button>
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-base md:text-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
