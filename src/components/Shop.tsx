'use client';

import { useState } from 'react';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO, SPRINKLER_COST, WATERBOT_COST, HARVESTBOT_COST, BAG_UPGRADE_COST, MECHANIC_SHOP_COST } from '@/lib/gameEngine';

interface ShopProps {
  gameState: GameState;
  onClose: () => void;
  onBuySeeds: (crop: CropType, amount: number) => void;
  onBuyTool: (toolName: string) => void;
  onBuySprinklers: (amount: number) => void;
  onBuyWaterbots: (amount: number) => void;
  onBuyHarvestbots: (amount: number) => void;
  onUpgradeBag: () => void;
  onBuyMechanicShop: () => void;
}

const SEED_INFO = {
  carrot: { name: 'Carrot Seeds', emoji: '🥕', daysToGrow: 1 },
  wheat: { name: 'Wheat Seeds', emoji: '🌾', daysToGrow: 1 },
  tomato: { name: 'Tomato Seeds', emoji: '🍅', daysToGrow: 2 },
};

type ShopTab = 'seeds' | 'tools' | 'robots' | 'animals';

export default function Shop({ gameState, onClose, onBuySeeds, onBuyTool, onBuySprinklers, onBuyWaterbots, onBuyHarvestbots, onUpgradeBag, onBuyMechanicShop }: ShopProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('seeds');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border-4 border-amber-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🏪 Farm Shop</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-xl font-bold bg-black/30 px-4 py-2 rounded">
          Your Money: 💰 ${gameState.player.money}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('seeds')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'seeds'
                ? 'bg-green-600 ring-2 ring-green-300'
                : 'bg-black/40 hover:bg-black/60'
            }`}
          >
            🌱 Seeds
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'tools'
                ? 'bg-blue-600 ring-2 ring-blue-300'
                : 'bg-black/40 hover:bg-black/60'
            }`}
          >
            🛠️ Tools
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'robots'
                ? 'bg-purple-600 ring-2 ring-purple-300'
                : 'bg-black/40 hover:bg-black/60'
            }`}
          >
            🤖 Robots
          </button>
          <button
            onClick={() => setActiveTab('animals')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'animals'
                ? 'bg-pink-600 ring-2 ring-pink-300'
                : 'bg-black/40 hover:bg-black/60'
            }`}
          >
            🐄 Animals
          </button>
        </div>

        {/* Seeds Tab Content */}
        {activeTab === 'seeds' && (
        <div className="mb-6">
          <div className="grid gap-4">
            {Object.entries(SEED_INFO).map(([cropKey, info]) => {
              const crop = cropKey as Exclude<CropType, null>;
              const owned = gameState.player.inventory.seeds[crop];
              const cropInfo = CROP_INFO[crop];
              const canBuy1 = gameState.player.money >= cropInfo.seedCost;
              const canBuy5 = gameState.player.money >= cropInfo.seedCost * 5;

              return (
                <div
                  key={crop}
                  className="bg-black/40 p-4 rounded-lg border-2 border-amber-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-2xl mr-2">{info.emoji}</span>
                      <span className="font-bold">{info.name}</span>
                    </div>
                    <div className="text-amber-300 font-bold">${cropInfo.seedCost} each</div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="text-green-400">Grows in: {info.daysToGrow} day{info.daysToGrow > 1 ? 's' : ''}</span>
                    {' • '}
                    <span className="text-purple-400">Sells for: ${cropInfo.sellPrice}</span>
                    {' • '}
                    <span className="text-blue-400">Owned: {owned}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBuySeeds(crop, 1)}
                      disabled={!canBuy1}
                      className={`px-4 py-2 rounded font-bold flex-1 ${
                        canBuy1
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Buy 1
                    </button>
                    <button
                      onClick={() => onBuySeeds(crop, 5)}
                      disabled={!canBuy5}
                      className={`px-4 py-2 rounded font-bold flex-1 ${
                        canBuy5
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Buy 5 (${cropInfo.seedCost * 5})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Tools Tab Content */}
        {activeTab === 'tools' && (
        <div>
          <div className="grid gap-4">
            {/* Basket Upgrade */}
            <div className="bg-black/40 p-4 rounded-lg border-2 border-amber-700">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-2xl mr-2">🎒</span>
                  <span className="font-bold">Basket Upgrade</span>
                </div>
                <div className="text-amber-300 font-bold">${BAG_UPGRADE_COST}</div>
              </div>
              <div className="text-sm mb-2 text-gray-300">
                Additional inventory for harvesting
                {' • '}
                <span className="text-green-400">+4 basket capacity</span>
                {' • '}
                <span className="text-blue-400">Current: {gameState.player.basketCapacity}</span>
              </div>
              <button
                onClick={() => onUpgradeBag()}
                disabled={gameState.player.money < BAG_UPGRADE_COST}
                className={`px-4 py-2 rounded font-bold w-full ${
                  gameState.player.money >= BAG_UPGRADE_COST
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Upgrade Basket
              </button>
            </div>

            {/* Mechanic Shop */}
            <div className={`p-4 rounded-lg border-2 ${
              gameState.player.inventory.mechanicShop >= 1
                ? 'bg-green-900/40 border-green-600'
                : 'bg-black/40 border-amber-700'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-2xl mr-2">⚙️</span>
                  <span className="font-bold">Mechanic Shop</span>
                </div>
                {gameState.player.inventory.mechanicShop >= 1 ? (
                  <span className="text-green-400 font-bold">✓ OWNED</span>
                ) : (
                  <span className="text-amber-300 font-bold">${MECHANIC_SHOP_COST}</span>
                )}
              </div>
              <div className="text-sm mb-2 text-gray-300">
                Unlock bot purchases (watering, planting, harvesting)
                {' • '}
                <span className="text-purple-400">Limit 1</span>
                {' • '}
                {gameState.player.inventory.mechanicShopPlaced ? (
                  <span className="text-green-400">Installed</span>
                ) : gameState.player.inventory.mechanicShop >= 1 ? (
                  <span className="text-yellow-400">Ready to place!</span>
                ) : null}
              </div>
              {gameState.player.inventory.mechanicShop < 1 && (
                <button
                  onClick={() => onBuyMechanicShop()}
                  disabled={gameState.player.money < MECHANIC_SHOP_COST}
                  className={`px-4 py-2 rounded font-bold w-full ${
                    gameState.player.money >= MECHANIC_SHOP_COST
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  Buy Mechanic Shop
                </button>
              )}
            </div>

            {/* Water Sprinkler Tool */}
            {gameState.tools.filter(tool => tool.name === 'water_sprinkler').map(tool => (
              <div
                key={tool.name}
                className={`p-4 rounded-lg border-2 ${
                  tool.unlocked
                    ? 'bg-green-900/40 border-green-600'
                    : 'bg-black/40 border-amber-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold capitalize">
                    {tool.name.replace('_', ' ')}
                  </span>
                  {tool.unlocked ? (
                    <span className="text-green-400 font-bold">✓ OWNED</span>
                  ) : (
                    <span className="text-amber-300 font-bold">${tool.cost}</span>
                  )}
                </div>
                <div className="text-sm mb-2 text-gray-300">{tool.description}</div>
                {!tool.unlocked && (
                  <button
                    onClick={() => onBuyTool(tool.name)}
                    disabled={gameState.player.money < tool.cost}
                    className={`px-4 py-2 rounded font-bold w-full ${
                      gameState.player.money >= tool.cost
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Buy Tool
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Robots Tab Content */}
        {activeTab === 'robots' && (
        <div className="mb-6">

          {/* Mechanic Shop Required Message for Bots */}
          {!gameState.player.inventory.mechanicShopPlaced && (
            <div className="bg-purple-900/50 border-2 border-purple-500 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                <div>
                  <div className="font-bold text-lg text-purple-200">Advanced Bots Require Mechanic Shop</div>
                  <div className="text-sm text-purple-300 mt-1">
                    {gameState.player.inventory.mechanicShop >= 1 ? (
                      <span>You own a mechanic shop! Place it on your farm to unlock bot purchases.</span>
                    ) : (
                      <span>Purchase and install a Mechanic Shop from the Tools tab to unlock Water Bots and Harvest Bots!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sprinklers */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-amber-700 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">💦</span>
                <span className="font-bold">Auto Sprinkler</span>
              </div>
              <div className="text-amber-300 font-bold">${SPRINKLER_COST} each</div>
            </div>
            <div className="text-sm mb-2">
              <span className="text-green-400">Auto-waters 5x5 area daily</span>
              {' • '}
              <span className="text-blue-400">Owned: {gameState.player.inventory.sprinklers}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onBuySprinklers(1)}
                disabled={gameState.player.money < SPRINKLER_COST}
                className={`px-4 py-2 rounded font-bold flex-1 ${
                  gameState.player.money >= SPRINKLER_COST
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Buy 1
              </button>
              <button
                onClick={() => onBuySprinklers(3)}
                disabled={gameState.player.money < SPRINKLER_COST * 3}
                className={`px-4 py-2 rounded font-bold flex-1 ${
                  gameState.player.money >= SPRINKLER_COST * 3
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Buy 3 (${SPRINKLER_COST * 3})
              </button>
            </div>
          </div>

          {/* Water Bots - Only available if mechanic shop is placed */}
          {gameState.player.inventory.mechanicShopPlaced ? (
            <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-gray-600 mb-4 opacity-60">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-bold">Water Bot</span>
                </div>
                <div className="text-gray-400 font-bold">Visit Mechanic Shop</div>
              </div>
              <div className="text-sm mb-2 text-gray-400">
                Available at your Mechanic Shop building
                {' • '}
                <span className="text-blue-400">Owned: {gameState.player.inventory.waterbots}</span>
              </div>
              <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
                Buy at Mechanic Shop
              </button>
            </div>
          ) : (
            <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-gray-600 mb-4 opacity-60">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-bold">Water Bot</span>
                </div>
                <div className="text-gray-400 font-bold">🔒 Locked</div>
              </div>
              <div className="text-sm mb-2 text-gray-400">
                Requires Mechanic Shop to be placed
              </div>
              <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
                Mechanic Shop Required
              </button>
            </div>
          )}

          {/* Harvest Bots - Only available if mechanic shop is placed */}
          {gameState.player.inventory.mechanicShopPlaced ? (
            <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-gray-600 opacity-60">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-bold">Harvest Bot</span>
                </div>
                <div className="text-gray-400 font-bold">Visit Mechanic Shop</div>
              </div>
              <div className="text-sm mb-2 text-gray-400">
                Available at your Mechanic Shop building
                {' • '}
                <span className="text-blue-400">Owned: {gameState.player.inventory.harvestbots}</span>
              </div>
              <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
                Buy at Mechanic Shop
              </button>
            </div>
          ) : (
            <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-gray-600 opacity-60">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-bold">Harvest Bot</span>
                </div>
                <div className="text-gray-400 font-bold">🔒 Locked</div>
              </div>
              <div className="text-sm mb-2 text-gray-400">
                Requires Mechanic Shop to be placed
              </div>
              <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
                Mechanic Shop Required
              </button>
            </div>
          )}
        </div>
        )}

        {/* Animals Tab Content */}
        {activeTab === 'animals' && (
        <div className="mb-6">
          {/* Cows */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-gray-600 mb-4 opacity-60">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">🐄</span>
                <span className="font-bold">Cows</span>
              </div>
              <span className="text-gray-400 font-bold">Coming Soon</span>
            </div>
            <div className="text-sm mb-2 text-gray-400">
              Produce milk daily for extra income
            </div>
            <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
              Not Available Yet
            </button>
          </div>

          {/* Sheep */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-gray-600 mb-4 opacity-60">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">🐑</span>
                <span className="font-bold">Sheep</span>
              </div>
              <span className="text-gray-400 font-bold">Coming Soon</span>
            </div>
            <div className="text-sm mb-2 text-gray-400">
              Produce wool that can be sold or processed
            </div>
            <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
              Not Available Yet
            </button>
          </div>

          {/* Chickens */}
          <div className="bg-black/40 p-4 rounded-lg border-2 border-gray-600 opacity-60">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-2xl mr-2">🐔</span>
                <span className="font-bold">Chickens</span>
              </div>
              <span className="text-gray-400 font-bold">Coming Soon</span>
            </div>
            <div className="text-sm mb-2 text-gray-400">
              Lay eggs daily that can be sold
            </div>
            <button disabled className="px-4 py-2 rounded font-bold w-full bg-gray-600 cursor-not-allowed">
              Not Available Yet
            </button>
          </div>
        </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
        >
          Close Shop
        </button>
      </div>
    </div>
  );
}
