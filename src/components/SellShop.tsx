'use client';

import { GameState } from '@/types/game';

interface SellShopProps {
  gameState: GameState;
  onClose: () => void;
  onSellCrop: () => void;
}

export default function SellShop({ gameState, onClose, onSellCrop }: SellShopProps) {
  // Count basket items by crop type
  const basketCounts = gameState.player.basket.reduce((acc, item) => {
    acc[item.crop] = (acc[item.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-4 border-green-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🧺 Sell Basket</h2>
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

        <div className="mb-4 text-lg bg-black/30 px-4 py-2 rounded">
          Basket: {gameState.player.basket.length} / 8 items
        </div>

        {/* Basket Contents */}
        {gameState.player.basket.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-green-300">Basket Contents:</h3>
            <div className="space-y-2">
              {basketCounts.carrot && <div>🥕 Carrots: {basketCounts.carrot}</div>}
              {basketCounts.wheat && <div>🌾 Wheat: {basketCounts.wheat}</div>}
              {basketCounts.tomato && <div>🍅 Tomatoes: {basketCounts.tomato}</div>}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 my-8">Your basket is empty!</div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onSellCrop}
            disabled={gameState.player.basket.length === 0}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-lg ${
              gameState.player.basket.length > 0
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            💰 Sell All Items
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
