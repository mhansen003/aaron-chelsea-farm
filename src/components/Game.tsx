'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createInitialState,
  updateGameState,
  clearTile,
  plantSeed,
  harvestCrop,
  waterTile,
  placeSprinkler,
  sellCrop,
  buySeeds,
  buyTool,
  buySprinklers,
  GAME_CONFIG,
  CROP_INFO,
} from '@/lib/gameEngine';
import { GameState, CropType, ToolType } from '@/types/game';
import Shop from './Shop';
import SellShop from './SellShop';

const COLORS = {
  grass: '#7cb342',
  dirt: '#8d6e63',
  rock: '#616161',
  tree: '#2e7d32',
  planted: '#9c8f5e',
  grown: '#fdd835',
  player: '#2196f3',
  grid: '#ffffff20',
};

const TOOL_ICONS: Record<ToolType, string> = {
  hoe: '⛏️',
  seed_bag: '🌱',
  scythe: '🌾',
  watering_can: '💧',
  water_sprinkler: '💦',
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showShop, setShowShop] = useState(false);
  const [showSellShop, setShowSellShop] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [sellMessage, setSellMessage] = useState<string>('');
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const grassImageRef = useRef<HTMLImageElement | null>(null);
  const farmerImageRef = useRef<HTMLImageElement | null>(null);
  const treeImageRef = useRef<HTMLImageElement | null>(null);
  const plantedCropImageRef = useRef<HTMLImageElement | null>(null);
  const carrotsImageRef = useRef<HTMLImageElement | null>(null);

  // Load all textures
  useEffect(() => {
    const grassImg = new Image();
    grassImg.src = '/grass.png';
    grassImg.onload = () => {
      grassImageRef.current = grassImg;
    };

    const farmerImg = new Image();
    farmerImg.src = '/farmer.png';
    farmerImg.onload = () => {
      farmerImageRef.current = farmerImg;
    };

    const treeImg = new Image();
    treeImg.src = '/forest.png';
    treeImg.onload = () => {
      treeImageRef.current = treeImg;
    };

    const plantedImg = new Image();
    plantedImg.src = '/planted crop.png';
    plantedImg.onload = () => {
      plantedCropImageRef.current = plantedImg;
    };

    const carrotsImg = new Image();
    carrotsImg.src = '/carrots.png';
    carrotsImg.onload = () => {
      carrotsImageRef.current = carrotsImg;
    };
  }, []);

  // Background music
  useEffect(() => {
    audioRef.current = new Audio('/harvest-dreams.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Auto-play attempt (may require user interaction)
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented, will need user click
        console.log('Audio autoplay prevented');
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime < 1000) {
        setGameState(prev => updateGameState(prev, deltaTime));
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with green farm background
    ctx.fillStyle = '#7cb342'; // Green grass color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    gameState.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const px = x * GAME_CONFIG.tileSize;
        const py = y * GAME_CONFIG.tileSize;

        // Tile background
        if (tile.type === 'grass' && grassImageRef.current) {
          // Draw grass texture
          ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'tree' && treeImageRef.current) {
          // Draw tree sprite
          ctx.drawImage(treeImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'planted' && plantedCropImageRef.current) {
          // Draw dirt first, then planted crop sprite on top
          ctx.fillStyle = COLORS.dirt;
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          ctx.drawImage(plantedCropImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'carrot' && carrotsImageRef.current) {
          // Draw dirt first, then grown carrots sprite on top
          ctx.fillStyle = COLORS.dirt;
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          ctx.drawImage(carrotsImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown') {
          // Draw dirt + generic grown crop (golden)
          ctx.fillStyle = COLORS.dirt;
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          ctx.fillStyle = COLORS.grown;
          ctx.fillRect(
            px + GAME_CONFIG.tileSize / 4,
            py + GAME_CONFIG.tileSize / 4,
            GAME_CONFIG.tileSize / 2,
            GAME_CONFIG.tileSize / 2
          );
        } else {
          // Draw solid color for other tiles (rock, dirt, etc.)
          ctx.fillStyle = COLORS[tile.type] || COLORS.grass;
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        }

        // Grid lines
        ctx.strokeStyle = COLORS.grid;
        ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
      });
    });

    // Draw player
    const playerPx = gameState.player.x * GAME_CONFIG.tileSize;
    const playerPy = gameState.player.y * GAME_CONFIG.tileSize;

    if (farmerImageRef.current) {
      // Draw farmer sprite
      ctx.drawImage(farmerImageRef.current, playerPx, playerPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
    } else {
      // Fallback to blue circle
      const centerX = playerPx + GAME_CONFIG.tileSize / 2;
      const centerY = playerPy + GAME_CONFIG.tileSize / 2;
      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw tool icon above player
    const toolIcon = TOOL_ICONS[gameState.player.selectedTool];
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(toolIcon, playerPx + GAME_CONFIG.tileSize / 2, playerPy - 8);

  }, [gameState]);

  // Handle tool-based interactions
  const handleInteraction = useCallback(() => {
    const { x, y, selectedTool, selectedCrop } = gameState.player;
    const tile = gameState.grid[y]?.[x];
    if (!tile) return;

    switch (selectedTool) {
      case 'hoe':
        // Clear rocks and trees
        if (!tile.cleared) {
          setGameState(prev => clearTile(prev, x, y));
        }
        break;

      case 'seed_bag':
        // Plant seeds
        if (tile.cleared && !tile.crop && selectedCrop) {
          setGameState(prev => plantSeed(prev, x, y, selectedCrop));
        }
        break;

      case 'scythe':
        // Harvest crops
        if (tile.type === 'grown') {
          setGameState(prev => harvestCrop(prev, x, y));
        }
        break;

      case 'watering_can':
        // Water single tile for the day
        setGameState(prev => waterTile(prev, x, y));
        break;

      case 'water_sprinkler':
        // Place permanent sprinkler
        setGameState(prev => placeSprinkler(prev, x, y));
        break;
    }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { x, y } = gameState.player;
      let newX = x;
      let newY = y;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          newY = Math.max(0, y - 1);
          break;
        case 'ArrowDown':
        case 's':
          newY = Math.min(GAME_CONFIG.gridHeight - 1, y + 1);
          break;
        case 'ArrowLeft':
        case 'a':
          newX = Math.max(0, x - 1);
          break;
        case 'ArrowRight':
        case 'd':
          newX = Math.min(GAME_CONFIG.gridWidth - 1, x + 1);
          break;
        case ' ':
        case 'e':
          handleInteraction();
          return;
        case 'b':
          setShowShop(!showShop);
          return;
        case 'v':
          setShowSellShop(!showSellShop);
          return;
        case 'h':
          setShowInstructions(!showInstructions);
          return;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          // Number keys select tools
          const toolIndex = parseInt(e.key) - 1;
          const unlockedTools = gameState.tools.filter(t => t.unlocked);
          if (toolIndex < unlockedTools.length) {
            setGameState(prev => ({
              ...prev,
              player: { ...prev.player, selectedTool: unlockedTools[toolIndex].name },
            }));
          }
          return;
        case '6':
        case '7':
        case '8':
        case 'q':
          // Quick crop selection
          e.preventDefault();
          const crops: Array<Exclude<CropType, null>> = ['carrot', 'wheat', 'tomato'];
          let cropIndex = 0;
          if (e.key === '6' || e.key === 'q') cropIndex = 0; // Carrot
          else if (e.key === '7') cropIndex = 1; // Wheat
          else if (e.key === '8') cropIndex = 2; // Tomato

          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              selectedCrop: crops[cropIndex],
              selectedTool: 'seed_bag', // Auto-switch to seed bag
            },
          }));
          return;
      }

      if (newX !== x || newY !== y) {
        setGameState(prev => ({
          ...prev,
          player: { ...prev.player, x: newX, y: newY },
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleInteraction, showShop, showSellShop, showInstructions]);

  const handleNewGame = () => {
    setGameState(createInitialState());
    setSellMessage('');
    setShowShop(false);
    setShowSellShop(false);
    setShowInstructions(false);
  };

  return (
    <div className="relative flex flex-col items-center gap-4 p-4">
      {/* Game Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold text-white">
          🌾 Aaron & Chelsea&apos;s Farm 🌾
        </h1>
        <button
          onClick={handleNewGame}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
        >
          🔄 New Game
        </button>
        <button
          onClick={() => setShowInstructions(true)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold"
        >
          ❓ Help
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        {/* Player Stats */}
        <div className="bg-black/50 px-6 py-4 rounded-lg text-white">
          <h3 className="font-bold text-xl mb-2">👨‍🌾 Player Stats</h3>
          <div className="space-y-1">
            <div className="font-bold">💰 Money: ${gameState.player.money}</div>
            <div>🥕 Carrot Seeds: {gameState.player.inventory.seeds.carrot} (Gen {gameState.player.inventory.seedQuality.carrot.generation})</div>
            <div>🌾 Wheat Seeds: {gameState.player.inventory.seeds.wheat} (Gen {gameState.player.inventory.seedQuality.wheat.generation})</div>
            <div>🍅 Tomato Seeds: {gameState.player.inventory.seeds.tomato} (Gen {gameState.player.inventory.seedQuality.tomato.generation})</div>
            <div>💦 Sprinklers: {gameState.player.inventory.sprinklers}</div>
          </div>
        </div>

        {/* Day & Time */}
        <div className="bg-black/50 px-6 py-4 rounded-lg text-white">
          <h3 className="font-bold text-xl mb-2">📅 Day {gameState.currentDay}</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span>⏰ Day Progress:</span>
                <span>{Math.floor(gameState.dayProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${gameState.dayProgress}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-300">
              <div>🌱 Growth Tips:</div>
              <div>• Plants need water daily to grow</div>
              <div>• Use sprinklers for auto-watering</div>
            </div>
          </div>
        </div>
      </div>

      {/* Harvested Crops */}
      <div className="bg-black/50 px-6 py-3 rounded-lg text-white">
        <strong>Harvested:</strong> 🥕 {gameState.player.inventory.harvested.carrot} | 🌾 {gameState.player.inventory.harvested.wheat} | 🍅 {gameState.player.inventory.harvested.tomato}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.gridWidth * GAME_CONFIG.tileSize}
        height={GAME_CONFIG.gridHeight * GAME_CONFIG.tileSize}
        className="border-4 border-white rounded-lg shadow-2xl"
      />

      {/* Tool Selection */}
      <div className="bg-black/50 px-6 py-4 rounded-lg text-white w-full max-w-4xl">
        <h3 className="font-bold text-lg mb-3">🛠️ Tools (Press 1-5 or click to select):</h3>
        <div className="flex gap-3 flex-wrap">
          {gameState.tools
            .filter(t => t.unlocked)
            .map((tool, idx) => (
              <button
                key={tool.name}
                onClick={() =>
                  setGameState(prev => ({
                    ...prev,
                    player: { ...prev.player, selectedTool: tool.name },
                  }))
                }
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  gameState.player.selectedTool === tool.name
                    ? 'bg-blue-600 ring-4 ring-blue-300 scale-110'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">{TOOL_ICONS[tool.name]}</div>
                <div className="text-xs">{idx + 1}. {tool.description}</div>
              </button>
            ))}
        </div>
      </div>

      {/* Crop Selection - Quick Buttons */}
      <div className="bg-black/50 px-6 py-4 rounded-lg text-white w-full max-w-4xl">
        <h3 className="font-bold text-lg mb-3">🌱 Quick Crop Select (Press 6/7/8 or Q, auto-switches to Seed Bag):</h3>
        <div className="flex gap-3">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'carrot', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-6 py-3 rounded-lg font-bold transition-all flex-1 ${
              gameState.player.selectedCrop === 'carrot' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-orange-600 ring-4 ring-orange-300 scale-105'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">🥕</div>
            <div className="text-xs">6/Q. Carrot ({gameState.player.inventory.seeds.carrot} seeds)</div>
          </button>
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'wheat', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-6 py-3 rounded-lg font-bold transition-all flex-1 ${
              gameState.player.selectedCrop === 'wheat' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-yellow-600 ring-4 ring-yellow-300 scale-105'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">🌾</div>
            <div className="text-xs">7. Wheat ({gameState.player.inventory.seeds.wheat} seeds)</div>
          </button>
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'tomato', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-6 py-3 rounded-lg font-bold transition-all flex-1 ${
              gameState.player.selectedCrop === 'tomato' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-red-600 ring-4 ring-red-300 scale-105'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">🍅</div>
            <div className="text-xs">8. Tomato ({gameState.player.inventory.seeds.tomato} seeds)</div>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center flex-wrap justify-center">
        <button
          onClick={() => setShowShop(!showShop)}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
        >
          🏪 Buy Seeds & Tools (B)
        </button>

        <button
          onClick={() => setShowSellShop(!showSellShop)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
        >
          💰 Sell Crops (V)
        </button>
      </div>

      {/* Sell Message */}
      {sellMessage && (
        <div
          className={`text-white px-6 py-3 rounded-lg font-bold ${
            sellMessage.includes('Sold') ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {sellMessage}
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-4 border-green-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">📖 How to Play</h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-2xl hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Movement:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>WASD or Arrow Keys:</strong> Move your farmer around the grid</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Tools:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Press 1-5 or Click:</strong> Select a tool</li>
                  <li><strong>Space or E:</strong> Use the selected tool</li>
                  <li><strong>{TOOL_ICONS.hoe} Hoe (1):</strong> Clear rocks and trees to prepare soil</li>
                  <li><strong>{TOOL_ICONS.seed_bag} Seed Bag (2):</strong> Plant seeds on cleared brown dirt</li>
                  <li><strong>{TOOL_ICONS.scythe} Scythe (3):</strong> Harvest golden grown crops</li>
                  <li><strong>{TOOL_ICONS.watering_can} Watering Can:</strong> Water 1 tile (+20% growth)</li>
                  <li><strong>{TOOL_ICONS.water_sprinkler} Sprinkler:</strong> Water 3x3 area (+20% growth)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Gameplay Loop:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Use <strong>Hoe</strong> to clear rocks/trees → creates brown dirt</li>
                  <li>Select <strong>Seed Bag</strong> and choose a crop</li>
                  <li>Stand on brown dirt and press Space to plant</li>
                  <li>Wait for crops to grow (or speed up with watering)</li>
                  <li>Use <strong>Scythe</strong> on golden crops to harvest</li>
                  <li>Harvesting gives you money + 1 seed back!</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Community Management:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Press F:</strong> Feed your community</li>
                  <li>Requires: 2 carrots, 3 wheat, 1 tomato (balanced diet!)</li>
                  <li>Hunger depletes 2% per second - don&apos;t let them starve!</li>
                  <li>Happiness increases when fed, decreases when hungry</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Seed Quality System:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>10% chance per harvest to upgrade seed generation</li>
                  <li>Higher generations = more money (up to 3x) and faster growth (up to 2x)</li>
                  <li>Build up your seed quality for exponential gains!</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Quick Crop Selection:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>6 or Q:</strong> Select Carrot + auto-switch to Seed Bag</li>
                  <li><strong>7:</strong> Select Wheat + auto-switch to Seed Bag</li>
                  <li><strong>8:</strong> Select Tomato + auto-switch to Seed Bag</li>
                  <li>No more dropdown! Instantly switch crops and start planting</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Other Controls:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>B:</strong> Open shop to buy seeds and tools</li>
                  <li><strong>H:</strong> Toggle this help screen</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg"
            >
              Got it! Let&apos;s Farm! 🌾
            </button>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <Shop
          gameState={gameState}
          onClose={() => setShowShop(false)}
          onBuySeeds={(crop, amount) => setGameState(prev => buySeeds(prev, crop, amount))}
          onBuyTool={toolName => setGameState(prev => buyTool(prev, toolName))}
          onBuySprinklers={amount => setGameState(prev => buySprinklers(prev, amount))}
        />
      )}

      {/* Sell Shop Modal */}
      {showSellShop && (
        <SellShop
          gameState={gameState}
          onClose={() => setShowSellShop(false)}
          onSellCrop={(crop, amount) => {
            const result = sellCrop(gameState, crop, amount);
            setSellMessage(result.message);
            if (result.success) {
              setGameState(result.state);
            }
            setTimeout(() => setSellMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
}
