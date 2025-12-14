'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO, SPRINKLER_COST, WATERBOT_COST, HARVESTBOT_COST, BAG_UPGRADE_COSTS, MAX_BAG_UPGRADES, BOT_FACTORY_COST, WELL_COST, GARAGE_COST, SUPERCHARGER_COST, FERTILIZER_BUILDING_COST } from '@/lib/gameEngine';

interface ShopProps {
  gameState: GameState;
  onClose: () => void;
  onBuySeeds: (crop: CropType, amount: number) => void;
  onBuyTool: (toolName: string) => void;
  onBuySprinklers: (amount: number) => void;
  onBuyWaterbots: (amount: number, name?: string) => void;
  onBuyHarvestbots: (amount: number, name?: string) => void;
  onUpgradeBag: () => void;
  onBuyBotFactory: () => void;
  onBuyWell: () => void;
  onBuyGarage: () => void;
  onBuySupercharger: () => void;
  onBuyFertilizerBuilding: () => void;
  onToggleAutoBuy: (crop: Exclude<CropType, null>) => void;
}

type ItemType =
  | { category: 'building'; name: 'botFactory' | 'well' | 'garage' | 'supercharger' | 'fertilizerBuilding' }
  | { category: 'tool'; name: 'sprinkler' }
  | { category: 'upgrade'; tier: number };

interface CartItem {
  type: ItemType;
  quantity: number;
}

export default function Shop({ gameState, onClose, onBuySeeds, onBuyTool, onBuySprinklers, onBuyWaterbots, onBuyHarvestbots, onUpgradeBag, onBuyBotFactory, onBuyWell, onBuyGarage, onBuySupercharger, onBuyFertilizerBuilding, onToggleAutoBuy }: ShopProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'buildings' | 'tools'>('buildings');

  const itemInCart = (type: ItemType): boolean => {
    return cart.some(item => JSON.stringify(item.type) === JSON.stringify(type));
  };

  const toggleCart = (type: ItemType) => {
    const itemKey = JSON.stringify(type);
    const existingIndex = cart.findIndex(item => JSON.stringify(item.type) === itemKey);

    if (existingIndex >= 0) {
      setCart(cart.filter((_, i) => i !== existingIndex));
    } else {
      setCart([...cart, { type, quantity: 1 }]);
    }
  };

  const updateQuantity = (type: ItemType, delta: number) => {
    const itemKey = JSON.stringify(type);
    setCart(cart.map(item => {
      if (JSON.stringify(item.type) === itemKey) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const getItemCost = (type: ItemType): number => {
    if (type.category === 'building') {
      const costs = {
        botFactory: BOT_FACTORY_COST,
        well: WELL_COST,
        garage: GARAGE_COST,
        supercharger: SUPERCHARGER_COST,
        fertilizerBuilding: FERTILIZER_BUILDING_COST,
      };
      return costs[type.name];
    } else if (type.category === 'tool') {
      return SPRINKLER_COST;
    } else if (type.category === 'upgrade') {
      return BAG_UPGRADE_COSTS[type.tier];
    }
    return 0;
  };

  const getTotalCost = (): number => {
    return cart.reduce((sum, item) => sum + (getItemCost(item.type) * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Process all purchases
    cart.forEach(item => {
      if (item.type.category === 'building') {
        for (let i = 0; i < item.quantity; i++) {
          if (item.type.name === 'botFactory') onBuyBotFactory();
          else if (item.type.name === 'well') onBuyWell();
          else if (item.type.name === 'garage') onBuyGarage();
          else if (item.type.name === 'supercharger') onBuySupercharger();
          else if (item.type.name === 'fertilizerBuilding') onBuyFertilizerBuilding();
        }
      } else if (item.type.category === 'tool') {
        onBuySprinklers(item.quantity);
      } else if (item.type.category === 'upgrade') {
        onUpgradeBag();
      }
    });
    setCart([]);
    onClose();
  };

  const canAffordCart = getTotalCost() <= gameState.player.money;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 text-white rounded-xl max-w-6xl w-full max-h-[90vh] border-4 border-amber-600 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm border-b border-amber-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            <div>
              <h2 className="text-3xl font-bold text-amber-300">Farm Shop</h2>
              <p className="text-sm text-amber-200/70">Your Money: 💰 ${gameState.player.money}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none px-3 py-1 hover:bg-white/10 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm border-b border-amber-500/20 flex gap-2 p-2">
          <button
            onClick={() => setActiveTab('buildings')}
            className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
              activeTab === 'buildings'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-black/40 text-amber-200 hover:bg-black/60'
            }`}
          >
            🏗️ Buildings
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
              activeTab === 'tools'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-black/40 text-amber-200 hover:bg-black/60'
            }`}
          >
            🔧 Tools & Upgrades
          </button>
        </div>

        {/* Scrollable Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Buildings Tab */}
          {activeTab === 'buildings' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Bot Factory */}
              {renderBuildingCard(
                { category: 'building', name: 'botFactory' },
                'Bot Factory',
                '/mechanic.png',
                'Build bots',
                BOT_FACTORY_COST,
                gameState.player.inventory.botFactory >= 1,
                gameState.player.inventory.botFactoryPlaced,
                'border-purple-500'
              )}

              {/* Well */}
              {renderBuildingCard(
                { category: 'building', name: 'well' },
                'Water Well',
                '/well.png',
                'Bot refill',
                WELL_COST,
                gameState.player.inventory.well >= 1,
                gameState.player.inventory.wellPlaced,
                'border-blue-500'
              )}

              {/* Garage */}
              {renderBuildingCard(
                { category: 'building', name: 'garage' },
                'Garage',
                '/garage.png',
                'Bot parking',
                GARAGE_COST,
                (gameState.player.inventory.garage ?? 0) >= 1,
                gameState.player.inventory.garagePlaced,
                'border-orange-500'
              )}

              {/* Supercharger */}
              {renderBuildingCard(
                { category: 'building', name: 'supercharger' },
                'Supercharger',
                '/supercharge.png',
                '+200% speed',
                SUPERCHARGER_COST,
                (gameState.player.inventory.supercharger ?? 0) >= 1,
                gameState.player.inventory.superchargerPlaced,
                'border-purple-400'
              )}

              {/* Fertilizer Building */}
              {renderBuildingCard(
                { category: 'building', name: 'fertilizerBuilding' },
                'Fertilizer Building',
                '/fertilizer-building.png',
                'Refill bot',
                FERTILIZER_BUILDING_COST,
                (gameState.player.inventory.fertilizerBuilding ?? 0) >= 1,
                gameState.player.inventory.fertilizerBuildingPlaced,
                'border-lime-500'
              )}
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Basket Upgrades */}
              {[0, 1, 2].map((tier) => {
                const currentUpgrades = gameState.player.bagUpgrades || 0;
                const isOwned = currentUpgrades > tier;
                const isCurrent = currentUpgrades === tier;
                const isLocked = currentUpgrades < tier;
                const itemType: ItemType = { category: 'upgrade', tier };
                const inCart = itemInCart(itemType);
                const canAfford = gameState.player.money >= BAG_UPGRADE_COSTS[tier];

                return (
                  <div
                    key={tier}
                    className={`bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-lg border-2 ${
                      isOwned
                        ? 'border-green-600'
                        : inCart
                        ? 'border-blue-400 ring-2 ring-blue-300'
                        : isCurrent
                        ? 'border-blue-500'
                        : 'border-gray-600 opacity-50'
                    } p-3 flex flex-col items-center`}
                  >
                    <div className="text-5xl mb-2">
                      {isOwned ? '✓' : isLocked ? '🔒' : '🎒'}
                    </div>
                    <div className="text-sm font-bold text-center mb-1">
                      Basket Tier {tier + 1}
                    </div>
                    <div className="text-xs text-center text-green-400 mb-2">
                      +4 capacity
                    </div>
                    {isOwned ? (
                      <div className="w-full px-3 py-2 rounded text-xs font-bold bg-green-900/40 text-green-400 text-center">
                        Owned
                      </div>
                    ) : isCurrent ? (
                      <button
                        onClick={() => toggleCart(itemType)}
                        disabled={!canAfford && !inCart}
                        className={`w-full px-2 py-1 rounded text-xs font-bold ${
                          inCart
                            ? 'bg-red-600 hover:bg-red-700'
                            : canAfford
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {inCart ? '− REMOVE' : `+ ADD $${BAG_UPGRADE_COSTS[tier]}`}
                      </button>
                    ) : (
                      <div className="w-full px-3 py-2 rounded text-xs font-bold bg-gray-800/40 text-gray-500 text-center">
                        Locked
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Sprinklers */}
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg border-2 border-cyan-600 p-3 flex flex-col items-center">
                <div className="w-20 h-20 mb-2 relative">
                  <Image src="/sprinkler.png" alt="Sprinkler" width={80} height={80} className="object-contain" />
                </div>
                <div className="text-sm font-bold text-center mb-1">Sprinklers</div>
                <div className="text-xs text-center text-cyan-300 mb-1">Auto-waters 5×5</div>
                <div className="text-xs text-blue-400 mb-2">Owned: {gameState.player.inventory.sprinklers}</div>
                <button
                  onClick={() => toggleCart({ category: 'tool', name: 'sprinkler' })}
                  disabled={gameState.player.money < SPRINKLER_COST && !itemInCart({ category: 'tool', name: 'sprinkler' })}
                  className={`w-full px-2 py-1 rounded text-xs font-bold ${
                    itemInCart({ category: 'tool', name: 'sprinkler' })
                      ? 'bg-red-600 hover:bg-red-700'
                      : gameState.player.money >= SPRINKLER_COST
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {itemInCart({ category: 'tool', name: 'sprinkler' }) ? '− REMOVE' : `+ ADD $${SPRINKLER_COST}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm border-t-2 border-amber-500 p-4 space-y-3">
            {/* Cart Items */}
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {cart.map((item, index) => {
                const cost = getItemCost(item.type);
                let name = '';
                if (item.type.category === 'building') {
                  const names = { botFactory: 'Bot Factory', well: 'Well', garage: 'Garage', supercharger: 'Supercharger', fertilizerBuilding: 'Fertilizer Bldg' };
                  name = names[item.type.name];
                } else if (item.type.category === 'tool') {
                  name = 'Sprinkler';
                } else if (item.type.category === 'upgrade') {
                  name = `Basket T${item.type.tier + 1}`;
                }

                return (
                  <div key={index} className="bg-amber-800/60 px-3 py-1 rounded flex items-center gap-2 border border-amber-600">
                    <span className="text-sm font-bold text-amber-100">{name}</span>
                    {item.type.category === 'tool' ? (
                      <>
                        <button
                          onClick={() => updateQuantity(item.type, -1)}
                          className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="text-xs text-amber-200">×{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.type, 1)}
                          className="w-5 h-5 bg-green-600 hover:bg-green-700 rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-amber-300">${cost}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checkout Row */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setCart([])}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white"
              >
                Cancel
              </button>
              <div className="flex-1 text-right">
                <div className="text-2xl font-bold text-amber-300">
                  Total: ${getTotalCost()}
                </div>
                {!canAffordCart && (
                  <div className="text-xs text-red-400">Not enough money!</div>
                )}
              </div>
              <button
                onClick={handleCheckout}
                disabled={!canAffordCart}
                className={`px-8 py-3 rounded-lg font-bold text-lg ${
                  canAffordCart
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Checkout ({cart.length})
              </button>
            </div>
          </div>
        )}

        {/* Close Button (when cart empty) */}
        {cart.length === 0 && (
          <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm border-t border-amber-500/30 p-4">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
            >
              Close Shop
            </button>
          </div>
        )}
      </div>
    </div>
  );

  function renderBuildingCard(
    itemType: ItemType,
    name: string,
    image: string,
    description: string,
    cost: number,
    owned: boolean,
    placed: boolean | undefined,
    borderColor: string
  ) {
    const inCart = itemInCart(itemType);
    const canAfford = gameState.player.money >= cost;

    return (
      <div
        className={`bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg border-2 ${
          owned ? 'border-green-600' : inCart ? `${borderColor} ring-2 ring-white/30` : borderColor
        } p-3 flex flex-col items-center transition-all hover:scale-105`}
      >
        <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
          {owned ? (
            <span className="text-5xl">✓</span>
          ) : (
            <Image src={image} alt={name} width={80} height={80} className="object-contain" />
          )}
        </div>
        <div className="text-sm font-bold text-center mb-1">{name}</div>
        <div className="text-xs text-center text-purple-300 mb-2">{description}</div>
        {owned ? (
          <div className="w-full px-3 py-2 rounded text-xs font-bold bg-green-900/40 text-green-400 text-center">
            {placed ? 'Placed' : 'Place It!'}
          </div>
        ) : (
          <button
            onClick={() => toggleCart(itemType)}
            disabled={!canAfford && !inCart}
            className={`w-full px-2 py-1 rounded text-xs font-bold ${
              inCart
                ? 'bg-red-600 hover:bg-red-700'
                : canAfford
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {inCart ? '− REMOVE' : `+ ADD $${cost}`}
          </button>
        )}
      </div>
    );
  }
}

