'use client';

import { Zone } from '@/types/game';

interface ZonePreviewModalProps {
  zone: Zone;
  onClose: () => void;
  onTravel: () => void;
}

export default function ZonePreviewModal({ zone, onClose, onTravel }: ZonePreviewModalProps) {
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

  // Beach zone buildings data
  const beachBuildings = zone.theme === 'beach' ? [
    { name: 'Fish Market', price: '$5,000', description: 'Sell your fresh catch at premium prices', image: '/fishmarket.png' },
    { name: 'Bait Shop', price: '$3,500', description: 'Purchase bait and lures to attract rarer fish', image: '/baitshop.png' },
    { name: 'Sub Depot', price: '$8,000', description: 'Deploy submarine bots to automatically catch fish', image: '/subdepot.png' },
    { name: 'Fishing Boat', price: '$12,000', description: 'Sail out to deeper waters for bigger catches', image: '/boat.png' },
  ] : [];

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

            {/* Purchase price badge on top-left */}
            {!zone.owned && zone.purchasePrice && (
              <div className="absolute top-4 left-4 bg-yellow-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500 shadow-lg">
                <p className="text-white font-bold text-xs">
                  ${zone.purchasePrice?.toLocaleString()}
                </p>
              </div>
            )}

            {/* NPC overlaid on bottom-left corner */}
            {zone.npc && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-xl border-2 border-cyan-500">
                <div className="flex items-center gap-3">
                  <img
                    src={zone.npc.image}
                    alt={zone.npc.name}
                    className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">{zone.npc.name}</h3>
                    <p className="text-sm text-cyan-100 max-w-xs">{zone.npc.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Description - takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col">
            <p className="text-lg text-slate-200 leading-relaxed">
              {expandedDescriptions[zone.theme as keyof typeof expandedDescriptions]}
            </p>
          </div>
        </div>

        {/* Buildings Showcase - Beach Zone */}
        {beachBuildings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 text-slate-200">
              Available Buildings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {beachBuildings.map((building, index) => (
                <div key={index} className="bg-black/40 rounded-lg p-3 border border-slate-600/50 hover:border-slate-500 transition-all">
                  <div className="aspect-square bg-black/30 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img src={building.image} alt={building.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">{building.name}</h4>
                  <p className="text-xs text-slate-400 mb-2">{building.description}</p>
                  <span className="text-xs font-semibold text-yellow-500">{building.price}</span>
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
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold text-xl transition-all shadow-lg"
            >
              Purchase & Travel (${zone.purchasePrice?.toLocaleString()})
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
