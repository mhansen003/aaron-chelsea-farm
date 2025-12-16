'use client';

import { Zone } from '@/types/game';
import { useMemo } from 'react';

interface ZonePreviewModalProps {
  zone: Zone;
  onClose: () => void;
  onTravel: () => void;
  playerMoney: number;
}

export default function ZonePreviewModal({ zone, onClose, onTravel, playerMoney }: ZonePreviewModalProps) {
  const themeColors = {
    farm: 'from-slate-900 to-slate-950',
    beach: 'from-slate-900 to-slate-950',
    barn: 'from-slate-900 to-slate-950',
    mountain: 'from-slate-900 to-slate-950',
    desert: 'from-slate-900 to-slate-950',
  };

  const themeArchImages = {
    farm: '/arch-farm.png',
    beach: '/arch-beach.png',
    barn: '/arch-barn.png',
    mountain: '/arch-mountain.png',
    desert: '/arch-desert.png',
  };

  // Expanded zone descriptions
  const expandedDescriptions = {
    beach: 'A tropical paradise with sandy shores and palm trees. Perfect for fishing and relaxation! The crystal-clear waters are teeming with marine life, from colorful tropical fish to valuable catches in the deeper waters. Set up your fishing operation and explore the underwater world with advanced submarine technology.',
    farm: zone.description,
    barn: zone.description,
    mountain: zone.description,
    desert: zone.description,
  };

  // Beach zone buildings data (no prices shown)
  const beachBuildings = zone.theme === 'beach' ? [
    { name: 'Fish Market', description: 'Sell your fresh catch at premium prices', image: '/fishmarket.png' },
    { name: 'Bait Shop', description: 'Purchase bait and lures to attract rarer fish', image: '/baitshop.png' },
    { name: 'Sub Depot', description: 'Deploy submarine bots to automatically catch fish', image: '/subdepot.png' },
    { name: 'Fishing Boat', description: 'Sail out to deeper waters for bigger catches', image: '/boat.png' },
  ] : [];

  // All seafood items available
  const allSeafood = [
    { name: 'Clams', image: '/images/seafood/clams.png' },
    { name: 'Anglerfish', image: '/images/seafood/deep anglerfish.png' },
    { name: 'Blob Fish', image: '/images/seafood/deep blop fish.png' },
    { name: 'Box Jellyfish', image: '/images/seafood/deep box jellyfish.png' },
    { name: 'Giant Squid', image: '/images/seafood/deep giant squid.png' },
    { name: 'Megalodon', image: '/images/seafood/deep meg.png' },
    { name: 'Oarfish', image: '/images/seafood/deep oarfish.png' },
    { name: 'Flounder', image: '/images/seafood/flounder.png' },
    { name: 'Mahi Mahi', image: '/images/seafood/mahi mahi.png' },
    { name: 'Octopus', image: '/images/seafood/octopus.png' },
    { name: 'Red Snapper', image: '/images/seafood/redsnapper.png' },
    { name: 'Shark', image: '/images/seafood/shark.png' },
    { name: 'Starfish', image: '/images/seafood/starfish.png' },
    { name: 'Tang', image: '/images/seafood/tang.png' },
    { name: 'Sea Urchin', image: '/images/seafood/urchen.png' },
    { name: 'Yellowtail', image: '/images/seafood/yellowtail.png' },
  ];

  // Randomly select 6 seafood items for beach zone (memoized to prevent re-shuffling)
  const selectedSeafood = useMemo(() => {
    if (zone.theme !== 'beach') return [];
    const shuffled = [...allSeafood].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [zone.theme]);

  // Check if player can afford the zone
  const canAfford = zone.owned || playerMoney >= zone.purchasePrice;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${themeColors[zone.theme]} text-white p-6 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto border-4 border-slate-700`}>
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold">{zone.name}</h2>
          <button
            onClick={onClose}
            className="text-3xl hover:text-red-400 transition-colors px-2"
          >
            ✕
          </button>
        </div>

        {/* Main content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Left: Large arch image with NPC overlay - takes 3 columns */}
          <div className="lg:col-span-3 relative">
            <img
              src={themeArchImages[zone.theme]}
              alt={`${zone.theme} zone`}
              className="w-full h-96 object-cover rounded-xl drop-shadow-2xl"
            />

            {/* NPC photo overlaid on top-left corner - larger */}
            {zone.npc && (
              <div className="absolute top-2 left-2">
                <img
                  src={zone.npc.image}
                  alt={zone.npc.name}
                  className="w-32 h-32 object-cover shadow-2xl"
                />
              </div>
            )}
          </div>

          {/* Right: Description and NPC info - takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <p className="text-lg text-slate-200 leading-relaxed">
              {expandedDescriptions[zone.theme as keyof typeof expandedDescriptions]}
            </p>

            {/* NPC description below zone description */}
            {zone.npc && (
              <div className="bg-black/40 p-4 rounded-xl border border-cyan-500/50">
                <h3 className="text-lg font-bold text-cyan-200 mb-2">{zone.npc.name}</h3>
                <p className="text-sm text-cyan-100">{zone.npc.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Buildings Showcase - Beach Zone */}
        {beachBuildings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 text-slate-200">
              New Adventure Awaits
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {beachBuildings.map((building, index) => (
                <div key={index} className="bg-black/40 rounded-lg p-3 border border-slate-600/50 hover:border-slate-500 transition-all">
                  <div className="aspect-square bg-black/30 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img src={building.image} alt={building.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">{building.name}</h4>
                  <p className="text-xs text-slate-400">{building.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seafood Preview - Beach Zone */}
        {selectedSeafood.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 text-cyan-200">
              Discover Amazing Sea Creatures
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {selectedSeafood.map((seafood, index) => (
                <div key={index} className="bg-black/40 rounded-lg p-2 border border-cyan-600/50 hover:border-cyan-500 transition-all">
                  <div className="aspect-square bg-black/30 rounded-lg mb-1 flex items-center justify-center overflow-hidden">
                    <img src={seafood.image} alt={seafood.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-xs font-bold text-cyan-100 text-center">{seafood.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {zone.owned ? (
            <button
              onClick={onTravel}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-bold text-xl transition-all shadow-lg"
            >
              Travel Here
            </button>
          ) : (
            <button
              onClick={onTravel}
              disabled={!canAfford}
              className={`flex-1 px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {canAfford ? `Purchase & Travel ($${zone.purchasePrice})` : `Not Enough Money ($${zone.purchasePrice})`}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl font-bold text-xl transition-all shadow-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
