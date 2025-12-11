import React from 'react';

interface WellModalProps {
  onClose: () => void;
  onRelocate: () => void;
}

export function WellModal({ onClose, onRelocate }: WellModalProps) {
  const handleRelocate = () => {
    onRelocate();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-900 border-2 border-cyan-400 rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💧</span>
            <div>
              <h2 className="text-2xl font-bold text-cyan-300">Water Well</h2>
              <p className="text-sm text-gray-300">Essential water source for your farm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none px-3 py-1 hover:bg-white/10 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Well Image */}
          <div className="flex justify-center">
            <div className="border-4 border-cyan-400 rounded-lg overflow-hidden bg-black/40 p-4 shadow-xl">
              <img
                src="/well.png"
                alt="Water Well"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
              💧 About the Well
            </h3>
            <p className="text-gray-200 leading-relaxed">
              The Water Well is the lifeblood of your farm's irrigation system. This deep stone well taps into underground aquifers, providing a constant supply of fresh water for your Water Bots. Without a well, your automated watering system cannot function.
            </p>
          </div>

          {/* Features Section */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              ⚡ Well Features
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-200">Unlimited water capacity - never runs dry</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-200">Instant refill for Water Bots (10 gallons each)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-200">Automatically detected by all Water Bots in the zone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-200">Can be relocated anywhere on your farm</span>
              </div>
            </div>
          </div>

          {/* Historical Note */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/30">
            <h3 className="text-sm font-bold text-yellow-400 mb-2">📜 Historical Note</h3>
            <p className="text-sm text-gray-300 italic">
              "The first well on Zone 0,0 was hand-dug by the farm's founders over 100 years ago. While we've since upgraded to modern drilling techniques, every well still bears the traditional stone archway as a tribute to those early farmers who understood that water is wealth."
            </p>
          </div>
        </div>

        {/* Sticky Footer with CTAs */}
        <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm border-t border-white/10 p-4 space-y-3">
          <button
            onClick={handleRelocate}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-lg font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Relocate Well</span>
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-bold text-white shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
