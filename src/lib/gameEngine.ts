// Game engine for Aaron and Chelsea's Farm
import { GameState, GameConfig, Tile, TileType, CropType, CropGrowthInfo } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 16,
  gridHeight: 12,
  tileSize: 72, // 50% bigger than before
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

export function createInitialGrid(): Tile[][] {
  const grid: Tile[][] = [];

  for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
      // Shop building at top-left corner
      let type: TileType = 'grass';
      if (x === 0 && y === 0) {
        type = 'shop';
      } else {
        // Random obstacles
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
        cleared: type === 'grass' || type === 'shop',
        wateredToday: false,
        hasSprinkler: false,
      });
    }
    grid.push(row);
  }

  return grid;
}

export function createInitialState(): GameState {
  return {
    grid: createInitialGrid(),
    player: {
      x: 1,
      y: 1,
      money: 30,
      selectedTool: 'hoe',
      selectedCrop: 'carrot',
      inventory: {
        seeds: {
          carrot: 5,
          wheat: 3,
          tomato: 1,
          null: 0,
        },
        harvested: {
          carrot: 0,
          wheat: 0,
          tomato: 0,
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

  let newGrid = state.grid;

  // If new day started, auto-water tiles with sprinklers and reset watered flags
  if (isNewDay) {
    newGrid = state.grid.map((row, y) =>
      row.map((tile, x) => {
        // Reset watered flag for all tiles
        let wateredToday = false;

        // Check if any sprinkler is in range of this tile
        for (let sy = 0; sy < GAME_CONFIG.gridHeight; sy++) {
          for (let sx = 0; sx < GAME_CONFIG.gridWidth; sx++) {
            const otherTile = state.grid[sy][sx];
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
          const quality = state.player.inventory.seedQuality[tile.crop];
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

  return {
    ...state,
    grid: newGrid,
    currentDay: newDay,
    dayProgress: newDayProgress,
    gameTime: newGameTime,
  };
}

export function clearTile(state: GameState, tileX: number, tileY: number): GameState {
  const tile = state.grid[tileY]?.[tileX];
  if (!tile || tile.cleared) return state;

  const newGrid = state.grid.map((row, y) =>
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

  return {
    ...state,
    grid: newGrid,
  };
}

export function plantSeed(
  state: GameState,
  tileX: number,
  tileY: number,
  cropType: CropType
): GameState {
  const tile = state.grid[tileY]?.[tileX];
  if (!tile || !tile.cleared || tile.crop || !cropType) return state;

  const seedCount = state.player.inventory.seeds[cropType];
  if (seedCount <= 0) return state;

  const newGrid = state.grid.map((row, y) =>
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

  return {
    ...state,
    grid: newGrid,
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        seeds: {
          ...state.player.inventory.seeds,
          [cropType]: seedCount - 1,
        },
      },
    },
  };
}

export function harvestCrop(state: GameState, tileX: number, tileY: number): GameState {
  const tile = state.grid[tileY]?.[tileX];
  if (!tile || tile.type !== 'grown' || !tile.crop) return state;

  const cropType = tile.crop;
  const quality = state.player.inventory.seedQuality[cropType];
  const cropInfo = CROP_INFO[cropType];
  // Note: No money earned on harvest - crops go to inventory to sell later

  const newGrid = state.grid.map((row, y) =>
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

  return {
    ...state,
    grid: newGrid,
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        harvested: {
          ...state.player.inventory.harvested,
          [cropType]: state.player.inventory.harvested[cropType] + 1,
        },
        seeds: {
          ...state.player.inventory.seeds,
          [cropType]: state.player.inventory.seeds[cropType] + 1,
        },
        seedQuality: {
          ...state.player.inventory.seedQuality,
          [cropType]: improvedQuality,
        },
      },
    },
  };
}

export function waterTile(state: GameState, tileX: number, tileY: number): GameState {
  const tile = state.grid[tileY]?.[tileX];
  if (!tile || (tile.type !== 'planted' && tile.type !== 'grown' && tile.type !== 'dirt')) return state;

  const newGrid = state.grid.map((row, y) =>
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

  return {
    ...state,
    grid: newGrid,
  };
}

// This is for placing a permanent sprinkler on a tile
export function placeSprinkler(state: GameState, tileX: number, tileY: number): GameState {
  const tile = state.grid[tileY]?.[tileX];
  if (!tile || tile.hasSprinkler || state.player.inventory.sprinklers <= 0) return state;

  const newGrid = state.grid.map((row, y) =>
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

  return {
    ...state,
    grid: newGrid,
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        sprinklers: state.player.inventory.sprinklers - 1,
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

export function sellCrop(state: GameState, cropType: Exclude<CropType, null>, amount: number): {
  success: boolean;
  state: GameState;
  message: string;
} {
  const harvested = state.player.inventory.harvested[cropType];

  if (harvested < amount) {
    return {
      success: false,
      state,
      message: `Not enough ${cropType}! You only have ${harvested}.`,
    };
  }

  const cropInfo = CROP_INFO[cropType];
  const quality = state.player.inventory.seedQuality[cropType];
  const pricePerCrop = Math.floor(cropInfo.sellPrice * quality.yield);
  const totalEarned = pricePerCrop * amount;

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      money: state.player.money + totalEarned,
      inventory: {
        ...state.player.inventory,
        harvested: {
          ...state.player.inventory.harvested,
          [cropType]: harvested - amount,
        },
      },
    },
  };

  return {
    success: true,
    state: newState,
    message: `Sold ${amount} ${cropType} for $${totalEarned}!`,
  };
}
