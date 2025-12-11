'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { GameState, CropType } from '@/types/game';
import { CROP_INFO, getCurrentSellPrice } from '@/lib/gameEngine';
import { getMarketPrice } from '@/lib/marketEconomy';

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
  // Use single market prices (no vendor variation)
  const marketPrices: Record<Exclude<CropType, null>, number> = useMemo(() => {
    const crops: Array<Exclude<CropType, null>> = [
      'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
      'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
    ];

    const prices: any = {};
    crops.forEach(crop => {
      prices[crop] = gameState.market
        ? getMarketPrice(crop, gameState)
        : getCurrentSellPrice(crop, gameState.cropsSold);
    });

    return prices;
  }, [gameState.cropsSold, gameState.market]); // Regenerate when cropsSold or market changes

  // Count basket items by crop type
  const basketCounts = useMemo(() => {
    return gameState.player.basket.reduce((acc, item) => {
      acc[item.crop] = (acc[item.crop] || 0) + 1;
      return acc;
    }, {} as Record<Exclude<CropType, null>, number>);
  }, [gameState.player.basket]);

  // Count warehouse items by crop type
  const warehouseCounts = useMemo(() => {
    return gameState.warehouse.reduce((acc, item) => {
      acc[item.crop] = (acc[item.crop] || 0) + 1;
      return acc;
    }, {} as Record<Exclude<CropType, null>, number>);
  }, [gameState.warehouse]);

  // Combined total counts (basket + warehouse)
  const totalCounts = useMemo(() => {
    const combined: Record<Exclude<CropType, null>, number> = {
      carrot: 0,
      wheat: 0,
      tomato: 0,
      pumpkin: 0,
      watermelon: 0,
      peppers: 0,
      grapes: 0,
      oranges: 0,
      avocado: 0,
      rice: 0,
      corn: 0,
    };
    (['carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon', 'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'] as const).forEach(crop => {
      combined[crop] = (basketCounts[crop] || 0) + (warehouseCounts[crop] || 0);
    });
    return combined;
  }, [basketCounts, warehouseCounts]);

  const cropEmojis: Record<Exclude<CropType, null>, string> = {
    carrot: '🥕',
    wheat: '🌾',
    tomato: '🍅',
    pumpkin: '🎃',
    watermelon: '🍉',
    peppers: '🌶️',
    grapes: '🍇',
    oranges: '🍊',
    avocado: '🥑',
    rice: '🍚',
    corn: '🌽',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-4 md:p-8 rounded-xl max-w-4xl w-full max-h-[95vh] border-2 md:border-4 border-amber-600 flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">🚢 Export Center</h2>
          <button
            onClick={onClose}
            className="text-4xl md:text-2xl hover:text-red-400 transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 md:mb-4 text-lg md:text-xl font-bold bg-black/30 px-3 md:px-4 py-2 rounded">
          Your Money: 💰 ${gameState.player.money}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto mb-4">
        {gameState.player.basket.length === 0 && gameState.warehouse.length === 0 ? (
          <div className="text-center text-gray-400 my-8 text-lg">
            Your basket and warehouse are empty! Harvest some crops first.
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {/* Market Header */}
            <div className="flex items-center gap-2 md:gap-3 mb-4">
              <span className="text-3xl md:text-4xl">🌍</span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold">Global Market</h3>
                <p className="text-xs md:text-sm text-gray-300">Current market prices • {gameState.market?.epicPriceCrop && '⚡ EPIC PRICES ACTIVE!'}</p>
              </div>
            </div>

            {/* Crop Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {(['carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon', 'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'] as const).map((crop) => {
                const count = totalCounts[crop]; // Use combined basket + warehouse count
                const price = marketPrices[crop];
                const totalValue = count * price;
                const hasItems = count > 0;
                const isEpic = gameState.market?.epicPriceCrop === crop;
                const isHighDemand = gameState.market?.highDemandCrops.includes(crop);

                return (
                  <div
                    key={crop}
                    className={`p-2 md:p-3 rounded-lg border-2 ${
                      isEpic
                        ? 'bg-purple-900/50 border-purple-400 ring-2 ring-purple-400'
                        : isHighDemand
                        ? 'bg-yellow-900/30 border-yellow-500'
                        : hasItems
                        ? 'bg-green-900/30 border-green-600'
                        : 'bg-gray-800/30 border-gray-600'
                    }`}
                  >
                    {isEpic && (
                      <div className="text-center text-xs font-bold text-purple-300 mb-1">⚡ EPIC 5X!</div>
                    )}
                    <div className="text-center mb-1 md:mb-2">
                      <Image src={`/${crop}.png`} alt={crop} width={40} height={40} className="object-contain mx-auto mb-1 md:w-12 md:h-12" />
                      <div className="text-xs md:text-sm font-bold capitalize text-amber-300">
                        ${price}
                      </div>
                    </div>
                    <div className="text-center mb-1 md:mb-2">
                      <div className="text-xs text-gray-300">Have: {count}</div>
                      {hasItems && (
                        <div className="text-xs md:text-sm font-bold text-green-300">
                          = ${totalValue}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onSellToVendor(0, crop, price)}
                      disabled={!hasItems}
                      className={`w-full px-2 py-1.5 md:px-3 md:py-2 rounded font-bold text-xs md:text-sm ${
                        hasItems
                          ? isEpic
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {hasItems ? 'Sell All' : 'No Stock'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>

        {/* Sticky Footer Button */}
        <button
          onClick={onClose}
          className="w-full px-4 md:px-6 py-2 md:py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-base md:text-lg flex-shrink-0"
        >
          Close
        </button>
      </div>
    </div>
  );
}
