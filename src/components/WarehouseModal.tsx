'use client';

import { GameState } from '@/types/game';

interface WarehouseModalProps {
  gameState: GameState;
  onClose: () => void;
  onDeposit: () => void;
}

export default function WarehouseModal({ gameState, onClose, onDeposit }: WarehouseModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-8 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto border-4 border-amber-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🏛️ Warehouse Storage</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-lg bg-black/30 px-4 py-2 rounded">
          Total Stored: {gameState.warehouse.length} items
        </div>

        {/* Warehouse Contents */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-amber-300">Warehouse Inventory:</h3>
          {gameState.warehouse.length > 0 ? (
            <div className="space-y-2 bg-black/30 p-4 rounded">
              {warehouseCounts.carrot && <div className="text-lg">🥕 Carrots: {warehouseCounts.carrot}</div>}
              {warehouseCounts.wheat && <div className="text-lg">🌾 Wheat: {warehouseCounts.wheat}</div>}
              {warehouseCounts.tomato && <div className="text-lg">🍅 Tomatoes: {warehouseCounts.tomato}</div>}
            </div>
          ) : (
            <div className="text-center text-gray-400 bg-black/30 p-8 rounded">
              Warehouse is empty! Harvest crops and bring them here to store.
            </div>
          )}
        </div>

        {/* Current Basket */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-green-300">Your Basket:</h3>
          <div className="mb-2 text-sm bg-black/30 px-4 py-2 rounded">
            {gameState.player.basket.length} / {gameState.player.basketCapacity} items
          </div>
          {gameState.player.basket.length > 0 ? (
            <div className="space-y-2 bg-black/30 p-4 rounded">
              {basketCounts.carrot && <div>🥕 Carrots: {basketCounts.carrot}</div>}
              {basketCounts.wheat && <div>🌾 Wheat: {basketCounts.wheat}</div>}
              {basketCounts.tomato && <div>🍅 Tomatoes: {basketCounts.tomato}</div>}
            </div>
          ) : (
            <div className="text-center text-gray-400 bg-black/30 p-4 rounded">
              Basket is empty
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onDeposit}
            disabled={gameState.player.basket.length === 0}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-lg ${
              gameState.player.basket.length > 0
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            📦 Deposit Basket to Warehouse
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
