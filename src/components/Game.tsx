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
  sellBasket,
  buySeeds,
  buyTool,
  buySprinklers,
  buyWaterbots,
  buyHarvestbots,
  upgradeBag,
  addTask,
  removeTask,
  getCurrentGrid,
  createZone,
  getZoneKey,
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
  arch: '#9e9e9e',
  archActive: '#4caf50',
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

  // Load saved game state from localStorage or create new game
  const loadSavedGame = (): GameState => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aaron-chelsea-farm-save');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          // Migrate old saves to new format (add missing fields)
          if (!parsed.taskQueue) {
            parsed.taskQueue = [];
          }
          if (!parsed.currentTask) {
            parsed.currentTask = null;
          }
          if (!parsed.player.farmName) {
            parsed.player.farmName = "Aaron & Chelsea's Farm";
          }
          if (!parsed.player.basketCapacity) {
            parsed.player.basketCapacity = 8;
          }
          if (parsed.player.visualX === undefined) {
            parsed.player.visualX = parsed.player.x;
          }
          if (parsed.player.visualY === undefined) {
            parsed.player.visualY = parsed.player.y;
          }

          return parsed as GameState;
        } catch (e) {
          console.error('Failed to load saved game:', e);
        }
      }
    }
    return createInitialState();
  };

  const [gameState, setGameState] = useState<GameState>(loadSavedGame());
  const [showShop, setShowShop] = useState(false);
  const [showSellShop, setShowSellShop] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showFarmNameEditor, setShowFarmNameEditor] = useState(false);
  const [sellMessage, setSellMessage] = useState<string>('');
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waterSplashRef = useRef<HTMLAudioElement | null>(null);
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
  const archImageRef = useRef<HTMLImageElement | null>(null);
  const workingImageRef = useRef<HTMLImageElement | null>(null);

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

    const archImg = new Image();
    archImg.src = '/arch.png';
    archImg.onload = () => {
      archImageRef.current = archImg;
    };

    const workingImg = new Image();
    workingImg.src = '/working.png';
    workingImg.onload = () => {
      workingImageRef.current = workingImg;
    };
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aaron-chelsea-farm-save', JSON.stringify(gameState));
    }
  }, [gameState]);

  // Auto-open shop when player is on shop tile
  useEffect(() => {
    const { x, y } = gameState.player;
    const zoneKey = `${gameState.currentZone.x},${gameState.currentZone.y}`;
    const grid = gameState.zones[zoneKey]?.grid;
    const tile = grid?.[y]?.[x];
    if (tile?.type === 'shop') {
      setShowShop(true);
    } else {
      setShowShop(false);
    }
  }, [gameState.player.x, gameState.player.y, gameState.zones, gameState.currentZone]);

  // Background music and sound effects
  useEffect(() => {
    // Background music
    audioRef.current = new Audio('/harvest-dreams.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Water splash sound effect
    waterSplashRef.current = new Audio('/water-splash.mp3');
    waterSplashRef.current.volume = 0.4;

    // Try to play music immediately
    const playMusic = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // If autoplay fails, try again on first user interaction
          const startAudio = () => {
            audioRef.current?.play();
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
          };
          document.addEventListener('click', startAudio, { once: true });
          document.addEventListener('keydown', startAudio, { once: true });
        });
      }
    };

    playMusic();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (waterSplashRef.current) {
        waterSplashRef.current = null;
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

  // Update canvas cursor based on selected tool
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create cursor emoji as data URL
    const createEmojiCursor = (emoji: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'default';

      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 16, 16);

      return `url(${canvas.toDataURL()}) 16 16, pointer`;
    };

    const toolIcon = TOOL_ICONS[gameState.player.selectedTool];
    canvas.style.cursor = createEmojiCursor(toolIcon);
  }, [gameState.player.selectedTool]);

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
    const currentGrid = getCurrentGrid(gameState);
    currentGrid.forEach((row, y) => {
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
          // Draw grass background first, then dirt sprite on top
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'shop' && shopImageRef.current) {
          // Draw shop sprite
          ctx.drawImage(shopImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'waterbot' && waterBotImageRef.current) {
          // Draw water bot sprite
          ctx.drawImage(waterBotImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'arch' && archImageRef.current && tile.archTargetZone) {
          // Draw arch - check if target zone is owned to determine color
          const zoneKey = `${tile.archTargetZone.x},${tile.archTargetZone.y}`;
          const targetZone = gameState.zones[zoneKey];
          const isActive = targetZone?.owned || false;

          // Draw grass background first
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Draw arch with tint overlay (gray if locked, green if active)
          ctx.drawImage(archImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

          if (!isActive) {
            // Gray tint for locked arch
            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
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

        // Draw growth progress bar for planted crops
        if (tile.type === 'planted' && tile.crop) {
          const barHeight = 4;
          const barY = py + GAME_CONFIG.tileSize - barHeight - 2;
          const barWidth = GAME_CONFIG.tileSize - 4;

          // Background
          ctx.fillStyle = '#00000088';
          ctx.fillRect(px + 2, barY, barWidth, barHeight);

          // Progress
          const progressWidth = (barWidth * tile.growthStage) / 100;
          ctx.fillStyle = tile.growthStage < 50 ? '#ff9800' : '#4caf50';
          ctx.fillRect(px + 2, barY, progressWidth, barHeight);

          // Blinking water droplet if not watered today
          if (!tile.wateredToday) {
            const blink = Math.floor(Date.now() / 500) % 2; // Blink every 500ms
            if (blink === 0) {
              ctx.font = '20px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('💧', px + GAME_CONFIG.tileSize / 2, py + 20);
            }
          }
        }

        // Draw blinking working icon for queued tasks
        const queuedTask = gameState.taskQueue.find(task =>
          task.tileX === x && task.tileY === y
        );
        if (queuedTask && workingImageRef.current) {
          const blink = Math.floor(Date.now() / 500) % 2; // Blink every 500ms
          if (blink === 0) {
            // Draw working icon overlay
            ctx.drawImage(workingImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
        }

        // Draw task progress bar if farmer is working on this tile
        if (gameState.currentTask &&
            gameState.currentTask.tileX === x &&
            gameState.currentTask.tileY === y) {
          const barHeight = 8;
          const barY = py + GAME_CONFIG.tileSize / 2 - barHeight / 2;
          const barWidth = GAME_CONFIG.tileSize - 8;

          // Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(px + 4, barY, barWidth, barHeight);

          // Progress
          const progressWidth = (barWidth * gameState.currentTask.progress) / 100;
          ctx.fillStyle = '#4caf50';
          ctx.fillRect(px + 4, barY, progressWidth, barHeight);

          // Border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 4, barY, barWidth, barHeight);
        }

        // Grid lines
        ctx.strokeStyle = COLORS.grid;
        ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
      });
    });

    // Draw player using visual position for smooth movement
    const visualX = gameState.player.visualX ?? gameState.player.x;
    const visualY = gameState.player.visualY ?? gameState.player.y;
    const playerPx = visualX * GAME_CONFIG.tileSize;
    const playerPy = visualY * GAME_CONFIG.tileSize;

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

  // Play water splash sound effect
  const playWaterSplash = useCallback(() => {
    if (waterSplashRef.current) {
      waterSplashRef.current.currentTime = 0; // Reset to start
      waterSplashRef.current.play().catch(() => {
        // Ignore errors if audio hasn't been initialized yet
      });
    }
  }, []);

  // Handle canvas click to queue tasks
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tileX = Math.floor(clickX / GAME_CONFIG.tileSize);
    const tileY = Math.floor(clickY / GAME_CONFIG.tileSize);

    const currentGrid = getCurrentGrid(gameState);
    const tile = currentGrid[tileY]?.[tileX];
    if (!tile) return;

    // Handle arch clicks for zone purchase/travel
    if (tile.type === 'arch' && tile.archTargetZone) {
      const zoneKey = `${tile.archTargetZone.x},${tile.archTargetZone.y}`;
      let targetZone = gameState.zones[zoneKey];

      // Create zone if it doesn't exist
      if (!targetZone) {
        targetZone = createZone(tile.archTargetZone.x, tile.archTargetZone.y, false);
        setGameState(prev => ({
          ...prev,
          zones: {
            ...prev.zones,
            [zoneKey]: targetZone,
          },
        }));
      }

      if (!targetZone.owned) {
        // Show purchase prompt
        const canAfford = gameState.player.money >= targetZone.purchasePrice;
        if (confirm(`Purchase this farmland for $${targetZone.purchasePrice}?${!canAfford ? '\n\nYou need more money!' : ''}`)) {
          if (canAfford) {
            setGameState(prev => ({
              ...prev,
              player: {
                ...prev.player,
                money: prev.player.money - targetZone.purchasePrice,
              },
              zones: {
                ...prev.zones,
                [zoneKey]: { ...targetZone, owned: true },
              },
            }));
          }
        }
      } else {
        // Travel to owned zone
        setGameState(prev => ({
          ...prev,
          currentZone: tile.archTargetZone!,
        }));
      }
      return;
    }

    const { selectedTool, selectedCrop } = gameState.player;

    // Add task based on selected tool
    switch (selectedTool) {
      case 'hoe':
        // Clear rocks and trees
        if (!tile.cleared) {
          setGameState(prev => addTask(prev, 'clear', tileX, tileY));
        }
        break;

      case 'seed_bag':
        // Plant seeds
        if (tile.cleared && !tile.crop && selectedCrop) {
          setGameState(prev => addTask(prev, 'plant', tileX, tileY, selectedCrop));
        }
        break;

      case 'scythe':
        // Harvest crops
        if (tile.type === 'grown') {
          setGameState(prev => addTask(prev, 'harvest', tileX, tileY));
        }
        break;

      case 'watering_can':
        // Water single tile for the day
        setGameState(prev => addTask(prev, 'water', tileX, tileY));
        playWaterSplash();
        break;

      case 'water_sprinkler':
        // Place permanent sprinkler
        setGameState(prev => addTask(prev, 'place_sprinkler', tileX, tileY));
        playWaterSplash(); // Also play sound for sprinkler placement
        break;
    }
  }, [gameState, playWaterSplash]);

  // Keyboard shortcuts (no movement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, showShop, showSellShop, showInstructions]);

  const handleNewGame = () => {
    setGameState(createInitialState());
    setSellMessage('');
    setShowShop(false);
    setShowSellShop(false);
    setShowInstructions(false);
  };

  return (
    <div className="fixed inset-0 flex gap-2 p-2 overflow-hidden">
      {/* Main Game Area */}
      <div className="flex flex-col items-center gap-2 flex-1 min-h-0">
      {/* Compact Top Bar */}
      <div className="w-full bg-black/70 px-4 py-2 rounded-lg text-white flex items-center justify-between">
        {/* Left: Title & Actions */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold cursor-pointer hover:text-green-300 transition-colors" onClick={() => setShowFarmNameEditor(true)}>
            🌾 {gameState.player.farmName} ✏️
          </h1>
          <button onClick={handleNewGame} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold">🔄</button>
          <button onClick={() => setShowInstructions(true)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold">❓</button>
          <button onClick={() => setShowShop(!showShop)} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-bold">🏪 Buy</button>
          <button onClick={() => setShowSellShop(!showSellShop)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold">💰 Sell</button>
        </div>

        {/* Right: Stats Icons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><span>💰</span><span className="font-bold">${gameState.player.money}</span></div>
          <div className="flex items-center gap-1"><span>🧺</span><span>{gameState.player.basket.length}/{gameState.player.basketCapacity}</span></div>
          <div className="flex items-center gap-1"><span>💦</span><span>{gameState.player.inventory.sprinklers}</span></div>
        </div>
      </div>


      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.gridWidth * GAME_CONFIG.tileSize}
        height={GAME_CONFIG.gridHeight * GAME_CONFIG.tileSize}
        className="border-4 border-white rounded-lg shadow-2xl"
        onClick={handleCanvasClick}
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
            className={`px-3 py-2 rounded font-bold text-2xl relative ${
              gameState.player.selectedCrop === 'carrot' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-orange-600 ring-2 ring-orange-300'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="6/Q: Plant Carrots"
          >
            🥕
            <div className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded px-1">{gameState.player.inventory.seeds.carrot}</div>
          </button>
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'wheat', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-3 py-2 rounded font-bold text-2xl relative ${
              gameState.player.selectedCrop === 'wheat' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-yellow-600 ring-2 ring-yellow-300'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="7: Plant Wheat"
          >
            🌾
            <div className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded px-1">{gameState.player.inventory.seeds.wheat}</div>
          </button>
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, selectedCrop: 'tomato', selectedTool: 'seed_bag' },
              }))
            }
            className={`px-3 py-2 rounded font-bold text-2xl relative ${
              gameState.player.selectedCrop === 'tomato' && gameState.player.selectedTool === 'seed_bag'
                ? 'bg-red-600 ring-2 ring-red-300'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="8: Plant Tomatoes"
          >
            🍅
            <div className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded px-1">{gameState.player.inventory.seeds.tomato}</div>
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
          onBuyWaterbots={amount => setGameState(prev => buyWaterbots(prev, amount))}
          onBuyHarvestbots={amount => setGameState(prev => buyHarvestbots(prev, amount))}
          onUpgradeBag={() => setGameState(prev => upgradeBag(prev))}
        />
      )}

      {/* Sell Shop Modal */}
      {showSellShop && (
        <SellShop
          gameState={gameState}
          onClose={() => setShowSellShop(false)}
          onSellCrop={() => {
            const result = sellBasket(gameState);
            setSellMessage(result.message);
            if (result.success) {
              setGameState(result.state);
            }
            setTimeout(() => setSellMessage(''), 3000);
          }}
        />
      )}

      {/* Farm Name Editor Modal */}
      {showFarmNameEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-md w-full border-4 border-green-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🌾 Rename Your Farm</h2>
              <button
                onClick={() => setShowFarmNameEditor(false)}
                className="text-2xl hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={gameState.player.farmName}
              onChange={(e) => setGameState(prev => ({
                ...prev,
                player: { ...prev.player, farmName: e.target.value }
              }))}
              className="w-full px-4 py-3 rounded-lg text-black font-bold text-xl mb-4"
              placeholder="Enter farm name..."
              maxLength={30}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowFarmNameEditor(false);
                }
              }}
            />

            <div className="text-sm text-gray-300 mb-4">
              {gameState.player.farmName.length}/30 characters
            </div>

            <button
              onClick={() => setShowFarmNameEditor(false)}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg"
            >
              Save Name
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Compact Basket Sidebar */}
      <div className="w-40 bg-black/70 p-2 rounded-lg text-white flex flex-col gap-2 overflow-y-auto max-h-screen">
        <div className="text-sm font-bold text-center">🧺 {gameState.player.basket.length}/{gameState.player.basketCapacity}</div>

        {/* Basket Grid - Dynamic based on capacity */}
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: gameState.player.basketCapacity }).map((_, idx) => {
            const item = gameState.player.basket[idx];
            return (
              <div
                key={idx}
                className={`aspect-square rounded border flex items-center justify-center text-2xl ${
                  item ? 'bg-amber-900/50 border-amber-600' : 'bg-gray-800/50 border-gray-600'
                }`}
              >
                {item && (
                  <div className="relative">
                    <div>{item.crop === 'carrot' ? '🥕' : item.crop === 'wheat' ? '🌾' : '🍅'}</div>
                    {item.quality.generation > 1 && (
                      <div className="absolute -top-0.5 -right-0.5 text-[10px] bg-purple-600 rounded-full w-3 h-3 flex items-center justify-center">
                        {item.quality.generation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Sell Button */}
        <button
          onClick={() => {
            const result = sellBasket(gameState);
            setSellMessage(result.message);
            if (result.success) {
              setGameState(result.state);
            }
            setTimeout(() => setSellMessage(''), 3000);
          }}
          disabled={gameState.player.basket.length === 0}
          className={`px-2 py-1 rounded font-bold text-xs ${
            gameState.player.basket.length > 0
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          💰 Sell (V)
        </button>

        {/* Farmer Status and Task Queue */}
        <div className="border-t border-gray-600 pt-2">
          <div className="text-xs font-bold text-center mb-2">👨‍🌾 Farmer</div>

          {/* Current Task */}
          {gameState.currentTask ? (
            <div className="bg-green-900/50 border border-green-600 rounded px-2 py-1 mb-1">
              <div className="text-[10px] text-green-300 font-bold mb-0.5">CURRENT:</div>
              <div className="text-xs flex items-center gap-1">
                {gameState.currentTask.type === 'clear' ? '⛏️ Clearing' :
                 gameState.currentTask.type === 'plant' ? '🌱 Planting' :
                 gameState.currentTask.type === 'water' ? '💧 Watering' :
                 gameState.currentTask.type === 'harvest' ? '🌾 Harvesting' :
                 '💦 Sprinkler'}
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-1 bg-green-500 rounded-full transition-all"
                  style={{ width: `${gameState.currentTask.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-600 rounded px-2 py-1 mb-1">
              <div className="text-xs text-gray-400 text-center">Idle</div>
            </div>
          )}

          {/* Task Queue */}
          {gameState.taskQueue.length > 0 && (
            <div className="bg-blue-900/30 border border-blue-600 rounded px-2 py-1">
              <div className="text-[10px] text-blue-300 font-bold mb-1">QUEUE ({gameState.taskQueue.length}):</div>
              <div className="space-y-0.5 max-h-24 overflow-y-auto">
                {gameState.taskQueue.slice(0, 5).map((task, idx) => (
                  <div key={task.id} className="text-xs flex items-center gap-1">
                    <span className="text-gray-400">{idx + 1}.</span>
                    {task.type === 'clear' ? '⛏️' :
                     task.type === 'plant' ? '🌱' :
                     task.type === 'water' ? '💧' :
                     task.type === 'harvest' ? '🌾' :
                     '💦'}
                    <span className="text-gray-300 text-[10px]">({task.tileX},{task.tileY})</span>
                  </div>
                ))}
                {gameState.taskQueue.length > 5 && (
                  <div className="text-[10px] text-gray-500">+{gameState.taskQueue.length - 5} more...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
