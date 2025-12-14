'use client';

import { useState } from 'react';
import { GameState, TransportBotConfig, FertilizerBotConfig } from '@/types/game';
import { WATERBOT_COST, HARVESTBOT_COST, SEEDBOT_COST, TRANSPORTBOT_COST, DEMOLISHBOT_COST, HUNTERBOT_COST, FERTILIZERBOT_COST, getBotCost } from '@/lib/gameEngine';
import Image from 'next/image';
import BotNameModal from './BotNameModal';
import TransportBotConfigModal from './TransportBotConfigModal';
import FertilizerBotConfigModal from './FertilizerBotConfigModal';

interface BotFactoryProps {
  gameState: GameState;
  onClose: () => void;
  onBuyWaterbots: (amount: number, name?: string) => void;
  onBuyHarvestbots: (amount: number, name?: string) => void;
  onBuySeedbots: (amount: number, name?: string) => void;
  onBuyTransportbots: (amount: number, name?: string, config?: TransportBotConfig) => void;
  onBuyDemolishbots: (amount: number, name?: string) => void;
  onBuyHunterbots: (amount: number, name?: string) => void;
  onBuyFertilizerbot: (name?: string, config?: FertilizerBotConfig) => void;
  onRelocate: () => void;
}

type BotType = 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'hunter' | 'fertilizer' | null;

export default function BotFactory({ gameState, onClose, onBuyWaterbots, onBuyHarvestbots, onBuySeedbots, onBuyTransportbots, onBuyDemolishbots, onBuyHunterbots, onBuyFertilizerbot, onRelocate }: BotFactoryProps) {
  const [namingBot, setNamingBot] = useState<BotType>(null);
  const [configuringTransportBot, setConfiguringTransportBot] = useState(false);
  const [transportBotName, setTransportBotName] = useState<string | undefined>(undefined);
  const [configuringFertilizerBot, setConfiguringFertilizerBot] = useState(false);
  const [fertilizerBotName, setFertilizerBotName] = useState<string | undefined>(undefined);
  // Calculate progressive costs based on how many bots are owned
  const waterbotCost = getBotCost(WATERBOT_COST, gameState.player.inventory.waterbots);
  const harvestbotCost = getBotCost(HARVESTBOT_COST, gameState.player.inventory.harvestbots);
  const seedbotCost = getBotCost(SEEDBOT_COST, gameState.player.inventory.seedbots);
  const transportbotCost = getBotCost(TRANSPORTBOT_COST, gameState.player.inventory.transportbots || 0);
  const demolishbotCost = getBotCost(DEMOLISHBOT_COST, gameState.player.inventory.demolishbots || 0);
  const hunterbotCost = getBotCost(HUNTERBOT_COST, gameState.player.inventory.hunterbots || 0);
  const fertilizerbotCost = FERTILIZERBOT_COST; // Fixed cost, only 1 allowed

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-orange-900 to-orange-950 text-white rounded-xl max-w-5xl w-full max-h-[95vh] border-2 md:border-4 border-orange-600 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 md:p-6 border-b border-orange-700/50">
          <h2 className="text-2xl md:text-4xl font-bold">🏭 Bot Factory</h2>
          <button
            onClick={onClose}
            className="text-4xl md:text-2xl hover:text-red-400 transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-4 text-lg md:text-xl font-bold bg-black/40 px-4 md:px-6 py-2 md:py-3 rounded-lg border-2 border-yellow-600/50">
            💰 Available Funds: ${gameState.player.money}
          </div>

          <div>
          <p className="text-gray-300 text-sm md:text-base mb-4 md:mb-6 leading-relaxed">
            Welcome to the Bot Factory! Each bot is a specialized farming assistant designed to automate specific tasks on your farm. Choose wisely and build your automated farming empire!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {/* Water Bot */}
            <div className={`bg-gradient-to-br from-cyan-900/40 to-blue-950/40 p-5 rounded-xl border-3 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.waterbots >= 3
                ? 'border-green-500 shadow-lg shadow-green-500/30'
                : 'border-cyan-500/50 shadow-lg shadow-cyan-500/20'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/water bot.png"
                    alt="Water Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.waterbots >= 3 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-2">Water Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Water Bot is your tireless hydration specialist. Equipped with advanced moisture sensors and a 12-gallon tank, it autonomously waters your crops to ensure optimal growth.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-cyan-400">Owned: {gameState.player.inventory.waterbots}/3</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-waters crops • ✓ 12-gallon capacity • ✓ Self-refilling
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.waterbots >= 3 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('water')}
                  disabled={gameState.player.money < WATERBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= WATERBOT_COST
                      ? 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= waterbotCost ? `Purchase for $${waterbotCost}` : `Insufficient Funds ($${waterbotCost})`}
                </button>
              )}
            </div>

            {/* Harvest Bot */}
            <div className={`bg-gradient-to-br from-amber-900/40 to-yellow-950/40 p-5 rounded-xl border-3 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.harvestbots >= 7
                ? 'border-green-500 shadow-lg shadow-green-500/30'
                : 'border-amber-500/50 shadow-lg shadow-amber-500/20'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/harvest bot.png"
                    alt="Harvest Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.harvestbots >= 7 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-amber-300 mb-2">Harvest Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Harvest Bot is a precision harvesting machine. With gentle mechanical arms and crop-detection AI, it collects mature crops and deposits them directly to your warehouse.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-amber-400">Owned: {gameState.player.inventory.harvestbots}/7</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-harvests crops • ✓ 8-slot inventory • ✓ Auto-deposits
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.harvestbots >= 7 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('harvest')}
                  disabled={gameState.player.money < HARVESTBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= HARVESTBOT_COST
                      ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= harvestbotCost ? `Purchase for $${harvestbotCost}` : `Insufficient Funds ($${harvestbotCost})`}
                </button>
              )}
            </div>

            {/* Seed Bot */}
            <div className={`bg-gradient-to-br from-green-900/40 to-emerald-950/40 p-5 rounded-xl border-3 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.seedbots >= 3
                ? 'border-yellow-500 shadow-lg shadow-yellow-500/30'
                : 'border-green-500/50 shadow-lg shadow-green-500/20'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/plant seeds.png"
                    alt="Seed Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.seedbots >= 3 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-300 mb-2">Seed Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Seed Bot is your intelligent planting assistant. Program up to 3 jobs with custom crop selections, and it will autonomously plant seeds across your farm zones.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-green-400">Owned: {gameState.player.inventory.seedbots}/3</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-plants seeds • ✓ 3 job slots • ✓ Auto-buy seeds option
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.seedbots >= 3 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('seed')}
                  disabled={gameState.player.money < SEEDBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= SEEDBOT_COST
                      ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= seedbotCost ? `Purchase for $${seedbotCost}` : `Insufficient Funds ($${seedbotCost})`}
                </button>
              )}
            </div>

            {/* Transport Bot */}
            <div className={`bg-gradient-to-br from-purple-900/40 to-indigo-950/40 p-5 rounded-xl border-3 shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.transportbots >= 1
                ? 'border-green-500 shadow-green-500/30'
                : 'border-purple-500/50'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/transport bot.png"
                    alt="Transport Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.transportbots >= 1 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">Transport Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Transport Bot is your logistics specialist. It automatically transports crops from your warehouse to the export station and handles all sales transactions.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-purple-400">Owned: {gameState.player.inventory.transportbots}/1</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-transports • ✓ Auto-sells • ✓ Large cargo capacity
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.transportbots >= 1 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('transport')}
                  disabled={gameState.player.money < TRANSPORTBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= TRANSPORTBOT_COST
                      ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= transportbotCost ? `Purchase for $${transportbotCost}` : `Insufficient Funds ($${transportbotCost})`}
                </button>
              )}
            </div>

            {/* Demolish Bot */}
            <div className={`bg-gradient-to-br from-orange-900/40 to-red-950/40 p-5 rounded-xl border-3 shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.demolishbots >= 3
                ? 'border-green-500 shadow-green-500/30'
                : 'border-orange-500/50'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/demolish-bot.png"
                    alt="Demolish Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.demolishbots >= 3 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-orange-300 mb-2">Demolish Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Demolish Bot is your heavy-duty clearing specialist. Equipped with powerful tools, it autonomously removes rocks and forests, keeping your farm clean and ready for expansion.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-orange-400">Owned: {gameState.player.inventory.demolishbots}/3</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Auto-clears rocks • ✓ Auto-clears forests • ✓ Fast clearing
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.demolishbots >= 3 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('demolish')}
                  disabled={gameState.player.money < DEMOLISHBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= DEMOLISHBOT_COST
                      ? 'bg-orange-600 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= demolishbotCost ? `Purchase for $${demolishbotCost}` : `Insufficient Funds ($${demolishbotCost})`}
                </button>
              )}
            </div>

            {/* Hunter Bot */}
            <div className={`bg-gradient-to-br from-amber-900/40 to-yellow-950/40 p-5 rounded-xl border-3 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.hunterbots >= 3
                ? 'border-green-500 shadow-green-500/30'
                : 'border-amber-500/50'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/hunter.png"
                    alt="Hunter Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.hunterbots >= 3 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      MAX
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-amber-300 mb-2">Hunter Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Hunter Bot is your rapid-response defense specialist. Equipped with advanced sensors and incredible speed, it detects and captures rabbits that try to eat your crops, escorting them safely off your farm.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">FLEET STATUS</span>
                  <span className="text-sm font-bold text-amber-400">Owned: {gameState.player.inventory.hunterbots}/3</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ Detects rabbits • ✓ Ultra-fast movement • ✓ Protects crops
                </div>
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.hunterbots >= 3 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ MAXIMUM FLEET CAPACITY
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('hunter')}
                  disabled={gameState.player.money < HUNTERBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= HUNTERBOT_COST
                      ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= hunterbotCost ? `Purchase for $${hunterbotCost}` : `Insufficient Funds ($${hunterbotCost})`}
                </button>
              )}
            </div>

            {/* Fertilizer Bot */}
            <div className={`bg-gradient-to-br from-green-900/40 to-emerald-950/40 p-5 rounded-xl border-3 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform duration-200 ${
              gameState.player.inventory.fertilizerbot >= 1
                ? 'border-green-500 shadow-green-500/30'
                : 'border-green-500/50'
            }`}>
              <div className="flex gap-4 mb-4">
                {/* Bot Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src="/fertilizer-bot.png"
                    alt="Fertilizer Bot"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                  {gameState.player.inventory.fertilizerbot >= 1 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      OWNED
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-300 mb-2">Fertilizer Bot</h3>
                  <p className="text-sm text-gray-300 leading-tight">
                    The Fertilizer Bot boosts your crop growth by 50%! It intelligently fertilizes watered crops based on your custom priority list, refills from the Fertilizer Building, and works tirelessly to maximize your harvests.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-black/40 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">SPECIAL UNIT</span>
                  <span className="text-sm font-bold text-green-400">Owned: {gameState.player.inventory.fertilizerbot}/1</span>
                </div>
                <div className="text-xs text-green-400">
                  ✓ 50% faster growth • ✓ Smart prioritization • ✓ Auto-refill
                </div>
                {gameState.player.inventory.fertilizerbot === 0 && (
                  <div className="text-xs text-yellow-400 mt-2">
                    ⚠ Requires Fertilizer Building to be placed first
                  </div>
                )}
              </div>

              {/* Buy Button */}
              {gameState.player.inventory.fertilizerbot >= 1 ? (
                <div className="w-full px-4 py-3 rounded-lg font-bold text-base bg-green-900/40 text-green-400 text-center border-2 border-green-500/50">
                  ✓ FERTILIZER BOT OWNED
                </div>
              ) : (
                <button
                  onClick={() => setNamingBot('fertilizer')}
                  disabled={gameState.player.money < FERTILIZERBOT_COST}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-base transition-all ${
                    gameState.player.money >= FERTILIZERBOT_COST
                      ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/50'
                      : 'bg-gray-700 cursor-not-allowed text-gray-500'
                  }`}
                >
                  {gameState.player.money >= fertilizerbotCost ? `Purchase for $${fertilizerbotCost}` : `Insufficient Funds ($${fertilizerbotCost})`}
                </button>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Sticky Footer with CTAs */}
        <div className="flex-shrink-0 border-t border-orange-700/50 p-4 md:p-6 bg-orange-950/50">
          <div className="flex gap-4">
            <button
              onClick={() => {
                onRelocate();
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-lg shadow-lg transition-colors"
            >
              🔄 Relocate Factory
            </button>

            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg shadow-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Bot Name Modal */}
      {namingBot && (
        <BotNameModal
          botType={
            namingBot === 'water' ? 'Water Bot' :
            namingBot === 'harvest' ? 'Harvest Bot' :
            namingBot === 'seed' ? 'Seed Bot' :
            namingBot === 'transport' ? 'Transport Bot' :
            namingBot === 'demolish' ? 'Demolish Bot' :
            namingBot === 'hunter' ? 'Hunter Bot' :
            'Fertilizer Bot'
          }
          onConfirm={(name) => {
            if (namingBot === 'water') onBuyWaterbots(1, name);
            else if (namingBot === 'harvest') onBuyHarvestbots(1, name);
            else if (namingBot === 'seed') onBuySeedbots(1, name);
            else if (namingBot === 'transport') {
              // Show config modal for transport bots
              setTransportBotName(name);
              setNamingBot(null);
              setConfiguringTransportBot(true);
            }
            else if (namingBot === 'demolish') onBuyDemolishbots(1, name);
            else if (namingBot === 'hunter') onBuyHunterbots(1, name);
            else if (namingBot === 'fertilizer') {
              // Show config modal for fertilizer bot
              setFertilizerBotName(name);
              setNamingBot(null);
              setConfiguringFertilizerBot(true);
            }

            // For non-config bots, close naming modal
            if (namingBot !== 'transport' && namingBot !== 'fertilizer') {
              setNamingBot(null);
            }
          }}
          onCancel={() => setNamingBot(null)}
        />
      )}

      {/* Transport Bot Config Modal */}
      {configuringTransportBot && (
        <TransportBotConfigModal
          gameState={gameState}
          botName={transportBotName}
          onSave={(config) => {
            onBuyTransportbots(1, transportBotName, config);
            setConfiguringTransportBot(false);
            setTransportBotName(undefined);
          }}
          onCancel={() => {
            setConfiguringTransportBot(false);
            setTransportBotName(undefined);
          }}
        />
      )}

      {/* Fertilizer Bot Config Modal */}
      {configuringFertilizerBot && (
        <FertilizerBotConfigModal
          botName={fertilizerBotName}
          onSave={(config) => {
            onBuyFertilizerbot(fertilizerBotName, config);
            setConfiguringFertilizerBot(false);
            setFertilizerBotName(undefined);
          }}
          onCancel={() => {
            setConfiguringFertilizerBot(false);
            setFertilizerBotName(undefined);
          }}
        />
      )}
    </div>
  );
}
