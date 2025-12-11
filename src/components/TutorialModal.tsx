'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TutorialModalProps {
  onClose: () => void;
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "Welcome to Aaron & Chelsea's Farm!",
      icon: "🌾",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🚜</div>
            <p className="text-lg text-gray-300">
              Build your farming empire from a small plot to a massive automated operation!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg p-4 border border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-2">🎯 Your Mission</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Clear land and plant crops</li>
              <li>• Harvest and sell for profit</li>
              <li>• Buy bots to automate everything</li>
              <li>• Expand to multiple zones</li>
              <li>• Master the dynamic market economy</li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-400">
            Click through to learn the basics →
          </div>
        </div>
      ),
    },
    {
      title: "Farming Basics",
      icon: "🌱",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-brown-900/40 to-yellow-900/40 rounded-lg p-3 border border-yellow-600/30">
              <div className="text-3xl mb-2">⛏️</div>
              <h4 className="font-bold text-yellow-400 mb-1">1. Clear Land</h4>
              <p className="text-xs text-gray-300">Click rocks and trees to clear them. Your farmer will automatically queue the work!</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-lime-900/40 rounded-lg p-3 border border-green-600/30">
              <div className="text-3xl mb-2">🌱</div>
              <h4 className="font-bold text-green-400 mb-1">2. Plant Seeds</h4>
              <p className="text-xs text-gray-300">Select a crop from the bottom bar, then click cleared tiles to plant.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-lg p-3 border border-blue-600/30">
              <div className="text-3xl mb-2">💧</div>
              <h4 className="font-bold text-cyan-400 mb-1">3. Water Crops</h4>
              <p className="text-xs text-gray-300">Click planted crops to water them. Once watered, they start growing!</p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-lg p-3 border border-orange-600/30">
              <div className="text-3xl mb-2">🌾</div>
              <h4 className="font-bold text-orange-400 mb-1">4. Harvest & Sell</h4>
              <p className="text-xs text-gray-300">When crops are fully grown, harvest them and sell at the Export building!</p>
            </div>
          </div>

          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-blue-400">💡 Pro Tip:</span> Your cursor changes based on what action you can perform. Watch for crosshair (clear), cell (water), and grab (harvest) cursors!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Buildings & Upgrades",
      icon: "🏗️",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 flex items-start gap-3">
              <div className="text-3xl">🏪</div>
              <div>
                <h4 className="font-bold text-purple-400">Shop</h4>
                <p className="text-xs text-gray-300">Buy seeds, tools, sprinklers, and unlock new crops here.</p>
              </div>
            </div>

            <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30 flex items-start gap-3">
              <div className="text-3xl">📦</div>
              <div>
                <h4 className="font-bold text-green-400">Export Building</h4>
                <p className="text-xs text-gray-300">Sell your crops here! Prices change based on market demand.</p>
              </div>
            </div>

            <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30 flex items-start gap-3">
              <div className="text-3xl">🏭</div>
              <div>
                <h4 className="font-bold text-orange-400">Warehouse</h4>
                <p className="text-xs text-gray-300">Store crops temporarily. Useful for waiting for better prices!</p>
              </div>
            </div>

            <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30 flex items-start gap-3">
              <div className="text-3xl">⚙️</div>
              <div>
                <h4 className="font-bold text-red-400">Mechanic Shop</h4>
                <p className="text-xs text-gray-300">Buy bots to automate your farm! Water bots, harvest bots, seed bots, and more.</p>
              </div>
            </div>

            <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30 flex items-start gap-3">
              <div className="text-3xl">🪣</div>
              <div>
                <h4 className="font-bold text-cyan-400">Well</h4>
                <p className="text-xs text-gray-300">Water bots refill here. Each zone can have one well.</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-500/30 flex items-start gap-3">
              <div className="text-3xl">🏠</div>
              <div>
                <h4 className="font-bold text-gray-400">Garage</h4>
                <p className="text-xs text-gray-300">Bots park here when idle. Manage your bot fleet!</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Automation with Bots",
      icon: "🤖",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-3">
            <div className="text-5xl mb-2">🤖</div>
            <p className="text-gray-300">Bots are the key to scaling your farm!</p>
          </div>

          <div className="space-y-3">
            <div className="bg-cyan-900/40 rounded-lg p-3 border border-cyan-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💧</span>
                <h4 className="font-bold text-cyan-400">Water Bots</h4>
              </div>
              <p className="text-sm text-gray-300">Automatically water your planted crops. They refill at wells when empty.</p>
            </div>

            <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌾</span>
                <h4 className="font-bold text-orange-400">Harvest Bots</h4>
              </div>
              <p className="text-sm text-gray-300">Collect grown crops and deposit them at the warehouse or export building.</p>
            </div>

            <div className="bg-green-900/40 rounded-lg p-3 border border-green-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌱</span>
                <h4 className="font-bold text-green-400">Seed Bots</h4>
              </div>
              <p className="text-sm text-gray-300">Plant specific crops on assigned tiles. Configure up to 3 jobs per bot!</p>
            </div>

            <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🚚</span>
                <h4 className="font-bold text-purple-400">Transport Bots</h4>
              </div>
              <p className="text-sm text-gray-300">Move crops from warehouse to export for sale automatically.</p>
            </div>

            <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💥</span>
                <h4 className="font-bold text-red-400">Demolish Bots</h4>
              </div>
              <p className="text-sm text-gray-300">Clear rocks and trees automatically. Essential for expansion!</p>
            </div>
          </div>

          <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-yellow-400">⚡ Supercharger:</span> Place this building to give all bots 200% speed boost!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Market Economy",
      icon: "📈",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-3">
            <div className="text-5xl mb-2">📊</div>
            <p className="text-gray-300">Master the market to maximize profits!</p>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-bold text-blue-400 mb-2">🔄 Dynamic Pricing</h4>
            <p className="text-sm text-gray-300 mb-2">
              Crop prices change every 8 minutes based on seasons and demand. Watch the market trends!
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-green-600/30 px-2 py-1 rounded">📈 High Demand = Higher Prices</span>
              <span className="bg-red-600/30 px-2 py-1 rounded">📉 Oversupply = Lower Prices</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-4 border border-purple-500/30">
            <h4 className="font-bold text-purple-400 mb-2">🌸 Seasonal Demand</h4>
            <p className="text-sm text-gray-300 mb-2">
              Each season (Spring, Summer, Fall, Winter) favors different crops with bonus prices!
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="bg-pink-600/20 px-2 py-1 rounded">🌸 Spring: Fresh veggies</span>
              <span className="bg-yellow-600/20 px-2 py-1 rounded">☀️ Summer: Fruits</span>
              <span className="bg-orange-600/20 px-2 py-1 rounded">🍂 Fall: Pumpkins</span>
              <span className="bg-blue-600/20 px-2 py-1 rounded">❄️ Winter: Roots</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-4 border border-yellow-500/30">
            <h4 className="font-bold text-yellow-400 mb-2">⭐ Epic Price Events</h4>
            <p className="text-sm text-gray-300">
              Rare 5-minute events where ONE random crop sells for <span className="text-yellow-400 font-bold">5x price</span>! Watch for the alert!
            </p>
          </div>

          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-blue-400">💡 Strategy:</span> Click the 📈 icon in top-right to view forecast and plan which crops to plant!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Zones & Expansion",
      icon: "🗺️",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-3">
            <div className="text-5xl mb-2">🗺️</div>
            <p className="text-gray-300">Expand your farming empire across multiple zones!</p>
          </div>

          <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-lg p-4 border border-green-500/30">
            <h4 className="font-bold text-green-400 mb-2">🌍 Multiple Biomes</h4>
            <p className="text-sm text-gray-300 mb-3">
              Each zone has unique themes and features:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <span className="text-gray-300"><span className="font-bold text-green-400">Farm:</span> Your starting zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏖️</span>
                <span className="text-gray-300"><span className="font-bold text-cyan-400">Beach:</span> Fishing & ocean resources</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏚️</span>
                <span className="text-gray-300"><span className="font-bold text-orange-400">Barn:</span> Dairy & livestock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⛰️</span>
                <span className="text-gray-300"><span className="font-bold text-gray-400">Mountain:</span> Mining & ore</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏜️</span>
                <span className="text-gray-300"><span className="font-bold text-yellow-400">Desert:</span> Exotic exploration</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-4 border border-purple-500/30">
            <h4 className="font-bold text-purple-400 mb-2">🌉 Zone Travel</h4>
            <p className="text-sm text-gray-300 mb-2">
              Build <span className="font-bold">Arches</span> to connect zones! Click an arch to instantly travel between your zones.
            </p>
            <p className="text-xs text-gray-400">
              Each zone needs its own wells, garages, and bot workforce!
            </p>
          </div>

          <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-yellow-400">💰 Expansion Cost:</span> Zones get progressively more expensive. Invest wisely!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Tips & Shortcuts",
      icon: "💡",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-3">
            <div className="text-5xl mb-2">🎮</div>
            <p className="text-gray-300">Pro tips to optimize your farm!</p>
          </div>

          <div className="space-y-3">
            <div className="bg-green-900/40 rounded-lg p-3 border border-green-500/40">
              <h4 className="font-bold text-green-400 mb-1">🎯 Task Queue</h4>
              <p className="text-sm text-gray-300">Your farmer queues all actions. Watch the blue queue panel to see what's coming up!</p>
            </div>

            <div className="bg-blue-900/40 rounded-lg p-3 border border-blue-500/40">
              <h4 className="font-bold text-blue-400 mb-1">💾 Auto-Save</h4>
              <p className="text-sm text-gray-300">Game auto-saves every 30 seconds. Click Save to get a 6-digit code that works on any device!</p>
            </div>

            <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/40">
              <h4 className="font-bold text-purple-400 mb-1">🔄 Auto-Buy Seeds</h4>
              <p className="text-sm text-gray-300">Toggle auto-buy in the shop to automatically purchase seeds when planting!</p>
            </div>

            <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/40">
              <h4 className="font-bold text-orange-400 mb-1">🤖 Farmer Automation</h4>
              <p className="text-sm text-gray-300">Enable farmer auto-actions in the left panel to automate planting, watering, harvesting, and selling!</p>
            </div>

            <div className="bg-cyan-900/40 rounded-lg p-3 border border-cyan-500/40">
              <h4 className="font-bold text-cyan-400 mb-1">💦 Sprinklers</h4>
              <p className="text-sm text-gray-300">Place sprinklers to auto-water a 7x7 area. They water daily and on placement!</p>
            </div>

            <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/40">
              <h4 className="font-bold text-red-400 mb-1">📊 Track Income</h4>
              <p className="text-sm text-gray-300">Click 💰 Income History to see revenue breakdown by crop and zone!</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/40 to-green-900/40 rounded-lg p-4 border border-yellow-500/30 text-center">
            <p className="text-lg font-bold text-yellow-400 mb-2">Ready to Farm?</p>
            <p className="text-sm text-gray-300">Start small, automate everything, and build your empire! 🚜</p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900 via-emerald-950 to-green-900 text-white rounded-2xl max-w-4xl w-full max-h-[95vh] border-4 border-green-500/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentPageData.icon}</span>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {currentPageData.title}
              </h2>
              <p className="text-sm text-gray-400">
                Page {currentPage + 1} of {pages.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
            title="Close tutorial"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentPageData.content}
        </div>

        {/* Progress Dots */}
        <div className="flex-shrink-0 flex justify-center gap-2 py-3 border-t border-green-500/30">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage
                  ? 'bg-green-400 w-6'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-green-500/30 bg-black/30">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
              currentPage === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
            }`}
          >
            ← Previous
          </button>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-white transition-colors underline"
            >
              Skip Tutorial
            </button>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-lg transition-all"
          >
            {currentPage === pages.length - 1 ? "Let's Farm! 🚜" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
