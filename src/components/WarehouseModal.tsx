'use client';

import { GameState, CropType } from '@/types/game';
import { getMarketPrice } from '@/lib/marketEconomy';
import { CROP_INFO } from '@/lib/gameEngine';

interface WarehouseModalProps {
  gameState: GameState;
  onClose: () => void;
  onDeposit: () => void;
  onMarkForSale: (cropType: Exclude<CropType, null>, quantity: number) => void;
}

interface CropInfo {
  type: Exclude<CropType, null>;
  emoji: string;
  name: string;
  color: string;
}

const CROPS: CropInfo[] = [
  { type: 'carrot', emoji: '🥕', name: 'Carrot', color: 'from-orange-600 to-orange-700' },
  { type: 'wheat', emoji: '🌾', name: 'Wheat', color: 'from-yellow-600 to-yellow-700' },
  { type: 'tomato', emoji: '🍅', name: 'Tomato', color: 'from-red-600 to-red-700' },
  { type: 'pumpkin', emoji: '🎃', name: 'Pumpkin', color: 'from-orange-500 to-orange-600' },
  { type: 'watermelon', emoji: '🍉', name: 'Watermelon', color: 'from-green-600 to-green-700' },
  { type: 'peppers', emoji: '🌶️', name: 'Peppers', color: 'from-red-500 to-red-600' },
  { type: 'grapes', emoji: '🍇', name: 'Grapes', color: 'from-purple-600 to-purple-700' },
  { type: 'oranges', emoji: '🍊', name: 'Oranges', color: 'from-orange-400 to-orange-500' },
  { type: 'avocado', emoji: '🥑', name: 'Avocado', color: 'from-green-700 to-green-800' },
  { type: 'rice', emoji: '🍚', name: 'Rice', color: 'from-gray-500 to-gray-600' },
  { type: 'corn', emoji: '🌽', name: 'Corn', color: 'from-yellow-500 to-yellow-600' },
];

export default function WarehouseModal({ gameState, onClose, onDeposit, onMarkForSale }: WarehouseModalProps) {
  // Count warehouse items by crop type
  const warehouseCounts = gameState.warehouse.reduce((acc, item) => {
    acc[item.crop] = (acc[item.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count marked for sale items by crop type
  const markedForSaleCounts = gameState.markedForSale.reduce((acc, item) => {
    acc[item.crop] = (acc[item.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count basket items by crop type
  const basketCounts = gameState.player.basket.reduce((acc, item) => {
    acc[item.crop] = (acc[item.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total value of warehouse (including marked items)
  const warehouseValue = gameState.warehouse.reduce((total, item) => {
    return total + getMarketPrice(item.crop as Exclude<CropType, null>, gameState);
  }, 0);

  const markedValue = gameState.markedForSale.reduce((total, item) => {
    return total + getMarketPrice(item.crop as Exclude<CropType, null>, gameState);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl max-w-6xl w-full max-h-[95vh] border border-slate-600/50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              Warehouse Storage
            </h2>
            <div className="flex gap-4 mt-2 text-sm">
              <div className="text-slate-400">
                <span className="text-white font-semibold">{gameState.warehouse.length}</span> items stored
              </div>
              {gameState.markedForSale.length > 0 && (
                <div className="text-slate-400">
                  <span className="text-yellow-400 font-semibold">{gameState.markedForSale.length}</span> marked for sale
                </div>
              )}
              <div className="text-slate-400">
                Total value: <span className="text-green-400 font-semibold">${warehouseValue + markedValue}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Warehouse Grid - Tile Based Display */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-200 uppercase tracking-wide text-sm">Storage Inventory</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CROPS.map((crop) => {
                const count = warehouseCounts[crop.type] || 0;
                const markedCount = markedForSaleCounts[crop.type] || 0;
                const totalCount = count + markedCount;
                const price = getMarketPrice(crop.type, gameState);
                const basePrice = CROP_INFO[crop.type].sellPrice;
                const priceIncrease = ((price - basePrice) / basePrice) * 100;
                const totalValue = totalCount * price;
                const isEpic = gameState.market?.epicPriceCrop === crop.type;
                const isHighDemand = gameState.market?.highDemandCrops.includes(crop.type);
                const isGoodPrice = priceIncrease >= 50; // 50% or more above base

                return (
                  <div
                    key={crop.type}
                    className={`bg-gradient-to-br ${crop.color} rounded-xl p-4 border-2 ${
                      totalCount > 0 ? 'border-white/20 shadow-lg' : 'border-transparent opacity-50'
                    } transition-all relative`}
                  >
                    {/* Market Indicators */}
                    {totalCount > 0 && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        {isEpic && (
                          <div className="bg-purple-600 px-1.5 py-0.5 rounded text-xs font-bold border border-purple-300">
                            ⚡ 5x
                          </div>
                        )}
                        {!isEpic && isHighDemand && (
                          <div className="bg-yellow-600 px-1.5 py-0.5 rounded text-xs font-bold border border-yellow-300">
                            🔥 HOT
                          </div>
                        )}
                        {!isEpic && !isHighDemand && isGoodPrice && (
                          <div className="bg-green-600 px-1.5 py-0.5 rounded text-xs font-bold border border-green-300">
                            💰 SELL
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{crop.emoji}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{totalCount}</div>
                        <div className="text-xs text-white/80">
                          {markedCount > 0 ? (
                            <span>
                              {count} stored + <span className="text-yellow-300">{markedCount} marked</span>
                            </span>
                          ) : (
                            'units'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{crop.name}</div>
                    <div className="flex justify-between items-center text-xs text-white/90 mb-2">
                      <span>${price} ea</span>
                      {totalCount > 0 && <span className="font-bold">${totalValue}</span>}
                    </div>

                    {/* Price Indicator */}
                    {totalCount > 0 && priceIncrease !== 0 && (
                      <div className={`text-xs mb-2 font-semibold ${
                        priceIncrease > 0 ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {priceIncrease > 0 ? '▲' : '▼'} {Math.abs(priceIncrease).toFixed(0)}% vs base
                      </div>
                    )}

                    {/* Mark for Sale Button - only show if there are items in storage (not already marked) */}
                    {count > 0 && (
                      <button
                        onClick={() => onMarkForSale(crop.type, count)}
                        className={`w-full px-2 py-1.5 text-white text-xs font-bold rounded transition-colors ${
                          isEpic || isHighDemand || isGoodPrice
                            ? 'bg-yellow-600 hover:bg-yellow-700 animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {isEpic || isHighDemand || isGoodPrice ? '⭐ Sell Now!' : '💰 Mark for Sale'}
                      </button>
                    )}

                    {/* Show status for marked items */}
                    {markedCount > 0 && count === 0 && (
                      <div className="w-full px-2 py-1.5 text-yellow-300 text-xs font-bold rounded bg-yellow-900/30 border border-yellow-500/30 text-center">
                        🚚 Pickup in progress...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameState.warehouse.length === 0 && (
              <div className="text-center text-slate-500 bg-slate-800/50 p-8 rounded-xl mt-4">
                Warehouse is empty. Harvest crops and bring them here to store.
              </div>
            )}
          </div>

          {/* Current Basket */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200 uppercase tracking-wide text-sm">
              Your Basket ({gameState.player.basket.length} / {gameState.player.basketCapacity})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CROPS.map((crop) => {
                const count = basketCounts[crop.type] || 0;
                if (count === 0) return null;

                return (
                  <div
                    key={crop.type}
                    className={`bg-gradient-to-br ${crop.color} rounded-xl p-3 border-2 border-white/20 shadow-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{crop.emoji}</span>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-white">{count}</div>
                        <div className="text-xs text-white/80">{crop.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {gameState.player.basket.length === 0 && (
              <div className="text-center text-slate-500 bg-slate-800/50 p-6 rounded-xl">
                Basket is empty
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-700/50 p-4 md:p-6 bg-slate-900/50">
          <div className="flex gap-3">
            <button
              onClick={onDeposit}
              disabled={gameState.player.basket.length === 0}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-lg transition-all ${
                gameState.player.basket.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/50 border border-emerald-500/30'
                  : 'bg-slate-700 cursor-not-allowed opacity-50 border border-slate-600/50'
              }`}
            >
              📦 Deposit Basket to Warehouse
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-lg transition-all border border-slate-600/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
