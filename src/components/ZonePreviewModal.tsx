'use client';

import { Zone } from '@/types/game';

interface ZonePreviewModalProps {
  zone: Zone;
  onClose: () => void;
  onTravel: () => void;
}

export default function ZonePreviewModal({ zone, onClose, onTravel }: ZonePreviewModalProps) {
  const themeEmojis = {
    farm: '🌾',
    beach: '🏖️',
    barn: '🐄',
    mountain: '⛰️',
    desert: '🏜️',
  };

  const themeColors = {
    farm: 'from-green-900 to-green-950',
    beach: 'from-blue-900 to-cyan-950',
    barn: 'from-amber-900 to-amber-950',
    mountain: 'from-gray-900 to-slate-950',
    desert: 'from-yellow-900 to-orange-950',
  };

  const themeArchImages = {
    farm: '/arch-farm.png',
    beach: '/arch-beach.png',
    barn: '/arch-barn.png',
    mountain: '/arch-mountain.png',
    desert: '/arch-desert.png',
  };

  // Beach zone buildings data
  const beachBuildings = zone.theme === 'beach' ? [
    { name: 'Fish Market', emoji: '🐟', price: '$5,000', description: 'Sell your fresh catch at premium prices', image: '/fishmarket.png' },
    { name: 'Bait Shop', emoji: '🪱', price: '$3,500', description: 'Purchase bait and lures to attract rarer fish', image: '/baitshop.png' },
    { name: 'Sub Depot', emoji: '🚢', price: '$8,000', description: 'Deploy submarine bots to automatically catch fish', image: '/subdepot.png' },
    { name: 'Fishing Boat', emoji: '⛵', price: '$12,000', description: 'Sail out to deeper waters for bigger catches', image: '/boat.png' },
  ] : [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${themeColors[zone.theme]} text-white p-6 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto border-4 border-amber-600`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-5xl">{themeEmojis[zone.theme]}</span>
            {zone.name}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Wide landscape layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Arch image */}
          <div className="flex justify-center items-start">
            <img
              src={themeArchImages[zone.theme]}
              alt={`${zone.theme} zone`}
              className="w-full h-64 object-cover rounded-xl drop-shadow-2xl border-2 border-amber-600/50"
            />
          </div>

          {/* Right: Info */}
          <div>
            <p className="text-lg mb-4">{zone.description}</p>

            {/* NPC Section - Compact */}
            {zone.npc && (
              <div className="bg-black/30 p-3 rounded-lg border-2 border-cyan-400 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={zone.npc.image}
                    alt={zone.npc.name}
                    className="w-20 h-20 rounded-full border-2 border-cyan-300 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cyan-200">{zone.npc.name}</h3>
                    <p className="text-xs text-cyan-100">{zone.npc.description}</p>
                  </div>
                </div>
              </div>
            )}

            {!zone.owned && (
              <div className="bg-black/40 p-3 rounded-lg border-2 border-yellow-600">
                <p className="text-yellow-300 font-bold text-center">
                  💰 Purchase Price: ${zone.purchasePrice}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buildings Showcase - Beach Zone */}
        {beachBuildings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🏗️</span>
              <span>Available Buildings</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {beachBuildings.map((building, index) => (
                <div key={index} className="bg-black/40 rounded-lg p-3 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                  <div className="aspect-square bg-black/40 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img src={building.image} alt={building.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-sm font-bold text-cyan-400 mb-1">{building.emoji} {building.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{building.description}</p>
                  <span className="text-lg font-black text-yellow-400">{building.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {zone.owned ? (
            <button
              onClick={onTravel}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition-colors"
            >
              🚶 Travel Here
            </button>
          ) : (
            <button
              onClick={onTravel}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-colors"
            >
              💵 Purchase & Travel (${zone.purchasePrice})
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
