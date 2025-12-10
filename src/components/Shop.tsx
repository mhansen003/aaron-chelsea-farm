'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO, SPRINKLER_COST, WATERBOT_COST, HARVESTBOT_COST, BAG_UPGRADE_COSTS, MAX_BAG_UPGRADES, MECHANIC_SHOP_COST, WELL_COST, GARAGE_COST } from '@/lib/gameEngine';

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
  onBuyWell: () => void;
  onBuyGarage: () => void;
  onToggleAutoBuy: (crop: Exclude<CropType, null>) => void;
}

const SEED_INFO = {
  carrot: { name: 'Carrot Seeds', emoji: '🥕', daysToGrow: 1 },
  wheat: { name: 'Wheat Seeds', emoji: '🌾', daysToGrow: 1 },
  tomato: { name: 'Tomato Seeds', emoji: '🍅', daysToGrow: 2 },
};

type ShopTab = 'seeds' | 'tools';

export default function Shop({ gameState, onClose, onBuySeeds, onBuyTool, onBuySprinklers, onBuyWaterbots, onBuyHarvestbots, onUpgradeBag, onBuyMechanicShop, onBuyWell, onBuyGarage, onToggleAutoBuy }: ShopProps) {
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
            🛠️ Tools & Buildings
          </button>
        </div>

        {/* Seeds Tab Content */}
        {activeTab === 'seeds' && (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(SEED_INFO).map(([cropKey, info]) => {
              const crop = cropKey as Exclude<CropType, null>;
              const owned = gameState.player.inventory.seeds[crop];
              const cropInfo = CROP_INFO[crop];
              const canBuy1 = gameState.player.money >= cropInfo.seedCost;
              const autoBuyEnabled = gameState.player.autoBuy[crop];

              return (
                <div
                  key={crop}
                  className="bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 border-amber-600 flex flex-col items-center"
                >
                  {/* Icon */}
                  <div className="text-5xl mb-2">{info.emoji}</div>

                  {/* Name */}
                  <div className="font-bold text-center mb-1 text-sm">{info.name}</div>

                  {/* Stats */}
                  <div className="text-xs text-center mb-2 space-y-1">
                    <div className="text-green-400">{info.daysToGrow} day{info.daysToGrow > 1 ? 's' : ''}</div>
                    <div className="text-purple-400">Sells: ${cropInfo.sellPrice}</div>
                    <div className="text-blue-400">Owned: {owned}</div>
                  </div>

                  {/* Auto-Refill Toggle */}
                  <button
                    onClick={() => onToggleAutoBuy(crop)}
                    className={`w-full px-2 py-1 rounded text-xs font-bold mb-2 transition-colors ${
                      autoBuyEnabled
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {autoBuyEnabled ? '🔄 Auto-Refill ON' : '🔄 Auto-Refill OFF'}
                  </button>

                  {/* Buy Button */}
                  <button
                    onClick={() => onBuySeeds(crop, 1)}
                    disabled={!canBuy1}
                    className={`w-full px-3 py-2 rounded font-bold text-sm ${
                      canBuy1
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    ${cropInfo.seedCost}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Tools Tab Content */}
        {activeTab === 'tools' && (
        <div>
          <div className="grid grid-cols-3 gap-4">
            {/* Basket Upgrades - Individual Tiles */}
            {[0, 1, 2].map((tier) => {
              const currentUpgrades = gameState.player.bagUpgrades || 0;
              const isOwned = currentUpgrades > tier;
              const isCurrent = currentUpgrades === tier;
              const isLocked = currentUpgrades < tier;
              const canAfford = gameState.player.money >= BAG_UPGRADE_COSTS[tier];

              return (
                <div
                  key={tier}
                  className={`bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 flex flex-col items-center ${
                    isOwned
                      ? 'border-green-600'
                      : isCurrent
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-600 opacity-50'
                  }`}
                >
                  {/* Icon */}
                  <div className="text-5xl mb-2">
                    {isOwned ? '✓' : isLocked ? '🔒' : '🎒'}
                  </div>

                  {/* Name */}
                  <div className="font-bold text-center mb-1 text-sm">
                    Basket Tier {tier + 1}
                  </div>

                  {/* Stats */}
                  <div className="text-xs text-center mb-2 space-y-1">
                    <div className="text-green-400">+4 capacity</div>
                    <div className="text-blue-400">
                      {isOwned ? 'Owned' : isLocked ? 'Locked' : 'Available'}
                    </div>
                  </div>

                  {/* Buy Button */}
                  {isOwned ? (
                    <div className="w-full px-3 py-2 rounded font-bold text-sm bg-green-900/40 text-green-400 text-center">
                      Owned
                    </div>
                  ) : isCurrent ? (
                    <button
                      onClick={() => onUpgradeBag()}
                      disabled={!canAfford}
                      className={`w-full px-3 py-2 rounded font-bold text-sm ${
                        canAfford
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      ${BAG_UPGRADE_COSTS[tier]}
                    </button>
                  ) : (
                    <div className="w-full px-3 py-2 rounded font-bold text-sm bg-gray-800/40 text-gray-500 text-center">
                      Locked
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mechanic Shop */}
            <div className={`bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 flex flex-col items-center ${
              gameState.player.inventory.mechanicShop >= 1
                ? 'border-green-600'
                : 'border-amber-600'
            }`}>
              {/* Icon */}
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                {gameState.player.inventory.mechanicShop >= 1 ? (
                  <span className="text-5xl">✓</span>
                ) : (
                  <Image src="/mechanic.png" alt="Mechanic Shop" width={80} height={80} className="object-contain" />
                )}
              </div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Mechanic Shop</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-purple-400">Premium Building</div>
                <div className="text-blue-400">
                  {gameState.player.inventory.mechanicShopPlaced ? (
                    <span className="text-green-400">Installed</span>
                  ) : gameState.player.inventory.mechanicShop >= 1 ? (
                    <span className="text-yellow-400">Ready!</span>
                  ) : (
                    'Not Owned'
                  )}
                </div>
              </div>

              {/* Buy/Action Button */}
              {gameState.player.inventory.mechanicShop < 1 ? (
                <button
                  onClick={() => onBuyMechanicShop()}
                  disabled={gameState.player.money < MECHANIC_SHOP_COST}
                  className={`w-full px-3 py-2 rounded font-bold text-sm ${
                    gameState.player.money >= MECHANIC_SHOP_COST
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  ${MECHANIC_SHOP_COST}
                </button>
              ) : gameState.player.inventory.mechanicShopPlaced ? (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-green-900/40 text-green-400 text-center">
                  Owned
                </div>
              ) : (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-yellow-900/40 text-yellow-400 text-center">
                  Place It!
                </div>
              )}
            </div>

            {/* Sprinkler Items - Buy individual sprinklers */}
            <div className="bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 border-cyan-600 flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                <Image src="/sprinkler.png" alt="Sprinkler" width={80} height={80} className="object-contain" />
              </div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Sprinklers</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-cyan-400">Auto-waters 5×5 area</div>
                <div className="text-blue-400">Owned: {gameState.player.inventory.sprinklers}</div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => onBuySprinklers(1)}
                disabled={gameState.player.money < SPRINKLER_COST}
                className={`w-full px-3 py-2 rounded font-bold text-sm ${
                  gameState.player.money >= SPRINKLER_COST
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                ${SPRINKLER_COST}
              </button>
            </div>

            {/* Well - Water source for bots */}
            <div className={`bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 flex flex-col items-center ${
              gameState.player.inventory.well >= 1
                ? 'border-green-600'
                : 'border-amber-600'
            }`}>
              {/* Icon */}
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                {gameState.player.inventory.well >= 1 ? (
                  <span className="text-5xl">✓</span>
                ) : (
                  <Image src="/well.png" alt="Water Well" width={80} height={80} className="object-contain" />
                )}
              </div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Water Well</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-blue-400">Refills water bots</div>
                <div className="text-blue-400">
                  {gameState.player.inventory.wellPlaced ? (
                    <span className="text-green-400">Installed</span>
                  ) : gameState.player.inventory.well >= 1 ? (
                    <span className="text-yellow-400">Ready!</span>
                  ) : (
                    '1 per zone max'
                  )}
                </div>
              </div>

              {/* Buy/Action Button */}
              {gameState.player.inventory.well < 1 ? (
                <button
                  onClick={() => onBuyWell()}
                  disabled={gameState.player.money < WELL_COST}
                  className={`w-full px-3 py-2 rounded font-bold text-sm ${
                    gameState.player.money >= WELL_COST
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  ${WELL_COST}
                </button>
              ) : gameState.player.inventory.wellPlaced ? (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-green-900/40 text-green-400 text-center">
                  Owned
                </div>
              ) : (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-yellow-900/40 text-yellow-400 text-center">
                  Place It!
                </div>
              )}
            </div>

            {/* Garage - Parking for idle bots */}
            <div className={`bg-gradient-to-br from-amber-900/80 to-amber-950/80 p-3 rounded-lg border-2 flex flex-col items-center ${
              gameState.player.inventory.garage >= 1
                ? 'border-green-600'
                : 'border-amber-600'
            }`}>
              {/* Icon */}
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                {gameState.player.inventory.garage >= 1 ? (
                  <span className="text-5xl">✓</span>
                ) : (
                  <Image src="/garage.png" alt="Garage" width={80} height={80} className="object-contain" />
                )}
              </div>

              {/* Name */}
              <div className="font-bold text-center mb-1 text-sm">Garage</div>

              {/* Stats */}
              <div className="text-xs text-center mb-2 space-y-1">
                <div className="text-orange-400">Parking for idle bots</div>
                <div className="text-blue-400">
                  {gameState.player.inventory.garagePlaced ? (
                    <span className="text-green-400">Built</span>
                  ) : gameState.player.inventory.garage >= 1 ? (
                    <span className="text-yellow-400">Ready!</span>
                  ) : (
                    'Bots share garage'
                  )}
                </div>
              </div>

              {/* Buy/Action Button */}
              {gameState.player.inventory.garage < 1 ? (
                <button
                  onClick={() => onBuyGarage()}
                  disabled={gameState.player.money < GARAGE_COST}
                  className={`w-full px-3 py-2 rounded font-bold text-sm ${
                    gameState.player.money >= GARAGE_COST
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  ${GARAGE_COST}
                </button>
              ) : gameState.player.inventory.garagePlaced ? (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-green-900/40 text-green-400 text-center">
                  Owned
                </div>
              ) : (
                <div className="w-full px-3 py-2 rounded font-bold text-sm bg-yellow-900/40 text-yellow-400 text-center">
                  Place It!
                </div>
              )}
            </div>
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

