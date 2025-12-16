'use client';

import { GameState } from '@/types/game';

interface GarageModalProps {
  gameState: GameState;
  onClose: () => void;
  onRelocate: () => void;
}

export default function GarageModal({ gameState, onClose, onRelocate }: GarageModalProps) {
  // Collect bots from all zones
  const allZones = Object.values(gameState.zones);

  const harvestBots = allZones.flatMap(zone => zone.harvestBots || []);
  const waterBots = allZones.flatMap(zone => zone.waterBots || []);
  const seedBots = allZones.flatMap(zone => zone.seedBots || []);
  const transportBots = allZones.flatMap(zone => zone.transportBots || []);
  const demolishBots = allZones.flatMap(zone => zone.demolishBots || []);

  const allBots = [...harvestBots, ...waterBots, ...seedBots, ...transportBots, ...demolishBots];
  const garagedBots = allBots.filter(bot => bot.status === 'garaged');
  const activeBots = allBots.filter(bot => bot.status !== 'garaged' && bot.status !== 'idle');
  const idleBots = allBots.filter(bot => bot.status === 'idle');

  // Detailed breakdown by bot type
  const botBreakdown = [
    {
      type: '💧 Water Bots',
      total: waterBots.length,
      active: waterBots.filter(b => b.status !== 'garaged' && b.status !== 'idle').length,
      idle: waterBots.filter(b => b.status === 'idle').length,
      garaged: waterBots.filter(b => b.status === 'garaged').length,
      emoji: '💧'
    },
    {
      type: '🌾 Harvest Bots',
      total: harvestBots.length,
      active: harvestBots.filter(b => b.status !== 'garaged' && b.status !== 'idle').length,
      idle: harvestBots.filter(b => b.status === 'idle').length,
      garaged: harvestBots.filter(b => b.status === 'garaged').length,
      emoji: '🌾'
    },
    {
      type: '🌱 Seed Bots',
      total: seedBots.length,
      active: seedBots.filter(b => b.status !== 'garaged' && b.status !== 'idle').length,
      idle: seedBots.filter(b => b.status === 'idle').length,
      garaged: seedBots.filter(b => b.status === 'garaged').length,
      emoji: '🌱'
    },
    {
      type: '🚚 Transport Bots',
      total: transportBots.length,
      active: transportBots.filter(b => b.status !== 'garaged' && b.status !== 'idle').length,
      idle: transportBots.filter(b => b.status === 'idle').length,
      garaged: transportBots.filter(b => b.status === 'garaged').length,
      emoji: '🚚'
    },
    {
      type: '💥 Demolish Bots',
      total: demolishBots.length,
      active: demolishBots.filter(b => b.status !== 'garaged' && b.status !== 'idle').length,
      idle: demolishBots.filter(b => b.status === 'idle').length,
      garaged: demolishBots.filter(b => b.status === 'garaged').length,
      emoji: '💥'
    },
  ].filter(bot => bot.total > 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 md:p-8 rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border-2 md:border-4 border-gray-600">
        <div className="flex justify-between items-center mb-4 md:mb-6 sticky top-0 bg-gradient-to-br from-gray-800 to-gray-900 pb-2 z-10">
          <h2 className="text-2xl md:text-3xl font-bold">🏗️ Bot Garage</h2>
          <button
            onClick={onClose}
            className="text-4xl md:text-2xl hover:text-red-400 transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Garage Description */}
        <div className="mb-4 md:mb-6 bg-black/40 p-4 md:p-6 rounded-lg border-2 border-gray-600">
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
          <div className="bg-black/30 p-3 md:p-4 rounded space-y-3">
            {/* Summary */}
            <div className="space-y-2 pb-3 border-b border-slate-600">
              <div className="text-base md:text-lg">
                🤖 <span className="font-bold">Total Bots:</span> {allBots.length}
              </div>
              <div className="text-base md:text-lg">
                ⚙️ <span className="font-bold">Active:</span> <span className="text-green-400">{activeBots.length}</span>
              </div>
              <div className="text-base md:text-lg">
                😴 <span className="font-bold">Idle:</span> <span className="text-yellow-400">{idleBots.length}</span>
              </div>
              <div className="text-base md:text-lg">
                🏗️ <span className="font-bold">Garaged:</span> <span className="text-blue-400">{garagedBots.length}</span>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm md:text-base font-bold text-slate-300">Bot Fleet Breakdown:</h4>
              {botBreakdown.map((bot) => (
                <div key={bot.type} className="flex items-center justify-between bg-black/20 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{bot.emoji}</span>
                    <span className="font-semibold">{bot.type.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="text-xs md:text-sm flex gap-2">
                    <div>
                      <span className="text-green-400 font-bold">{bot.active}</span>
                      <span className="text-slate-400"> active</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <div>
                      <span className="text-yellow-400 font-bold">{bot.idle}</span>
                      <span className="text-slate-400"> idle</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <div>
                      <span className="text-blue-400 font-bold">{bot.garaged}</span>
                      <span className="text-slate-400"> stored</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={onRelocate}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
          >
            📍 Move Building
          </button>
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
