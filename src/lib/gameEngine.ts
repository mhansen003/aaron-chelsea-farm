// Game engine for Aaron and Chelsea's Farm
import { GameState, GameConfig, Tile, TileType, CropType, CropGrowthInfo, Zone } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 16,
  gridHeight: 12,
  tileSize: 90, // Increased from 72 to fill header width (16 * 90 = 1440px)
};

// Crop information: growth days, sell price, seed cost
export const CROP_INFO: Record<Exclude<CropType, null>, CropGrowthInfo> & { null: CropGrowthInfo } = {
  carrot: { daysToGrow: 1, sellPrice: 5, seedCost: 2 },
  wheat: { daysToGrow: 1, sellPrice: 3, seedCost: 1 },
  tomato: { daysToGrow: 2, sellPrice: 8, seedCost: 4 },
  null: { daysToGrow: 0, sellPrice: 0, seedCost: 0 },
};

export const DAY_LENGTH = 60000; // 60 seconds = 1 day
export const SPRINKLER_COST = 100; // Cost to buy one sprinkler
export const SPRINKLER_RANGE = 2; // 5x5 area (2 tiles in each direction)
export const WATERBOT_COST = 150; // Cost to buy one water bot
export const WATERBOT_RANGE = 3; // 7x7 area (3 tiles in each direction)
export const HARVESTBOT_COST = 200; // Cost to buy one harvest bot
export const BAG_UPGRADE_COST = 100; // Cost to upgrade basket capacity by 4
export const BASE_ZONE_PRICE = 500; // Base price for first adjacent zone
export const ZONE_PRICE_MULTIPLIER = 1.5; // Each zone costs 50% more
export const MOVE_SPEED = 0.015; // Movement interpolation speed (0-1, higher = faster)

// Task durations in milliseconds
export const TASK_DURATIONS = {
  clear: 10000, // 10 seconds to clear rocks/trees
  plant: 2000, // 2 seconds to plant
  water: 1000, // 1 second to water
  harvest: 2000, // 2 seconds to harvest
  place_sprinkler: 3000, // 3 seconds to place sprinkler
};

export function createInitialGrid(zoneX: number, zoneY: number): Tile[][] {
  const grid: Tile[][] = [];
  const isStartingZone = zoneX === 0 && zoneY === 0;

  // Calculate center positions for arches
  const centerX = Math.floor(GAME_CONFIG.gridWidth / 2);
  const centerY = Math.floor(GAME_CONFIG.gridHeight / 2);

  for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
      let type: TileType = 'grass';
      let archDirection: 'north' | 'south' | 'east' | 'west' | undefined = undefined;
      let archTargetZone: { x: number; y: number } | undefined = undefined;

      // Shop building at top-left corner of starting zone only
      if (isStartingZone && x === 0 && y === 0) {
        type = 'shop';
      }
      // North arch (top center)
      else if (y === 0 && x === centerX) {
        type = 'arch';
        archDirection = 'north';
        archTargetZone = { x: zoneX, y: zoneY + 1 };
      }
      // South arch (bottom center)
      else if (y === GAME_CONFIG.gridHeight - 1 && x === centerX) {
        type = 'arch';
        archDirection = 'south';
        archTargetZone = { x: zoneX, y: zoneY - 1 };
      }
      // East arch (right center)
      else if (x === GAME_CONFIG.gridWidth - 1 && y === centerY) {
        type = 'arch';
        archDirection = 'east';
        archTargetZone = { x: zoneX + 1, y: zoneY };
      }
      // West arch (left center)
      else if (x === 0 && y === centerY) {
        type = 'arch';
        archDirection = 'west';
        archTargetZone = { x: zoneX - 1, y: zoneY };
      }
      // Random obstacles (but not where arches are)
      else {
        const rand = Math.random();
        if (rand < 0.15) type = 'rock';
        else if (rand < 0.25) type = 'tree';
      }

      row.push({
        type,
        x,
        y,
        crop: null,
        growthStage: 0,
        cleared: type === 'grass' || type === 'shop' || type === 'arch',
        wateredToday: false,
        hasSprinkler: false,
        archDirection,
        archTargetZone,
      });
    }
    grid.push(row);
  }

  return grid;
}

export function createZone(x: number, y: number, owned: boolean): Zone {
  const distanceFromStart = Math.abs(x) + Math.abs(y);
  const purchasePrice = Math.floor(BASE_ZONE_PRICE * Math.pow(ZONE_PRICE_MULTIPLIER, distanceFromStart - 1));

  return {
    x,
    y,
    grid: createInitialGrid(x, y),
    owned,
    purchasePrice: owned ? 0 : purchasePrice,
  };
}

export function getZoneKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function getCurrentGrid(state: GameState): Tile[][] {
  const key = getZoneKey(state.currentZone.x, state.currentZone.y);
  return state.zones[key].grid;
}

export function updateCurrentGrid(state: GameState, newGrid: Tile[][]): GameState {
  const key = getZoneKey(state.currentZone.x, state.currentZone.y);
  return {
    ...state,
    zones: {
      ...state.zones,
      [key]: {
        ...state.zones[key],
        grid: newGrid,
      },
    },
  };
}

export function createInitialState(): GameState {
  // Create starting zone (0,0) and adjacent zones
  const startingZone = createZone(0, 0, true);
  const zones: Record<string, Zone> = {
    '0,0': startingZone,
    '0,1': createZone(0, 1, false), // North
    '0,-1': createZone(0, -1, false), // South
    '1,0': createZone(1, 0, false), // East
    '-1,0': createZone(-1, 0, false), // West
  };

  return {
    zones,
    currentZone: { x: 0, y: 0 },
    player: {
      x: 1,
      y: 1,
      money: 30,
      farmName: "Aaron & Chelsea's Farm",
      selectedTool: 'hoe',
      selectedCrop: 'carrot',
      basket: [], // Empty basket to start
      basketCapacity: 8, // Default basket size
      inventory: {
        seeds: {
          carrot: 5,
          wheat: 3,
          tomato: 1,
          null: 0,
        },
        seedQuality: {
          carrot: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          wheat: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          tomato: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          null: { generation: 0, yield: 0, growthSpeed: 0 },
        },
        sprinklers: 0,
        waterbots: 0,
        harvestbots: 0,
      },
    },
    tools: [
      {
        name: 'hoe',
        cost: 0,
        description: 'Clear rocks and trees',
        unlocked: true,
      },
      {
        name: 'seed_bag',
        cost: 0,
        description: 'Plant seeds on cleared soil',
        unlocked: true,
      },
      {
        name: 'scythe',
        cost: 0,
        description: 'Harvest grown crops',
        unlocked: true,
      },
      {
        name: 'watering_can',
        cost: 0,
        description: 'Water single tile for the day',
        unlocked: true,
      },
      {
        name: 'water_sprinkler',
        cost: 100,
        description: 'Place sprinkler (auto-waters 5x5 area daily)',
        unlocked: false,
      },
    ],
    taskQueue: [],
    currentTask: null,
    currentDay: 1,
    dayProgress: 0,
    gameTime: 0,
    isPaused: false,
  };
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
  if (state.isPaused) return state;

  const newGameTime = state.gameTime + deltaTime;
  const newDayProgress = ((newGameTime % DAY_LENGTH) / DAY_LENGTH) * 100;
  const previousDay = state.currentDay;
  const newDay = Math.floor(newGameTime / DAY_LENGTH) + 1;

  // Check if a new day has started
  const isNewDay = newDay > previousDay;

  let newState = { ...state };

  // Initialize visual position if not set
  if (newState.player.visualX === undefined) {
    newState.player.visualX = newState.player.x;
  }
  if (newState.player.visualY === undefined) {
    newState.player.visualY = newState.player.y;
  }

  // Smoothly interpolate visual position toward actual position
  const dx = newState.player.x - newState.player.visualX;
  const dy = newState.player.y - newState.player.visualY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0.01) {
    // Move toward target position
    newState.player.visualX += dx * MOVE_SPEED;
    newState.player.visualY += dy * MOVE_SPEED;
  } else {
    // Snap to target when close enough
    newState.player.visualX = newState.player.x;
    newState.player.visualY = newState.player.y;
  }

  // Process current task
  if (newState.currentTask) {
    const newProgress = newState.currentTask.progress + (deltaTime / newState.currentTask.duration) * 100;

    if (newProgress >= 100) {
      // Task complete - execute it
      const task = newState.currentTask;

      switch (task.type) {
        case 'clear':
          newState = clearTile(newState, task.tileX, task.tileY);
          break;
        case 'plant':
          if (task.cropType) {
            newState = plantSeed(newState, task.tileX, task.tileY, task.cropType);
          }
          break;
        case 'water':
          newState = waterTile(newState, task.tileX, task.tileY);
          break;
        case 'harvest':
          newState = harvestCrop(newState, task.tileX, task.tileY);
          break;
        case 'place_sprinkler':
          newState = placeSprinkler(newState, task.tileX, task.tileY);
          break;
      }

      // Move player to task location
      newState.player.x = task.tileX;
      newState.player.y = task.tileY;

      // Clear current task
      newState.currentTask = null;
    } else {
      // Update progress
      newState.currentTask = { ...newState.currentTask, progress: newProgress };
    }
  }

  // If no current task, take next from queue
  if (!newState.currentTask && newState.taskQueue.length > 0) {
    const [nextTask, ...remainingQueue] = newState.taskQueue;
    newState.currentTask = nextTask;
    newState.taskQueue = remainingQueue;
  }

  // Update all zones
  const newZones = { ...newState.zones };

  // Process each owned zone
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned) return; // Skip unowned zones

    let newGrid = zone.grid;

    // If new day started, auto-water tiles with sprinklers and reset watered flags
    if (isNewDay) {
      newGrid = zone.grid.map((row, y) =>
        row.map((tile, x) => {
          // Reset watered flag for all tiles
          let wateredToday = false;

          // Check if any sprinkler is in range of this tile
          for (let sy = 0; sy < GAME_CONFIG.gridHeight; sy++) {
            for (let sx = 0; sx < GAME_CONFIG.gridWidth; sx++) {
              const otherTile = zone.grid[sy][sx];
              if (otherTile.hasSprinkler) {
                const dx = Math.abs(x - sx);
                const dy = Math.abs(y - sy);
                if (dx <= SPRINKLER_RANGE && dy <= SPRINKLER_RANGE) {
                  wateredToday = true;
                  break;
                }
              }
            }
            if (wateredToday) break;
          }

          return { ...tile, wateredToday };
        })
      );
    }

    // Update crop growth - only if watered
    newGrid = newGrid.map(row =>
      row.map(tile => {
        if (tile.type === 'planted' && tile.crop && tile.plantedDay !== undefined) {
          const cropInfo = CROP_INFO[tile.crop];
          const daysSincePlanted = newDay - tile.plantedDay;

          // Only grow if watered today
          if (tile.wateredToday) {
            const quality = newState.player.inventory.seedQuality[tile.crop];
            const growthMultiplier = quality ? quality.growthSpeed : 1.0;
            const adjustedDaysToGrow = cropInfo.daysToGrow / growthMultiplier;

            const growthPercentage = (daysSincePlanted / adjustedDaysToGrow) * 100;
            const newGrowthStage = Math.min(100, growthPercentage);

            return {
              ...tile,
              growthStage: newGrowthStage,
              type: (newGrowthStage >= 100 ? 'grown' : 'planted') as TileType,
            };
          }
        }
        return tile;
      })
    );

    newZones[zoneKey] = { ...zone, grid: newGrid };
  });

  return {
    ...newState,
    zones: newZones,
    currentDay: newDay,
    dayProgress: newDayProgress,
    gameTime: newGameTime,
  };
}

export function clearTile(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);
  const tile = grid[tileY]?.[tileX];
  if (!tile || tile.cleared) return state;

  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY && !t.cleared) {
        return {
          ...t,
          type: 'dirt' as TileType,
          cleared: true,
        };
      }
      return t;
    })
  );

  return updateCurrentGrid(state, newGrid);
}

export function plantSeed(
  state: GameState,
  tileX: number,
  tileY: number,
  cropType: CropType
): GameState {
  const grid = getCurrentGrid(state);
  const tile = grid[tileY]?.[tileX];
  if (!tile || !tile.cleared || tile.crop || !cropType) return state;

  const seedCount = state.player.inventory.seeds[cropType];
  if (seedCount <= 0) return state;

  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          type: 'planted' as TileType,
          crop: cropType,
          growthStage: 0,
          plantedDay: state.currentDay, // Track when planted
        };
      }
      return t;
    })
  );

  const updatedState = updateCurrentGrid(state, newGrid);

  return {
    ...updatedState,
    player: {
      ...updatedState.player,
      inventory: {
        ...updatedState.player.inventory,
        seeds: {
          ...updatedState.player.inventory.seeds,
          [cropType]: seedCount - 1,
        },
      },
    },
  };
}

export function harvestCrop(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);
  const tile = grid[tileY]?.[tileX];
  if (!tile || tile.type !== 'grown' || !tile.crop) return state;

  // Check if basket is full
  if (state.player.basket.length >= state.player.basketCapacity) return state;

  const cropType = tile.crop;
  const quality = state.player.inventory.seedQuality[cropType];

  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          type: 'dirt' as TileType,
          crop: null,
          growthStage: 0,
          plantedDay: undefined,
        };
      }
      return t;
    })
  );

  const improvedQuality =
    Math.random() < 0.1
      ? {
          generation: quality.generation + 1,
          yield: Math.min(3.0, quality.yield + 0.1),
          growthSpeed: Math.min(2.0, quality.growthSpeed + 0.05),
        }
      : quality;

  // Add harvested crop to basket
  const newBasket = [...state.player.basket, { crop: cropType, quality: improvedQuality }];

  const updatedState = updateCurrentGrid(state, newGrid);

  return {
    ...updatedState,
    player: {
      ...updatedState.player,
      basket: newBasket,
      inventory: {
        ...updatedState.player.inventory,
        // Give back 1 seed
        seeds: {
          ...updatedState.player.inventory.seeds,
          [cropType]: updatedState.player.inventory.seeds[cropType] + 1,
        },
        seedQuality: {
          ...updatedState.player.inventory.seedQuality,
          [cropType]: improvedQuality,
        },
      },
    },
  };
}

export function waterTile(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);
  const tile = grid[tileY]?.[tileX];
  if (!tile || (tile.type !== 'planted' && tile.type !== 'grown' && tile.type !== 'dirt')) return state;

  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          wateredToday: true,
        };
      }
      return t;
    })
  );

  return updateCurrentGrid(state, newGrid);
}

// This is for placing a permanent sprinkler on a tile
export function placeSprinkler(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);
  const tile = grid[tileY]?.[tileX];
  if (!tile || tile.hasSprinkler || state.player.inventory.sprinklers <= 0) return state;

  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          hasSprinkler: true,
        };
      }
      return t;
    })
  );

  const updatedState = updateCurrentGrid(state, newGrid);

  return {
    ...updatedState,
    player: {
      ...updatedState.player,
      inventory: {
        ...updatedState.player.inventory,
        sprinklers: updatedState.player.inventory.sprinklers - 1,
      },
    },
  };
}

export function buyTool(state: GameState, toolName: string): GameState {
  const tool = state.tools.find(t => t.name === toolName);
  if (!tool || tool.unlocked || state.player.money < tool.cost) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - tool.cost,
    },
    tools: state.tools.map(t =>
      t.name === toolName ? { ...t, unlocked: true } : t
    ),
  };
}

export function buySeeds(state: GameState, cropType: CropType, amount: number): GameState {
  if (!cropType) return state;

  const cropInfo = CROP_INFO[cropType];
  const cost = cropInfo.seedCost * amount;
  if (state.player.money < cost) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - cost,
      inventory: {
        ...state.player.inventory,
        seeds: {
          ...state.player.inventory.seeds,
          [cropType]: state.player.inventory.seeds[cropType] + amount,
        },
      },
    },
  };
}

export function buySprinklers(state: GameState, amount: number): GameState {
  const cost = SPRINKLER_COST * amount;
  if (state.player.money < cost) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - cost,
      inventory: {
        ...state.player.inventory,
        sprinklers: state.player.inventory.sprinklers + amount,
      },
    },
  };
}

export function buyWaterbots(state: GameState, amount: number): GameState {
  const cost = WATERBOT_COST * amount;
  if (state.player.money < cost) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - cost,
      inventory: {
        ...state.player.inventory,
        waterbots: state.player.inventory.waterbots + amount,
      },
    },
  };
}

export function buyHarvestbots(state: GameState, amount: number): GameState {
  const cost = HARVESTBOT_COST * amount;
  if (state.player.money < cost) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - cost,
      inventory: {
        ...state.player.inventory,
        harvestbots: state.player.inventory.harvestbots + amount,
      },
    },
  };
}

export function upgradeBag(state: GameState): GameState {
  if (state.player.money < BAG_UPGRADE_COST) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - BAG_UPGRADE_COST,
      basketCapacity: state.player.basketCapacity + 4,
    },
  };
}

// Add task to queue
export function addTask(
  state: GameState,
  type: import('@/types/game').TaskType,
  tileX: number,
  tileY: number,
  cropType?: import('@/types/game').CropType
): GameState {
  const task: import('@/types/game').Task = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    tileX,
    tileY,
    zoneX: state.currentZone.x,
    zoneY: state.currentZone.y,
    cropType,
    progress: 0,
    duration: TASK_DURATIONS[type],
  };

  return {
    ...state,
    taskQueue: [...state.taskQueue, task],
  };
}

// Remove task from queue
export function removeTask(state: GameState, taskId: string): GameState {
  return {
    ...state,
    taskQueue: state.taskQueue.filter(t => t.id !== taskId),
  };
}

export function sellBasket(state: GameState): {
  success: boolean;
  state: GameState;
  message: string;
} {
  if (state.player.basket.length === 0) {
    return {
      success: false,
      state,
      message: 'Your basket is empty!',
    };
  }

  let totalEarned = 0;
  const cropCounts: Record<string, number> = {};

  state.player.basket.forEach(item => {
    const cropInfo = CROP_INFO[item.crop];
    const pricePerCrop = Math.floor(cropInfo.sellPrice * item.quality.yield);
    totalEarned += pricePerCrop;
    cropCounts[item.crop] = (cropCounts[item.crop] || 0) + 1;
  });

  const summary = Object.entries(cropCounts)
    .map(([crop, count]) => `${count} ${crop}`)
    .join(', ');

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      money: state.player.money + totalEarned,
      basket: [], // Empty the basket
    },
  };

  return {
    success: true,
    state: newState,
    message: `Sold ${summary} for $${totalEarned}!`,
  };
}
