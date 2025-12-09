// Game engine for Aaron and Chelsea's Farm
import { GameState, GameConfig, Tile, TileType, CropType } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 16,
  gridHeight: 12,
  tileSize: 48,
};

export const CROP_PRICES: Record<Exclude<CropType, null>, number> & { null: number } = {
  carrot: 5,
  wheat: 3,
  tomato: 8,
  null: 0,
};

export const SEED_COSTS: Record<Exclude<CropType, null>, number> & { null: number } = {
  carrot: 2,
  wheat: 1,
  tomato: 4,
  null: 0,
};

export const GROWTH_TIME = 5000; // ms for full growth
export const WATER_BOOST = 0.2; // 20% growth speed boost when watered

export function createInitialGrid(): Tile[][] {
  const grid: Tile[][] = [];

  for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
      // Random obstacles
      let type: TileType = 'grass';
      const rand = Math.random();

      if (rand < 0.15) type = 'rock';
      else if (rand < 0.25) type = 'tree';

      row.push({
        type,
        x,
        y,
        crop: null,
        growthStage: 0,
        cleared: type === 'grass',
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
      },
    },
    community: {
      people: 5,
      hunger: 100,
      happiness: 80,
      dietaryNeeds: {
        carrot: 2,
        wheat: 3,
        tomato: 1,
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
        cost: 20,
        description: 'Water single tile (speeds growth 20%)',
        unlocked: false,
      },
      {
        name: 'water_sprinkler',
        cost: 50,
        description: 'Water 3x3 area around you (speeds growth 20%)',
        unlocked: false,
      },
    ],
    gameTime: 0,
    isPaused: false,
    lastFeedTime: 0,
  };
}

const HUNGER_DEPLETION_RATE = 0.5; // Hunger decreases by 0.5% per second (200 seconds = ~3 minutes to empty)

export function updateGameState(state: GameState, deltaTime: number): GameState {
  if (state.isPaused) return state;

  const newGrid = state.grid.map(row =>
    row.map(tile => {
      if (tile.type === 'planted' && tile.crop && tile.growthStage < 100) {
        const quality = state.player.inventory.seedQuality[tile.crop];
        const growthMultiplier = quality ? quality.growthSpeed : 1.0;

        const newGrowthStage = Math.min(
          100,
          tile.growthStage + (deltaTime / GROWTH_TIME) * 100 * growthMultiplier
        );

        return {
          ...tile,
          growthStage: newGrowthStage,
          type: (newGrowthStage >= 99 ? 'grown' : 'planted') as TileType,
        };
      }
      return tile;
    })
  );

  const hungerDepletion = (deltaTime / 1000) * HUNGER_DEPLETION_RATE;
  const newHunger = Math.max(0, state.community.hunger - hungerDepletion);

  let happiness = state.community.happiness;
  if (newHunger < 30) {
    happiness = Math.max(0, happiness - (deltaTime / 1000) * 5);
  }

  return {
    ...state,
    grid: newGrid,
    community: {
      ...state.community,
      hunger: newHunger,
      happiness,
    },
    gameTime: state.gameTime + deltaTime,
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
  const basePrice = CROP_PRICES[cropType];
  const price = Math.floor(basePrice * quality.yield);

  const newGrid = state.grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          type: 'dirt' as TileType,
          crop: null,
          growthStage: 0,
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
      money: state.player.money + price,
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
  if (!tile || (tile.type !== 'planted' && tile.type !== 'grown')) return state;

  const newGrid = state.grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY && (t.type === 'planted' || t.type === 'grown')) {
        return {
          ...t,
          growthStage: Math.min(100, t.growthStage + 20),
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

export function waterArea(state: GameState, centerX: number, centerY: number): GameState {
  const newGrid = state.grid.map((row, y) =>
    row.map((t, x) => {
      const dx = Math.abs(x - centerX);
      const dy = Math.abs(y - centerY);

      if (dx <= 1 && dy <= 1 && (t.type === 'planted' || t.type === 'grown')) {
        return {
          ...t,
          growthStage: Math.min(100, t.growthStage + 20),
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

  const cost = SEED_COSTS[cropType] * amount;
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

export function feedCommunity(state: GameState): {
  success: boolean;
  state: GameState;
  message: string;
} {
  const needs = state.community.dietaryNeeds;
  const harvested = state.player.inventory.harvested;

  const hasEnoughCarrots = harvested.carrot >= needs.carrot;
  const hasEnoughWheat = harvested.wheat >= needs.wheat;
  const hasEnoughTomatoes = harvested.tomato >= needs.tomato;

  if (!hasEnoughCarrots || !hasEnoughWheat || !hasEnoughTomatoes) {
    return {
      success: false,
      state,
      message: `Not enough food! Need: ${needs.carrot} carrots, ${needs.wheat} wheat, ${needs.tomato} tomatoes`,
    };
  }

  const varietyBonus = 10;
  const newHappiness = Math.min(100, state.community.happiness + varietyBonus);

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        harvested: {
          carrot: harvested.carrot - needs.carrot,
          wheat: harvested.wheat - needs.wheat,
          tomato: harvested.tomato - needs.tomato,
          null: 0,
        },
      },
    },
    community: {
      ...state.community,
      hunger: 100,
      happiness: newHappiness,
    },
    lastFeedTime: state.gameTime,
  };

  return {
    success: true,
    state: newState,
    message: `Community fed successfully! Happiness +${varietyBonus}!`,
  };
}
