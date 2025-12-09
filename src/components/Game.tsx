'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createInitialState,
  updateGameState,
  clearTile,
  plantSeed,
  harvestCrop,
  feedCommunity,
  GAME_CONFIG,
} from '@/lib/gameEngine';
import { GameState, CropType } from '@/types/game';
import Shop from './Shop';

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

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [selectedCrop, setSelectedCrop] = useState<CropType>('carrot');
  const [showShop, setShowShop] = useState(false);
  const [feedMessage, setFeedMessage] = useState<string>('');
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime < 1000) {
        // Prevent large jumps
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

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    gameState.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const px = x * GAME_CONFIG.tileSize;
        const py = y * GAME_CONFIG.tileSize;

        // Tile background
        ctx.fillStyle = COLORS[tile.type] || COLORS.grass;
        ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

        // Growth indicator
        if (tile.type === 'planted' || tile.type === 'grown') {
          const growthHeight = (tile.growthStage / 100) * GAME_CONFIG.tileSize;
          ctx.fillStyle = tile.type === 'grown' ? '#ffd700' : '#90ee90';
          ctx.fillRect(
            px + GAME_CONFIG.tileSize / 4,
            py + GAME_CONFIG.tileSize - growthHeight,
            GAME_CONFIG.tileSize / 2,
            growthHeight
          );
        }

        // Grid lines
        ctx.strokeStyle = COLORS.grid;
        ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
      });
    });

    // Draw player
    const playerPx = gameState.player.x * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2;
    const playerPy = gameState.player.y * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2;

    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(playerPx, playerPy, GAME_CONFIG.tileSize / 3, 0, Math.PI * 2);
    ctx.fill();

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
          // Interact with tile
          handleInteraction(x, y);
          return;
        case 'b':
          setShowShop(!showShop);
          return;
        case 'f':
          // Feed the community
          const result = feedCommunity(gameState);
          setFeedMessage(result.message);
          if (result.success) {
            setGameState(result.state);
          }
          setTimeout(() => setFeedMessage(''), 3000);
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
  }, [gameState, selectedCrop, showShop]);

  const handleInteraction = useCallback(
    (x: number, y: number) => {
      const tile = gameState.grid[y]?.[x];
      if (!tile) return;

      if (!tile.cleared) {
        // Clear the tile
        setGameState(prev => clearTile(prev, x, y));
      } else if (tile.type === 'dirt' && selectedCrop) {
        // Plant a seed
        setGameState(prev => plantSeed(prev, x, y, selectedCrop));
      } else if (tile.type === 'grown') {
        // Harvest the crop
        setGameState(prev => harvestCrop(prev, x, y));
      }
    },
    [gameState, selectedCrop]
  );

  return (
    <div className="relative flex flex-col items-center gap-4 p-4">
      {/* Game Title */}
      <h1 className="text-4xl font-bold text-white">
        🌾 Aaron & Chelsea&apos;s Farm 🌾
      </h1>

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
          </div>
        </div>

        {/* Community Stats */}
        <div className="bg-black/50 px-6 py-4 rounded-lg text-white">
          <h3 className="font-bold text-xl mb-2">👥 Community ({gameState.community.people} people)</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span>🍖 Hunger:</span>
                <span className={gameState.community.hunger < 30 ? 'text-red-400' : ''}>
                  {Math.floor(gameState.community.hunger)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    gameState.community.hunger < 30 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${gameState.community.hunger}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>😊 Happiness:</span>
                <span>{Math.floor(gameState.community.happiness)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${gameState.community.happiness}%` }}
                />
              </div>
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

      {/* Controls */}
      <div className="flex gap-4 items-center flex-wrap justify-center">
        <div className="text-white bg-black/50 px-4 py-2 rounded-lg">
          <strong>Selected Crop:</strong>
          <select
            value={selectedCrop || ''}
            onChange={e => setSelectedCrop(e.target.value as CropType)}
            className="ml-2 px-2 py-1 rounded bg-gray-700 text-white"
          >
            <option value="carrot">🥕 Carrot</option>
            <option value="wheat">🌾 Wheat</option>
            <option value="tomato">🍅 Tomato</option>
          </select>
        </div>

        <button
          onClick={() => setShowShop(!showShop)}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
        >
          🏪 Shop (B)
        </button>

        <button
          onClick={() => {
            const result = feedCommunity(gameState);
            setFeedMessage(result.message);
            if (result.success) {
              setGameState(result.state);
            }
            setTimeout(() => setFeedMessage(''), 3000);
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
        >
          🍽️ Feed Community (F)
        </button>
      </div>

      {/* Feed Message */}
      {feedMessage && (
        <div className={`text-white px-6 py-3 rounded-lg font-bold ${
          feedMessage.includes('successfully') ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {feedMessage}
        </div>
      )}

      {/* Dietary Needs */}
      <div className="text-white bg-black/50 px-6 py-3 rounded-lg">
        <strong>Community Needs per Feeding:</strong> 🥕 {gameState.community.dietaryNeeds.carrot} | 🌾 {gameState.community.dietaryNeeds.wheat} | 🍅 {gameState.community.dietaryNeeds.tomato}
      </div>

      {/* Instructions */}
      <div className="text-white bg-black/50 px-6 py-4 rounded-lg max-w-2xl">
        <h3 className="font-bold mb-2">How to Play:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>WASD/Arrow Keys:</strong> Move your farmer</li>
          <li><strong>Space/E:</strong> Interact (clear rocks/trees, plant seeds, harvest crops)</li>
          <li><strong>B:</strong> Open shop to buy seeds and tools</li>
          <li><strong>F:</strong> Feed your community (requires balanced diet!)</li>
          <li>Clear obstacles (rocks/trees) to make farmable land</li>
          <li>Plant seeds on cleared dirt and wait for them to grow</li>
          <li>Harvest crops for money AND to get seeds back!</li>
          <li><strong>Seed Quality:</strong> When harvesting, you get 1 seed back. Seeds have a 10% chance to improve in generation, yielding more money and growing faster!</li>
          <li><strong>Keep Your Community Fed:</strong> Their hunger depletes over time. Feed them a balanced diet (carrots, wheat, tomatoes) to keep happiness high!</li>
        </ul>
      </div>

      {/* Shop Modal */}
      {showShop && (
        <Shop
          gameState={gameState}
          onClose={() => setShowShop(false)}
          onBuySeeds={(crop, amount) =>
            setGameState(prev => {
              const cost = (crop === 'carrot' ? 2 : crop === 'wheat' ? 1 : 4) * amount;
              if (prev.player.money < cost) return prev;
              return {
                ...prev,
                player: {
                  ...prev.player,
                  money: prev.player.money - cost,
                  inventory: {
                    ...prev.player.inventory,
                    seeds: {
                      ...prev.player.inventory.seeds,
                      [crop]: prev.player.inventory.seeds[crop] + amount,
                    },
                  },
                },
              };
            })
          }
          onBuyTool={toolName =>
            setGameState(prev => {
              const tool = prev.tools.find(t => t.name === toolName);
              if (!tool || tool.unlocked || prev.player.money < tool.cost) return prev;
              return {
                ...prev,
                player: {
                  ...prev.player,
                  money: prev.player.money - tool.cost,
                },
                tools: prev.tools.map(t =>
                  t.name === toolName ? { ...t, unlocked: true } : t
                ),
              };
            })
          }
        />
      )}
    </div>
  );
}
