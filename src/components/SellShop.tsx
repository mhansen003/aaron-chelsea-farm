'use client';

import { GameState, CropType } from '@/types/game';
import { CROP_INFO } from '@/lib/gameEngine';
import { useState } from 'react';

interface SellShopProps {
  gameState: GameState;
  onClose: () => void;
  onSellCrop: (crop: Exclude<CropType, null>, amount: number) => void;
}

const CROP_DISPLAY = {
  carrot: { name: 'Carrots', emoji: '🥕' },
  wheat: { name: 'Wheat', emoji: '🌾' },
  tomato: { name: 'Tomatoes', emoji: '🍅' },
};

export default function SellShop({ gameState, onClose, onSellCrop }: SellShopProps) {
  const [amounts, setAmounts] = useState<Record<string, number>>({
    carrot: 1,
    wheat: 1,
    tomato: 1,
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-4 border-green-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🏪 Sell Your Harvest</h2>
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

        {/* Crops Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-green-300">Harvested Crops</h3>
          <div className="grid gap-4">
            {Object.entries(CROP_DISPLAY).map(([cropKey, display]) => {
              const crop = cropKey as Exclude<CropType, null>;
              const harvested = gameState.player.inventory.harvested[crop];
              const cropInfo = CROP_INFO[crop];
              const quality = gameState.player.inventory.seedQuality[crop];
              const pricePerCrop = Math.floor(cropInfo.sellPrice * quality.yield);
              const amount = amounts[crop] || 1;
              const canSell = harvested >= amount;
              const totalValue = pricePerCrop * amount;

              return (
                <div
                  key={crop}
                  className="bg-black/40 p-4 rounded-lg border-2 border-green-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-2xl mr-2">{display.emoji}</span>
                      <span className="font-bold">{display.name}</span>
                    </div>
                    <div className="text-green-300 font-bold">${pricePerCrop} each</div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="text-blue-400">In Stock: {harvested}</span>
                    {' • '}
                    <span className="text-purple-400">Quality Gen {quality.generation} ({(quality.yield * 100).toFixed(0)}% value)</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      max={harvested}
                      value={amount}
                      onChange={(e) => setAmounts({ ...amounts, [crop]: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="px-3 py-2 rounded bg-black/50 text-white w-24 border border-green-600"
                    />
                    <button
                      onClick={() => onSellCrop(crop, amount)}
                      disabled={!canSell}
                      className={`px-4 py-2 rounded font-bold flex-1 ${
                        canSell
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Sell for ${totalValue}
                    </button>
                    <button
                      onClick={() => onSellCrop(crop, harvested)}
                      disabled={harvested === 0}
                      className={`px-4 py-2 rounded font-bold ${
                        harvested > 0
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Sell All
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
