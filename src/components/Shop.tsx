'use client';

import { GameState, CropType } from '@/types/game';

interface ShopProps {
  gameState: GameState;
  onClose: () => void;
  onBuySeeds: (crop: CropType, amount: number) => void;
  onBuyTool: (toolName: string) => void;
}

const SEED_INFO = {
  carrot: { name: 'Carrot Seeds', price: 2, emoji: '🥕', nutrition: 3 },
  wheat: { name: 'Wheat Seeds', price: 1, emoji: '🌾', nutrition: 2 },
  tomato: { name: 'Tomato Seeds', price: 4, emoji: '🍅', nutrition: 4 },
};

export default function Shop({ gameState, onClose, onBuySeeds, onBuyTool }: ShopProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-4 border-amber-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🏪 Farm Shop</h2>
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

        {/* Seeds Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-4 text-amber-300">🌱 Seeds</h3>
          <div className="grid gap-4">
            {Object.entries(SEED_INFO).map(([cropKey, info]) => {
              const crop = cropKey as CropType;
              const owned = gameState.player.inventory.seeds[crop];
              const canBuy1 = gameState.player.money >= info.price;
              const canBuy5 = gameState.player.money >= info.price * 5;

              return (
                <div
                  key={crop}
                  className="bg-black/40 p-4 rounded-lg border-2 border-amber-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-2xl mr-2">{info.emoji}</span>
                      <span className="font-bold">{info.name}</span>
                    </div>
                    <div className="text-amber-300 font-bold">${info.price} each</div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="text-green-400">Nutrition: {info.nutrition}/crop</span>
                    {' • '}
                    <span className="text-blue-400">Owned: {owned}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBuySeeds(crop, 1)}
                      disabled={!canBuy1}
                      className={`px-4 py-2 rounded font-bold flex-1 ${
                        canBuy1
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Buy 1
                    </button>
                    <button
                      onClick={() => onBuySeeds(crop, 5)}
                      disabled={!canBuy5}
                      className={`px-4 py-2 rounded font-bold flex-1 ${
                        canBuy5
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Buy 5 (${info.price * 5})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-amber-300">🛠️ Tools</h3>
          <div className="grid gap-4">
            {gameState.tools.map(tool => (
              <div
                key={tool.name}
                className={`p-4 rounded-lg border-2 ${
                  tool.unlocked
                    ? 'bg-green-900/40 border-green-600'
                    : 'bg-black/40 border-amber-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold capitalize">
                    {tool.name.replace('_', ' ')}
                  </span>
                  {tool.unlocked ? (
                    <span className="text-green-400 font-bold">✓ OWNED</span>
                  ) : (
                    <span className="text-amber-300 font-bold">${tool.cost}</span>
                  )}
                </div>
                <div className="text-sm mb-2 text-gray-300">{tool.description}</div>
                {!tool.unlocked && (
                  <button
                    onClick={() => onBuyTool(tool.name)}
                    disabled={gameState.player.money < tool.cost}
                    className={`px-4 py-2 rounded font-bold w-full ${
                      gameState.player.money >= tool.cost
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Buy Tool
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
        >
          Close Shop
        </button>
      </div>
    </div>
  );
}
