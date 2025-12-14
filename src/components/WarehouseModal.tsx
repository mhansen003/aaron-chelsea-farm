'use client';

import { GameState, CropType } from '@/types/game';
import { getMarketPrice } from '@/lib/marketEconomy';

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
  { type: 'rice', emoji: '🍚', name: 'Rice', color: 'from-gray-100 to-gray-300' },
  { type: 'corn', emoji: '🌽', name: 'Corn', color: 'from-yellow-500 to-yellow-600' },
];

export default function WarehouseModal({ gameState, onClose, onDeposit, onMarkForSale }: WarehouseModalProps) {
  // Count warehouse items by crop type
  const warehouseCounts = gameState.warehouse.reduce((acc, item) => {
    acc[item.crop] = (acc[item.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count basket items by crop type
  const basketCounts = gameState.player.basket.reduce((acc, item) => {
    acc[item.crop] = (acc[item.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total value of warehouse
  const warehouseValue = gameState.warehouse.reduce((total, item) => {
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
              <div className="text-slate-400">
                Total value: <span className="text-green-400 font-semibold">${warehouseValue}</span>
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
                const price = getMarketPrice(crop.type, gameState);
                const totalValue = count * price;

                return (
                  <div
                    key={crop.type}
                    className={`bg-gradient-to-br ${crop.color} rounded-xl p-4 border-2 ${
                      count > 0 ? 'border-white/20 shadow-lg' : 'border-transparent opacity-50'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{crop.emoji}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{count}</div>
                        <div className="text-xs text-white/80">units</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{crop.name}</div>
                    <div className="flex justify-between items-center text-xs text-white/90 mb-2">
                      <span>${price} ea</span>
                      {count > 0 && <span className="font-bold">${totalValue}</span>}
                    </div>

                    {/* Mark for Sale Button */}
                    {count > 0 && (
                      <button
                        onClick={() => onMarkForSale(crop.type, count)}
                        className="w-full px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors"
                      >
                        💰 Mark All for Sale
                      </button>
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
