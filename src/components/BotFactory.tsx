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

type BotType = 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'hunter' | 'fertilizer';

interface CartItem {
  type: BotType;
  quantity: number;
}

const BOT_DATA = {
  water: {
    name: 'Water Bot',
    image: '/water bot.png',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    maxOwned: 3,
    feature: 'Auto-waters crops',
    capacity: '12-gallon tank',
  },
  harvest: {
    name: 'Harvest Bot',
    image: '/harvest bot.png',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    maxOwned: 7,
    feature: 'Auto-harvests',
    capacity: '8-slot inventory',
  },
  seed: {
    name: 'Seed Bot',
    image: '/plant seeds.png',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    maxOwned: 3,
    feature: 'Auto-plants seeds',
    capacity: '3 job slots',
  },
  transport: {
    name: 'Transport Bot',
    image: '/transport bot.png',
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-600',
    maxOwned: 1,
    feature: 'Auto-transports',
    capacity: 'Large cargo',
  },
  demolish: {
    name: 'Demolish Bot',
    image: '/demolish-bot.png',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    maxOwned: 3,
    feature: 'Clears obstacles',
    capacity: 'Heavy-duty',
  },
  hunter: {
    name: 'Hunter Bot',
    image: '/hunter.png',
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-600',
    maxOwned: 3,
    feature: 'Catches rabbits',
    capacity: 'Ultra-fast',
  },
  fertilizer: {
    name: 'Fertilizer Bot',
    image: '/fertilizer-bot.png',
    color: 'lime',
    gradient: 'from-lime-500 to-green-600',
    maxOwned: 1,
    feature: '+50% growth',
    capacity: 'Smart priority',
  },
};

export default function BotFactory({ gameState, onClose, onBuyWaterbots, onBuyHarvestbots, onBuySeedbots, onBuyTransportbots, onBuyDemolishbots, onBuyHunterbots, onBuyFertilizerbot, onRelocate }: BotFactoryProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'shopping' | 'naming' | 'config'>('shopping');
  const [currentBotIndex, setCurrentBotIndex] = useState(0);
  const [namingBot, setNamingBot] = useState<BotType | null>(null);
  const [configuringTransportBot, setConfiguringTransportBot] = useState(false);
  const [transportBotName, setTransportBotName] = useState<string | undefined>(undefined);
  const [configuringFertilizerBot, setConfiguringFertilizerBot] = useState(false);
  const [fertilizerBotName, setFertilizerBotName] = useState<string | undefined>(undefined);

  const getOwned = (type: BotType): number => {
    switch (type) {
      case 'water': return gameState.player.inventory.waterbots;
      case 'harvest': return gameState.player.inventory.harvestbots;
      case 'seed': return gameState.player.inventory.seedbots;
      case 'transport': return gameState.player.inventory.transportbots || 0;
      case 'demolish': return gameState.player.inventory.demolishbots || 0;
      case 'hunter': return gameState.player.inventory.hunterbots || 0;
      case 'fertilizer': return gameState.player.inventory.fertilizerbot || 0;
      default: return 0;
    }
  };

  const getCost = (type: BotType): number => {
    const owned = getOwned(type);
    switch (type) {
      case 'water': return getBotCost(WATERBOT_COST, owned);
      case 'harvest': return getBotCost(HARVESTBOT_COST, owned);
      case 'seed': return getBotCost(SEEDBOT_COST, owned);
      case 'transport': return getBotCost(TRANSPORTBOT_COST, owned);
      case 'demolish': return getBotCost(DEMOLISHBOT_COST, owned);
      case 'hunter': return getBotCost(HUNTERBOT_COST, owned);
      case 'fertilizer': return FERTILIZERBOT_COST;
      default: return 0;
    }
  };

  const addToCart = (type: BotType) => {
    const existingItem = cart.find(item => item.type === type);
    if (existingItem) {
      setCart(cart.map(item =>
        item.type === type ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { type, quantity: 1 }]);
    }
  };

  const removeFromCart = (type: BotType) => {
    const existingItem = cart.find(item => item.type === type);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.type === type ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.type !== type));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const costPerBot = getCost(item.type);
      return total + (costPerBot * item.quantity);
    }, 0);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const startCheckout = () => {
    if (cart.length === 0) return;
    setCurrentBotIndex(0);
    setCheckoutStep('naming');
    setNamingBot(cart[0].type);
  };

  const canAfford = (type: BotType) => {
    return gameState.player.money >= getCost(type);
  };

  const isMaxed = (type: BotType) => {
    return getOwned(type) >= BOT_DATA[type].maxOwned;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl max-w-7xl w-full max-h-[95vh] border-4 border-orange-500/50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b-2 border-orange-500/30 bg-gradient-to-r from-orange-900/40 to-red-900/40">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏭</div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">BOT FACTORY</h2>
              <p className="text-orange-300 text-sm">Select bots and add to cart</p>
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

        {/* Bot Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(Object.entries(BOT_DATA) as [BotType, typeof BOT_DATA[BotType]][]).map(([type, data]) => {
              const owned = getOwned(type);
              const cost = getCost(type);
              const maxed = isMaxed(type);
              const affordable = canAfford(type);
              const inCart = cart.find(item => item.type === type)?.quantity || 0;

              return (
                <div
                  key={type}
                  className={`relative bg-gradient-to-br ${data.gradient} p-1 rounded-2xl hover:scale-105 transition-transform ${
                    maxed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="bg-slate-900 rounded-xl p-4 h-full flex flex-col">
                    {/* Bot Image */}
                    <div className="relative w-full aspect-square mb-3">
                      <Image
                        src={data.image}
                        alt={data.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />

                      {/* Status Badge */}
                      {maxed ? (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          MAX
                        </div>
                      ) : inCart > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          {inCart} in cart
                        </div>
                      )}
                    </div>

                    {/* Bot Name */}
                    <h3 className="text-xl font-black text-center mb-2 text-white">
                      {data.name}
                    </h3>

                    {/* Stats */}
                    <div className="flex-1 space-y-1 mb-3">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="bg-white/10 px-2 py-1 rounded">{data.feature}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="bg-white/10 px-2 py-1 rounded">{data.capacity}</span>
                      </div>
                      <div className="text-center text-xs text-gray-400 mt-2">
                        Owned: {owned}/{data.maxOwned}
                      </div>
                    </div>

                    {/* Price & Add Button */}
                    {maxed ? (
                      <div className="w-full py-3 bg-green-900/50 text-green-300 rounded-lg font-bold text-center text-sm">
                        ✓ MAXED OUT
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-2">
                          <div className={`text-2xl font-black ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                            ${cost}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(type)}
                          disabled={!affordable}
                          className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                            affordable
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50'
                              : 'bg-gray-700 cursor-not-allowed text-gray-500'
                          }`}
                        >
                          {affordable ? '+ ADD TO CART' : 'INSUFFICIENT FUNDS'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shopping Cart Footer */}
        <div className="flex-shrink-0 border-t-2 border-orange-500/30 bg-gradient-to-r from-slate-900 to-slate-800 p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Cart Summary */}
            <div className="flex-1">
              {cart.length === 0 ? (
                <div className="text-gray-500 text-sm">🛒 Cart is empty - add bots above!</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cart.map(item => (
                    <div
                      key={item.type}
                      className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg"
                    >
                      <div className="w-8 h-8 relative">
                        <Image
                          src={BOT_DATA[item.type].image}
                          alt={BOT_DATA[item.type].name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-sm">{item.quantity}x</span>
                      <button
                        onClick={() => removeFromCart(item.type)}
                        className="text-red-400 hover:text-red-300 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total & Checkout */}
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase">Total ({cartItemCount} {cartItemCount === 1 ? 'bot' : 'bots'})</div>
                    <div className="text-3xl font-black text-yellow-400">${getCartTotal()}</div>
                  </div>

                  <button
                    onClick={startCheckout}
                    disabled={getCartTotal() > gameState.player.money}
                    className={`px-8 py-4 rounded-xl font-black text-xl transition-all ${
                      getCartTotal() <= gameState.player.money
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50'
                        : 'bg-gray-700 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    🛒 CHECKOUT
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  onRelocate();
                  onClose();
                }}
                className="px-6 py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold transition-colors"
              >
                📍 Relocate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Name Modal */}
      {namingBot && (
        <BotNameModal
          botType={namingBot}
          onConfirm={(name) => {
            if (namingBot === 'water') onBuyWaterbots(1, name);
            else if (namingBot === 'harvest') onBuyHarvestbots(1, name);
            else if (namingBot === 'seed') onBuySeedbots(1, name);
            else if (namingBot === 'transport') {
              setTransportBotName(name);
              setNamingBot(null);
              setConfiguringTransportBot(true);
            }
            else if (namingBot === 'demolish') onBuyDemolishbots(1, name);
            else if (namingBot === 'hunter') onBuyHunterbots(1, name);
            else if (namingBot === 'fertilizer') {
              setFertilizerBotName(name);
              setNamingBot(null);
              setConfiguringFertilizerBot(true);
            }

            if (namingBot !== 'transport' && namingBot !== 'fertilizer') {
              setNamingBot(null);
              setCart([]);
            }
          }}
          onCancel={() => {
            setNamingBot(null);
            setCart([]);
          }}
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
            setCart([]);
          }}
          onCancel={() => {
            setConfiguringTransportBot(false);
            setTransportBotName(undefined);
            setCart([]);
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
            setCart([]);
          }}
          onCancel={() => {
            setConfiguringFertilizerBot(false);
            setFertilizerBotName(undefined);
            setCart([]);
          }}
        />
      )}
    </div>
  );
}
