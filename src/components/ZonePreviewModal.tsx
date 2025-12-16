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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className={`bg-gradient-to-br ${themeColors[zone.theme]} text-white p-8 rounded-xl max-w-2xl w-full border-4 border-amber-600`}>
        <div className="flex justify-between items-center mb-6">
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

        {/* Large themed arch image */}
        <div className="mb-6 flex justify-center">
          <img
            src={themeArchImages[zone.theme]}
            alt={`${zone.theme} zone`}
            className="w-64 h-64 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="mb-6">
          <p className="text-lg mb-4">{zone.description}</p>

          {/* NPC Section */}
          {zone.npc && (
            <div className="bg-black/30 p-4 rounded-lg border-2 border-cyan-400 mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={zone.npc.image}
                  alt={zone.npc.name}
                  className="w-32 h-32 rounded-full border-2 border-cyan-300 object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-cyan-200 mb-1">{zone.npc.name}</h3>
                  <p className="text-sm text-cyan-100">{zone.npc.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          {zone.features && zone.features.length > 0 && (
            <div className="bg-black/30 p-4 rounded-lg border-2 border-purple-400 mb-4">
              <h3 className="text-lg font-bold text-purple-200 mb-3">🎯 Zone Activities:</h3>
              <div className="space-y-2">
                {zone.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-bold text-purple-100">{feature.name}</h4>
                      <p className="text-sm text-purple-200 opacity-90">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!zone.owned && (
            <div className="bg-black/40 p-4 rounded-lg border-2 border-yellow-600 mb-4">
              <p className="text-yellow-300 font-bold text-center">
                💰 Purchase Price: ${zone.purchasePrice}
              </p>
            </div>
          )}
        </div>

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
