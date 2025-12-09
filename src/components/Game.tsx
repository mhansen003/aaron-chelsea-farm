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
  shop: '#ff9800',
  waterbot: '#00bcd4',
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
  const rockImageRef = useRef<HTMLImageElement | null>(null);
  const dirtImageRef = useRef<HTMLImageElement | null>(null);
  const shopImageRef = useRef<HTMLImageElement | null>(null);
  const sprinklerImageRef = useRef<HTMLImageElement | null>(null);
  const waterBotImageRef = useRef<HTMLImageElement | null>(null);

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

    const rockImg = new Image();
    rockImg.src = '/rocks.png';
    rockImg.onload = () => {
      rockImageRef.current = rockImg;
    };

    const dirtImg = new Image();
    dirtImg.src = '/dirt.png';
    dirtImg.onload = () => {
      dirtImageRef.current = dirtImg;
    };

    const shopImg = new Image();
    shopImg.src = '/shop.png';
    shopImg.onload = () => {
      shopImageRef.current = shopImg;
    };

    const sprinklerImg = new Image();
    sprinklerImg.src = '/sprinklers.png';
    sprinklerImg.onload = () => {
      sprinklerImageRef.current = sprinklerImg;
    };

    const waterBotImg = new Image();
    waterBotImg.src = '/water bot.png';
    waterBotImg.onload = () => {
      waterBotImageRef.current = waterBotImg;
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
        } else if (tile.type === 'rock' && rockImageRef.current) {
          // Draw rock sprite
          ctx.drawImage(rockImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'dirt' && dirtImageRef.current) {
          // Draw dirt sprite
          ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'shop' && shopImageRef.current) {
          // Draw shop sprite
          ctx.drawImage(shopImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'waterbot' && waterBotImageRef.current) {
          // Draw water bot sprite
          ctx.drawImage(waterBotImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'planted' && plantedCropImageRef.current) {
          // Draw dirt first, then planted crop sprite on top
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(plantedCropImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'carrot' && carrotsImageRef.current) {
          // Draw dirt first, then grown carrots sprite on top
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(carrotsImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown') {
          // Draw dirt + generic grown crop (golden)
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.fillStyle = COLORS.grown;
          ctx.fillRect(
            px + GAME_CONFIG.tileSize / 4,
            py + GAME_CONFIG.tileSize / 4,
            GAME_CONFIG.tileSize / 2,
            GAME_CONFIG.tileSize / 2
          );
        } else {
          // Draw solid color for other tiles
          ctx.fillStyle = COLORS[tile.type] || COLORS.grass;
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        }

        // Draw sprinkler if placed on this tile
        if (tile.hasSprinkler && sprinklerImageRef.current) {
          ctx.drawImage(sprinklerImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
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
    <div className="relative flex flex-col items-center gap-2 p-2">
      {/* Compact Top Bar */}
      <div className="w-full bg-black/70 px-4 py-2 rounded-lg text-white flex items-center justify-between">
        {/* Left: Title & Actions */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">🌾 Aaron & Chelsea's Farm</h1>
          <button onClick={handleNewGame} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold">🔄</button>
          <button onClick={() => setShowInstructions(true)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold">❓</button>
          <button onClick={() => setShowShop(!showShop)} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-bold">🏪 Buy</button>
          <button onClick={() => setShowSellShop(!showSellShop)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold">💰 Sell</button>
        </div>

        {/* Right: Stats Icons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><span>💰</span><span className="font-bold">${gameState.player.money}</span></div>
          <div className="flex items-center gap-1"><span>📅</span><span>Day {gameState.currentDay}</span></div>
          <div className="flex items-center gap-1"><span>🥕</span><span>{gameState.player.inventory.seeds.carrot}</span></div>
          <div className="flex items-center gap-1"><span>🌾</span><span>{gameState.player.inventory.seeds.wheat}</span></div>
          <div className="flex items-center gap-1"><span>🍅</span><span>{gameState.player.inventory.seeds.tomato}</span></div>
          <div className="flex items-center gap-1"><span>💦</span><span>{gameState.player.inventory.sprinklers}</span></div>
        </div>
      </div>

      {/* Day Progress Bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full">
        <div
          className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-500 rounded-full transition-all"
          style={{ width: `${gameState.dayProgress}%` }}
        />
      </div>

      {/* Harvested (compact) */}
      <div className="w-full bg-black/50 px-4 py-1 rounded text-white text-sm flex gap-4">
        <span>Harvested:</span>
        <span>🥕 {gameState.player.inventory.harvested.carrot}</span>
        <span>🌾 {gameState.player.inventory.harvested.wheat}</span>
        <span>🍅 {gameState.player.inventory.harvested.tomato}</span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.gridWidth * GAME_CONFIG.tileSize}
        height={GAME_CONFIG.gridHeight * GAME_CONFIG.tileSize}
        className="border-4 border-white rounded-lg shadow-2xl"
      />

      {/* Tool & Crop Selection (Compact) */}
      <div className="flex gap-2 w-full">
        {/* Tools */}
        <div className="flex gap-2">
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
                className={`px-3 py-2 rounded font-bold transition-all text-2xl ${
                  gameState.player.selectedTool === tool.name
                    ? 'bg-blue-600 ring-2 ring-blue-300'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={`${idx + 1}. ${tool.description}`}
              >
                {TOOL_ICONS[tool.name]}
              </button>
            ))}
        </div>

        {/* Crops */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'carrot', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-3 py-2 rounded font-bold text-2xl ${
              gameState.player.selectedCrop === 'carrot' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-orange-600 ring-2 ring-orange-300'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="6/Q: Plant Carrots"
          >
            🥕
          </button>
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'wheat', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-3 py-2 rounded font-bold text-2xl ${
              gameState.player.selectedCrop === 'wheat' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-yellow-600 ring-2 ring-yellow-300'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="7: Plant Wheat"
          >
            🌾
          </button>
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'tomato', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-3 py-2 rounded font-bold text-2xl ${
              gameState.player.selectedCrop === 'tomato' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-red-600 ring-2 ring-red-300'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="8: Plant Tomatoes"
          >
            🍅
          </button>
        </div>
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
