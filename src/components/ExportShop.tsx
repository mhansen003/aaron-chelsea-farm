'use client';

import { useState, useMemo } from 'react';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO } from '@/lib/gameEngine';

interface ExportShopProps {
  gameState: GameState;
  onClose: () => void;
  onSellToVendor: (vendorIndex: number, cropType: Exclude<CropType, null>, vendorPrice: number) => void;
}

interface Vendor {
  name: string;
  emoji: string;
  prices: Record<Exclude<CropType, null>, number>;
}

export default function ExportShop({ gameState, onClose, onSellToVendor }: ExportShopProps) {
  // Generate vendor prices with ±20% variation each time modal opens
  const vendors: Vendor[] = useMemo(() => {
    const generatePrice = (basePrice: number) => {
      const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 (±20%)
      return Math.round(basePrice * variation);
    };

    return [
      {
        name: 'Village Market',
        emoji: '🏘️',
        prices: {
          carrot: generatePrice(CROP_INFO.carrot.sellPrice),
          wheat: generatePrice(CROP_INFO.wheat.sellPrice),
          tomato: generatePrice(CROP_INFO.tomato.sellPrice),
        },
      },
      {
        name: 'City Grocer',
        emoji: '🏙️',
        prices: {
          carrot: generatePrice(CROP_INFO.carrot.sellPrice),
          wheat: generatePrice(CROP_INFO.wheat.sellPrice),
          tomato: generatePrice(CROP_INFO.tomato.sellPrice),
        },
      },
      {
        name: 'Premium Restaurant',
        emoji: '🍽️',
        prices: {
          carrot: generatePrice(CROP_INFO.carrot.sellPrice),
          wheat: generatePrice(CROP_INFO.wheat.sellPrice),
          tomato: generatePrice(CROP_INFO.tomato.sellPrice),
        },
      },
    ];
  }, []); // Only generate once when modal opens

  // Count basket items by crop type
  const basketCounts = useMemo(() => {
    return gameState.player.basket.reduce((acc, item) => {
      acc[item.crop] = (acc[item.crop] || 0) + 1;
      return acc;
    }, {} as Record<Exclude<CropType, null>, number>);
  }, [gameState.player.basket]);

  const cropEmojis: Record<Exclude<CropType, null>, string> = {
    carrot: '🥕',
    wheat: '🌾',
    tomato: '🍅',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border-4 border-amber-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🚢 Export Center</h2>
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

        <div className="mb-6 bg-black/30 px-4 py-3 rounded">
          <h3 className="text-lg font-bold mb-2">Your Basket ({gameState.player.basket.length}/{gameState.player.basketCapacity}):</h3>
          <div className="flex gap-4">
            {(['carrot', 'wheat', 'tomato'] as const).map((crop) => (
              <div key={crop} className="flex items-center gap-2">
                <span className="text-2xl">{cropEmojis[crop]}</span>
                <span className="text-lg font-bold">{basketCounts[crop] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {gameState.player.basket.length === 0 ? (
          <div className="text-center text-gray-400 my-8 text-lg">
            Your basket is empty! Harvest some crops first.
          </div>
        ) : (
          <div className="space-y-4">
            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="bg-black/40 p-5 rounded-lg border-2 border-amber-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{vendor.emoji}</span>
                    <span className="text-xl font-bold">{vendor.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['carrot', 'wheat', 'tomato'] as const).map((crop) => {
                    const count = basketCounts[crop] || 0;
                    const price = vendor.prices[crop];
                    const totalValue = count * price;
                    const hasItems = count > 0;

                    return (
                      <div
                        key={crop}
                        className={`p-3 rounded-lg border-2 ${
                          hasItems
                            ? 'bg-green-900/30 border-green-600'
                            : 'bg-gray-800/30 border-gray-600'
                        }`}
                      >
                        <div className="text-center mb-2">
                          <div className="text-3xl mb-1">{cropEmojis[crop]}</div>
                          <div className="text-sm font-bold capitalize text-amber-300">
                            ${price} each
                          </div>
                        </div>
                        <div className="text-center mb-2">
                          <div className="text-xs text-gray-300">You have: {count}</div>
                          {hasItems && (
                            <div className="text-sm font-bold text-green-300">
                              Total: ${totalValue}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onSellToVendor(index, crop, price)}
                          disabled={!hasItems}
                          className={`w-full px-3 py-2 rounded font-bold text-sm ${
                            hasItems
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Sell All
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
        >
          Close Export Center
        </button>
      </div>
    </div>
  );
}
