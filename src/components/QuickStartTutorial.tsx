'use client';

interface QuickStartTutorialProps {
  onClose: () => void;
}

export default function QuickStartTutorial({ onClose }: QuickStartTutorialProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl max-w-3xl w-full max-h-[90vh] border border-slate-600/50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📖</span>
                Quick Start Tutorial
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Learn the basics of My Bot Farm
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Movement */}
          <div className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <span>🚶</span>
              Movement & Controls
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">WASD</strong> or <strong className="text-white">Arrow Keys</strong> - Move your farmer around the farm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Click tiles</strong> - Interact with the environment (till, plant, water, harvest)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Space</strong> - Pause/Unpause the game</span>
              </li>
            </ul>
          </div>

          {/* Farming Basics */}
          <div className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <h3 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <span>🌾</span>
              Farming Basics
            </h3>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside">
              <li><strong className="text-white">Clear grass</strong> - Click grass tiles to till them into farmable dirt</li>
              <li><strong className="text-white">Plant seeds</strong> - Click tilled dirt to plant crops (buy seeds from shop first!)</li>
              <li><strong className="text-white">Water crops</strong> - Click planted crops to water them (required for growth)</li>
              <li><strong className="text-white">Harvest</strong> - Click fully grown crops to harvest and add to your basket</li>
              <li><strong className="text-white">Sell crops</strong> - Mark crops in warehouse for sale, transport bot will sell them</li>
            </ol>
          </div>

          {/* Buildings */}
          <div className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span>🏗️</span>
              Important Buildings
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏪</span>
                <div>
                  <div className="font-bold text-white">Shop</div>
                  <div className="text-sm text-slate-400">Buy seeds, tools, and upgrades</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏛️</span>
                <div>
                  <div className="font-bold text-white">Warehouse</div>
                  <div className="text-sm text-slate-400">Store crops and mark items for sale</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📤</span>
                <div>
                  <div className="font-bold text-white">Export Station</div>
                  <div className="text-sm text-slate-400">Where crops are sold at market prices</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏭</span>
                <div>
                  <div className="font-bold text-white">Bot Factory</div>
                  <div className="text-sm text-slate-400">Purchase automation bots (water, harvest, seed, transport)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏗️</span>
                <div>
                  <div className="font-bold text-white">Garage</div>
                  <div className="text-sm text-slate-400">Where idle bots return to rest</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bots */}
          <div className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <span>🤖</span>
              Automation Bots
            </h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Water Bots</strong> - Automatically water your crops</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Harvest Bots</strong> - Collect ripe crops and deposit to warehouse</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Seed Bots</strong> - Plant seeds according to programmed jobs</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Transport Bots</strong> - Pick up marked items from warehouse and sell at export</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Demolish Bots</strong> - Clear rocks and trees to expand your farm</span>
              </div>
            </div>
          </div>

          {/* Market Economy */}
          <div className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>📊</span>
              Market Economy
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Dynamic Pricing</strong> - Crop prices change based on seasons and demand</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">High Demand</strong> 🔥 - Some crops have increased prices</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Epic Pricing</strong> ⚡ - Rare 5x price multiplier on one crop</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 flex-shrink-0">▸</span>
                <span><strong className="text-white">Check Economy Modal</strong> - View price history & forecasts to plan sales</span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-700/50 p-5">
            <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
              <span>💡</span>
              Pro Tips
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 flex-shrink-0">▸</span>
                <span>Check market prices before marking crops for sale - wait for better prices!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 flex-shrink-0">▸</span>
                <span>Use the economy modal to see price forecasts and plan your crops</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 flex-shrink-0">▸</span>
                <span>Upgrade your basket capacity to carry more crops at once</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 flex-shrink-0">▸</span>
                <span>Bots work 24/7 - set them up and let them automate your empire!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 flex-shrink-0">▸</span>
                <span>Unlock new zones to access different crops and expand your farm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-700/50 p-4 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg transition-all border border-blue-500/30"
          >
            Got It! Let's Farm 🚜
          </button>
        </div>
      </div>
    </div>
  );
}
