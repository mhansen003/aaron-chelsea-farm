// Game engine for Aaron and Chelsea's Farm
import { GameState, GameConfig, Tile, TileType, CropType, CropGrowthInfo, Zone, WaterBot, Task, DemolishBot, ZoneEarnings } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 16,
  gridHeight: 12,
  tileSize: 90, // Increased from 72 to fill header width (16 * 90 = 1440px)
};

// Crop information: growth time (ms), sell price, seed cost
// Base growth times increased by 50%, exotic crops (grapes, oranges, avocado) take 125% longer
export const CROP_INFO: Record<Exclude<CropType, null>, CropGrowthInfo> & { null: CropGrowthInfo } = {
  carrot: { daysToGrow: 1, growTime: 72000, sellPrice: 5, seedCost: 2 }, // 72 seconds (profit: 3)
  wheat: { daysToGrow: 1, growTime: 108000, sellPrice: 3, seedCost: 1 }, // 108 seconds (profit: 2)
  tomato: { daysToGrow: 2, growTime: 216000, sellPrice: 8, seedCost: 4 }, // 216 seconds (profit: 4)
  pumpkin: { daysToGrow: 2, growTime: 144000, sellPrice: 12, seedCost: 6 }, // 144 seconds (profit: 6)
  watermelon: { daysToGrow: 2, growTime: 180000, sellPrice: 15, seedCost: 8 }, // 180 seconds (profit: 7)
  peppers: { daysToGrow: 1, growTime: 90000, sellPrice: 6, seedCost: 3 }, // 90 seconds (profit: 3)
  grapes: { daysToGrow: 3, growTime: 243000, sellPrice: 14, seedCost: 5 }, // 243 seconds - EXOTIC (profit: 9)
  oranges: { daysToGrow: 4, growTime: 297000, sellPrice: 20, seedCost: 7 }, // 297 seconds - EXOTIC (profit: 13)
  avocado: { daysToGrow: 5, growTime: 351000, sellPrice: 26, seedCost: 10 }, // 351 seconds - EXOTIC (profit: 16)
  rice: { daysToGrow: 2, growTime: 126000, sellPrice: 7, seedCost: 3 }, // 126 seconds (profit: 4)
  corn: { daysToGrow: 2, growTime: 135000, sellPrice: 9, seedCost: 4 }, // 135 seconds (profit: 5)
  null: { daysToGrow: 0, growTime: 0, sellPrice: 0, seedCost: 0 },
};

/**
 * Calculate price multiplier based on progression (crops sold)
 * Every 10 crops sold = +10% to prices (both seed cost and sell price)
 * Caps at +200% (30+ sold = 3x base prices)
 */
export function getPriceMultiplier(cropType: Exclude<CropType, null>, cropsSold: Record<Exclude<CropType, null>, number>): number {
  const sold = cropsSold[cropType] || 0;
  const multiplier = 1 + (Math.floor(sold / 10) * 0.1);
  return Math.min(multiplier, 3); // Cap at 3x
}

/**
 * Get current seed cost for a crop based on progression
 */
export function getCurrentSeedCost(cropType: Exclude<CropType, null>, cropsSold: Record<Exclude<CropType, null>, number>): number {
  const baseCost = CROP_INFO[cropType].seedCost;
  const multiplier = getPriceMultiplier(cropType, cropsSold);
  return Math.round(baseCost * multiplier);
}

/**
 * Get current sell price for a crop based on progression
 */
export function getCurrentSellPrice(cropType: Exclude<CropType, null>, cropsSold: Record<Exclude<CropType, null>, number>): number {
  const basePrice = CROP_INFO[cropType].sellPrice;
  const multiplier = getPriceMultiplier(cropType, cropsSold);
  return Math.round(basePrice * multiplier);
}

export const DAY_LENGTH = 60000; // 60 seconds = 1 day
export const SPRINKLER_COST = 100; // Cost to buy one sprinkler
export const SPRINKLER_RANGE = 3; // 7x7 area (3 tiles in each direction)
export const WATERBOT_COST = 300; // Cost to buy one water bot
export const WATERBOT_RANGE = 3; // 7x7 area (3 tiles in each direction)
export const WATERBOT_MAX_WATER = 12; // Maximum water a bot can hold (increased by 20%)
export const HARVESTBOT_COST = 400; // Cost to buy one harvest bot
export const SEEDBOT_COST = 500; // Cost to buy one seed bot
export const TRANSPORTBOT_COST = 1000; // Cost to buy one transport bot
export const DEMOLISHBOT_COST = 100; // Cost to buy one demolish bot
export const BAG_UPGRADE_COSTS = [150, 300, 500]; // Costs for basket upgrades (tier 1, 2, 3)
export const BAG_UPGRADE_CAPACITY = 4; // Capacity increase per upgrade
export const MAX_BAG_UPGRADES = 3; // Maximum number of upgrades
export const MECHANIC_SHOP_COST = 250; // Cost to buy the mechanic shop
export const WELL_COST = 100; // Cost to buy a well
export const GARAGE_COST = 175; // Cost to buy a garage
export const SUPERCHARGER_COST = 5000; // Cost to buy a supercharger
export const SUPERCHARGE_BOT_COST = 500; // Cost to supercharge a single bot
export const BASE_ZONE_PRICE = 500; // Base to first adjacent zone
export const ZONE_PRICE_MULTIPLIER = 1.5; // Each zone costs 50% more
export const MOVE_SPEED = 0.008; // Movement interpolation speed (0-1, higher = faster)

/**
 * Calculate progressive bot cost based on how many you already own
 * Each bot costs 50% more than the previous one
 */
export function getBotCost(baseCost: number, owned: number): number {
  return Math.round(baseCost * Math.pow(1.5, owned));
}

// Task durations in milliseconds
export const TASK_DURATIONS = {
  clear: 10000, // 10 seconds to clear rocks/trees
  plant: 2000, // 2 seconds to plant
  water: 1000, // 1 second to water
  harvest: 2000, // 2 seconds to harvest
  place_sprinkler: 3000, // 3 seconds to place sprinkler
  place_mechanic: 100, // Instant - construction time handles the delay
  place_well: 100, // Instant - construction time handles the delay
  place_garage: 100, // Instant - construction time handles the delay
  place_supercharger: 100, // Instant - construction time handles the delay
  deposit: 3000, // 3 seconds to deposit crops at warehouse
};

// Construction durations in milliseconds (separate from task durations)
export const CONSTRUCTION_DURATIONS = {
  mechanic: 5000, // 5 seconds to build mechanic shop (reduced for testing)
  well: 5000, // 5 seconds to build well (reduced for testing)
  garage: 5000, // 5 seconds to build garage (reduced for testing)
  supercharger: 5000, // 5 seconds to build supercharger (reduced for testing)
};

// Helper functions for supercharged bot speed calculations
function getAdjustedDuration(baseDuration: number, supercharged?: boolean): number {
  return supercharged ? baseDuration * 0.5 : baseDuration;
}

function getMovementSpeed(deltaTime: number, supercharged?: boolean): number {
  return supercharged ? deltaTime / 250 : deltaTime / 500;
}

/**
 * Check if a tile at (x, y) is within range of any sprinkler in the grid
 * Returns true if there's a sprinkler within SPRINKLER_RANGE (7x7 area)
 */
function isInSprinklerRange(grid: Tile[][], x: number, y: number): boolean {
  for (let sy = 0; sy < grid.length; sy++) {
    for (let sx = 0; sx < grid[sy].length; sx++) {
      if (grid[sy][sx].hasSprinkler) {
        const dx = Math.abs(x - sx);
        const dy = Math.abs(y - sy);
        if (dx <= SPRINKLER_RANGE && dy <= SPRINKLER_RANGE) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Find the garage position in a zone's grid
 * Returns the top-left corner of the 2x2 garage building, or null if no garage exists
 */
export function findGaragePosition(grid: Tile[][]): { x: number; y: number } | null {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (tile.type === 'garage') {
        // Check if this is the top-left tile of a 2x2 garage
        const isTopLeft = (
          x + 1 < grid[y].length &&
          y + 1 < grid.length &&
          grid[y][x + 1]?.type === 'garage' &&
          grid[y + 1][x]?.type === 'garage' &&
          grid[y + 1][x + 1]?.type === 'garage'
        );
        if (isTopLeft) {
          return { x, y };
        }
      }
    }
  }
  return null;
}

export function createInitialGrid(zoneX: number, zoneY: number, theme?: import('@/types/game').ZoneTheme): Tile[][] {
  const grid: Tile[][] = [];
  const isStartingZone = zoneX === 0 && zoneY === 0;
  const isBeach = theme === 'beach';

  // Calculate center positions for arches
  const centerX = Math.floor(GAME_CONFIG.gridWidth / 2);
  const centerY = Math.floor(GAME_CONFIG.gridHeight / 2);

  for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
      let type: TileType = 'grass';
      let archDirection: 'north' | 'south' | 'east' | 'west' | undefined = undefined;
      let archTargetZone: { x: number; y: number } | undefined = undefined;
      const hasTheme = theme && theme !== 'farm';

      // Return arches for themed zones (to get back to main farm)
      // North zone (beach) - place south arch to return
      if (zoneX === 0 && zoneY === 1 && y === GAME_CONFIG.gridHeight - 1 && x === centerX) {
        type = 'arch';
        archDirection = 'south';
        archTargetZone = { x: 0, y: 0 };
      }
      // South zone (desert) - place north arch to return
      else if (zoneX === 0 && zoneY === -1 && y === 0 && x === centerX) {
        type = 'arch';
        archDirection = 'north';
        archTargetZone = { x: 0, y: 0 };
      }
      // East zone (mountain) - place west arch to return
      else if (zoneX === 1 && zoneY === 0 && x === 0 && y === centerY) {
        type = 'arch';
        archDirection = 'west';
        archTargetZone = { x: 0, y: 0 };
      }
      // West zone (barn) - place east arch to return
      else if (zoneX === -1 && zoneY === 0 && x === GAME_CONFIG.gridWidth - 1 && y === centerY) {
        type = 'arch';
        archDirection = 'east';
        archTargetZone = { x: 0, y: 0 };
      }
      // Theme-specific zone generation
      else if (isBeach) {
        // Beach: top half water, bottom half sand with seaweed/shells
        if (y < GAME_CONFIG.gridHeight / 2) {
          type = 'ocean';
        } else {
          type = 'sand';
          const rand = Math.random();
          if (rand < 0.30) type = 'seaweed'; // 30% seaweed
          else if (rand < 0.50) type = 'shells'; // 20% shells
        }
      } else if (theme === 'desert') {
        // Desert: sand with cactus and rocks
        type = 'sand';
        const rand = Math.random();
        if (rand < 0.30) type = 'cactus'; // 30% cactus
        else if (rand < 0.50) type = 'rocks'; // 20% rocks
      } else if (theme === 'mountain') {
        // Mountain: dirt/rocky terrain with mountains and rocks (caves placed separately)
        type = 'dirt';
        const rand = Math.random();
        if (rand < 0.20) type = 'mountain'; // 20% mountain formations
        else if (rand < 0.35) type = 'rocks'; // 15% rocks
      }
      // Shop building at top-left corner (2x2) of starting zone only
      else if (isStartingZone && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        type = 'shop';
      }
      // Export building at top-right corner (2x2) of starting zone only
      else if (isStartingZone && x >= GAME_CONFIG.gridWidth - 2 && x <= GAME_CONFIG.gridWidth - 1 && y >= 0 && y <= 1) {
        type = 'export';
      }
      // Warehouse building (2x2) at bottom-right corner
      else if (isStartingZone && x >= GAME_CONFIG.gridWidth - 2 && x <= GAME_CONFIG.gridWidth - 1 && y >= GAME_CONFIG.gridHeight - 2 && y <= GAME_CONFIG.gridHeight - 1) {
        type = 'warehouse';
      }
      // Mechanic building (2x2) - if placed by player
      // Will be handled separately when player places it
      // Arches (only in farm zones, not themed zones)
      // North arch (top center) - NOT in themed zones
      else if (!hasTheme && y === 0 && x === centerX) {
        type = 'arch';
        archDirection = 'north';
        archTargetZone = { x: zoneX, y: zoneY + 1 };
      }
      // South arch (bottom center) - NOT in themed zones
      else if (!hasTheme && y === GAME_CONFIG.gridHeight - 1 && x === centerX) {
        type = 'arch';
        archDirection = 'south';
        archTargetZone = { x: zoneX, y: zoneY - 1 };
      }
      // East arch (right center) - NOT in themed zones
      else if (!hasTheme && x === GAME_CONFIG.gridWidth - 1 && y === centerY) {
        type = 'arch';
        archDirection = 'east';
        archTargetZone = { x: zoneX + 1, y: zoneY };
      }
      // West arch (left center) - NOT in themed zones
      else if (!hasTheme && x === 0 && y === centerY) {
        type = 'arch';
        archDirection = 'west';
        archTargetZone = { x: zoneX - 1, y: zoneY };
      }
      // Random obstacles (only in non-themed zones)
      else if (!hasTheme) {
        const rand = Math.random();
        if (rand < 0.15) type = 'rock'; // 15% rocks (reduced from 30%)
        else if (rand < 0.25) type = 'tree'; // 10% trees (reduced from 20%)
      }

      // Assign random variant for rocks (1-4) and trees (1-2)
      let variant: number | undefined = undefined;
      if (type === 'rock') {
        variant = Math.floor(Math.random() * 4) + 1; // Random 1, 2, 3, or 4
      } else if (type === 'tree') {
        variant = Math.floor(Math.random() * 2) + 1; // Random 1 or 2
      }

      row.push({
        type,
        x,
        y,
        crop: null,
        growthStage: 0,
        cleared: type === 'grass' || type === 'shop' || type === 'warehouse' || type === 'export' || type === 'arch',
        wateredToday: false,
        hasSprinkler: false,
        archDirection,
        archTargetZone,
        variant,
      });
    }
    grid.push(row);
  }

  // Place 1-3 cave entrances in mountain zones
  if (theme === 'mountain') {
    const numCaves = Math.floor(Math.random() * 3) + 1; // Random number 1-3
    const cavePositions: Array<{ x: number; y: number }> = [];

    // Find suitable positions (avoid edges, arches, and existing caves)
    const margin = 2; // Stay away from edges
    let attempts = 0;
    const maxAttempts = 100;

    while (cavePositions.length < numCaves && attempts < maxAttempts) {
      attempts++;
      const x = Math.floor(Math.random() * (GAME_CONFIG.gridWidth - margin * 2)) + margin;
      const y = Math.floor(Math.random() * (GAME_CONFIG.gridHeight - margin * 2)) + margin;

      // Check if position is valid (not too close to other caves, not on arch)
      const tooClose = cavePositions.some(pos =>
        Math.abs(pos.x - x) < 3 || Math.abs(pos.y - y) < 3
      );
      const isArch = grid[y][x].type === 'arch';

      if (!tooClose && !isArch) {
        cavePositions.push({ x, y });
      }
    }

    // Place the caves
    cavePositions.forEach(pos => {
      grid[pos.y][pos.x] = {
        ...grid[pos.y][pos.x],
        type: 'cave',
        cleared: false,
      };
    });
  }

  return grid;
}

export function createZone(x: number, y: number, owned: boolean): Zone {
  const distanceFromStart = Math.abs(x) + Math.abs(y);
  const purchasePrice = Math.floor(BASE_ZONE_PRICE * Math.pow(ZONE_PRICE_MULTIPLIER, distanceFromStart - 1));

  // Determine theme based on position relative to starting zone
  let theme: import('@/types/game').ZoneTheme = 'farm';
  let name = "My Bot Farm";
  let description = "Your home farm with rich soil perfect for growing crops.";
  let npc: import('@/types/game').ZoneNPC | undefined;
  let features: import('@/types/game').ZoneFeature[] = [];

  if (x === 0 && y === 1) {
    // North - Beach
    theme = 'beach';
    name = "Sunny Beach";
    description = "A tropical paradise with sandy shores and palm trees. Perfect for fishing and relaxation!";
    npc = {
      name: "Sally Surfer",
      description: "Beach expert and fishing robot specialist. She can help you automate ocean harvesting!",
      image: "/surfer.png",
      shopType: "fishing",
    };
    features = [
      {
        name: "Fishing Robots",
        description: "Automated bots that fish for seaweed, shells, and other ocean treasures",
        icon: "🎣",
        unlocked: false,
      },
      {
        name: "Ocean Harvesting",
        description: "Collect valuable seaweed and rare shells from the ocean",
        icon: "🌊",
        unlocked: false,
      },
    ];
  } else if (x === -1 && y === 0) {
    // West - Barn
    theme = 'barn';
    name = "Animal Barn";
    description = "A cozy barn area where you can raise livestock and collect resources like milk, eggs, and wool.";
    npc = {
      name: "Cowgirl",
      description: "Expert rancher and livestock specialist. She can help you harvest bacon, eggs, and milk from your animals!",
      image: "/cowgirl.png",
      shopType: "dairy",
    };
    features = [
      {
        name: "Bacon Production",
        description: "Raise pigs and harvest delicious bacon",
        icon: "🥓",
        unlocked: false,
      },
      {
        name: "Egg Collection",
        description: "Collect fresh eggs from your chickens",
        icon: "🥚",
        unlocked: false,
      },
      {
        name: "Dairy Production",
        description: "Collect milk and cheese from your cows",
        icon: "🥛",
        unlocked: false,
      },
    ];
  } else if (x === 1 && y === 0) {
    // East - Mountain
    theme = 'mountain';
    name = "Mountain Range";
    description = "Rugged mountainous terrain rich with minerals and rare resources. Challenging but rewarding!";
    npc = {
      name: "Mountain Man",
      description: "Expert mountaineer and mining specialist. He can guide you through caves and help extract precious gems!",
      image: "/mountainman.png",
      shopType: "mining",
    };
    features = [
      {
        name: "Cave Exploration",
        description: "Venture into mysterious caves to harvest rare mushrooms and fungi",
        icon: "🍄",
        unlocked: false,
      },
      {
        name: "Gem Mining",
        description: "Extract valuable gems and minerals from mountain rocks",
        icon: "💎",
        unlocked: false,
      },
      {
        name: "Mining Robots",
        description: "Automated bots that extract valuable minerals and gems",
        icon: "⛏️",
        unlocked: false,
      },
    ];
  } else if (x === 0 && y === -1) {
    // South - Desert
    theme = 'desert';
    name = "Desert Oasis";
    description = "An arid desert landscape with unique cacti and valuable gems hidden beneath the sand.";
    npc = {
      name: "Desert Nomad",
      description: "Experienced desert explorer and resource specialist. He can help you drill for oil and create beautiful glass!",
      image: "/nomad.png",
      shopType: "explorer",
    };
    features = [
      {
        name: "Oil Drilling",
        description: "Drill deep into the desert to extract valuable oil",
        icon: "🛢️",
        unlocked: false,
      },
      {
        name: "Glass Creation",
        description: "Use desert sand to craft beautiful glass products",
        icon: "🪟",
        unlocked: false,
      },
      {
        name: "Drilling Robots",
        description: "Automated bots that extract oil and rare resources",
        icon: "⚙️",
        unlocked: false,
      },
    ];
  }

  return {
    x,
    y,
    grid: createInitialGrid(x, y, theme),
    owned,
    purchasePrice: owned ? 0 : purchasePrice,
    theme,
    name,
    description,
    npc,
    features,
    waterBots: [],
    harvestBots: [],
    seedBots: [],
    transportBots: [],
    demolishBots: [],
    taskQueue: [],
    currentTask: null,
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
      money: 1000,
      farmName: "My Bot Farm",
      selectedTool: 'hoe',
      selectedCrop: 'carrot',
      basket: [], // Empty basket to start
      basketCapacity: 8, // Default basket size
      bagUpgrades: 0, // No upgrades purchased yet
      inventory: {
        seeds: {
          carrot: 5,
          wheat: 3,
          tomato: 1,
          pumpkin: 0,
          watermelon: 0,
          peppers: 0,
          grapes: 0,
          oranges: 0,
          avocado: 0,
          rice: 0,
          corn: 0,
          null: 0,
        },
        seedQuality: {
          carrot: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          wheat: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          tomato: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          pumpkin: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          watermelon: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          peppers: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          grapes: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          oranges: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          avocado: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          rice: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          corn: { generation: 1, yield: 1.0, growthSpeed: 1.0 },
          null: { generation: 0, yield: 0, growthSpeed: 0 },
        },
        sprinklers: 0,
        waterbots: 0,
        harvestbots: 0,
        seedbots: 0,
        transportbots: 0,
        demolishbots: 0,
        mechanicShop: 0,
        mechanicShopPlaced: false,
        well: 0,
        wellPlaced: false,
        garage: 0,
        garagePlaced: false,
        supercharger: 0,
        superchargerPlaced: false,
      },
      autoBuy: {
        carrot: true,
        wheat: true,
        tomato: true,
        pumpkin: true,
        watermelon: true,
        peppers: true,
        grapes: true,
        oranges: true,
        avocado: true,
        rice: true,
        corn: true,
      },
      farmerAuto: {
        autoPlant: true,
        autoPlantCrop: 'carrot',
        autoWater: true,
        autoHarvest: true,
        autoSell: true,
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
        description: 'Place sprinkler (auto-waters 7x7 area daily)',
        unlocked: false,
      },
    ],
    currentDay: 1,
    dayProgress: 0,
    gameTime: 0,
    isPaused: false,
    warehouse: [], // Empty warehouse storage
    cropsSold: { // Track crops sold for price progression
      carrot: 0,
      wheat: 0,
      tomato: 0,
      pumpkin: 0,
      watermelon: 0,
      peppers: 0,
      grapes: 0,
      oranges: 0,
      avocado: 0,
      rice: 0,
      corn: 0,
    },
    zoneEarnings: {}, // Track earnings by zone
  };
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
  if (state.isPaused) return state;

  // Get current zone for task queue management
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  let currentZone = state.zones[currentZoneKey];

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
  if (currentZone.currentTask) {
    // Check if player has VISUALLY reached the task location (within small threshold)
    const visualX = newState.player.visualX ?? newState.player.x;
    const visualY = newState.player.visualY ?? newState.player.y;
    const dx = Math.abs(visualX - currentZone.currentTask.tileX);
    const dy = Math.abs(visualY - currentZone.currentTask.tileY);
    const playerVisuallyAtLocation = dx < 0.1 && dy < 0.1;

    let newProgress = currentZone.currentTask.progress;

    // Only progress the task if player has VISUALLY arrived
    if (playerVisuallyAtLocation) {
      newProgress = currentZone.currentTask.progress + (deltaTime / currentZone.currentTask.duration) * 100;
    } else {
      // Move player toward task location (logical position, visual will catch up)
      newState.player.x = currentZone.currentTask.tileX;
      newState.player.y = currentZone.currentTask.tileY;
    }

    if (newProgress >= 100) {
      // Task complete - execute it
      const task = currentZone.currentTask;

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
          // Check if basket is full BEFORE harvesting - if so, don't harvest and trigger deposit instead
          if (newState.player.basket && newState.player.basket.length >= newState.player.basketCapacity) {
            const warehousePos = findWarehouseTile(newState);
            if (warehousePos) {
              // Create deposit task at warehouse location
              const depositTask: Task = {
                id: `${Date.now()}-${Math.random()}`,
                type: 'deposit',
                tileX: warehousePos.x,
                tileY: warehousePos.y,
                zoneX: newState.currentZone.x,
                zoneY: newState.currentZone.y,
                progress: 0,
                duration: TASK_DURATIONS.deposit,
              };

              // Re-queue this harvest task and make deposit current
              currentZone.taskQueue = [task, ...currentZone.taskQueue];
              currentZone.currentTask = depositTask;
              // Set player position to warehouse so they walk there
              newState.player.x = warehousePos.x;
              newState.player.y = warehousePos.y;
              break; // Don't execute harvest, deposit first
            }
          }
          // Basket has space, proceed with harvest
          newState = harvestCrop(newState, task.tileX, task.tileY);

          // Check if basket became full AFTER this harvest
          if (newState.player.basket && newState.player.basket.length >= newState.player.basketCapacity) {
            const warehousePos = findWarehouseTile(newState);
            if (warehousePos) {
              // Create deposit task at warehouse location
              const depositTask: Task = {
                id: `${Date.now()}-${Math.random()}`,
                type: 'deposit',
                tileX: warehousePos.x,
                tileY: warehousePos.y,
                zoneX: newState.currentZone.x,
                zoneY: newState.currentZone.y,
                progress: 0,
                duration: TASK_DURATIONS.deposit,
              };

              // Make deposit the next task (will be picked up after current task clears)
              // But we need to insert it BEFORE clearing currentTask, so do it now
              currentZone.currentTask = depositTask;
              // Set player position to warehouse so they walk there
              newState.player.x = warehousePos.x;
              newState.player.y = warehousePos.y;
              break; // Don't clear current task, keep the deposit task
            }
          }
          break;
        case 'place_sprinkler':
          newState = placeSprinkler(newState, task.tileX, task.tileY);
          break;
        case 'place_mechanic':
          newState = placeMechanicShop(newState, task.tileX, task.tileY);
          break;
        case 'place_well':
          newState = placeWell(newState, task.tileX, task.tileY);
          break;
        case 'deposit':
          newState = depositToWarehouse(newState);
          break;
      }

      // Clear current task (player is already at location)
      currentZone.currentTask = null;
    } else {
      // Update progress
      currentZone.currentTask = { ...currentZone.currentTask, progress: newProgress };
    }
  }

  // If no current task, take next from queue
  if (!currentZone.currentTask && currentZone.taskQueue.length > 0) {
    const [nextTask, ...remainingQueue] = currentZone.taskQueue;
    currentZone.currentTask = nextTask;
    currentZone.taskQueue = remainingQueue;

    // AUTO-DEPOSIT: If basket is full, insert deposit task before continuing
    if (newState.player.basket && newState.player.basket.length >= newState.player.basketCapacity) {
      const warehousePos = findWarehouseTile(newState);
      if (warehousePos) {
        // Create deposit task at warehouse location
        const depositTask: Task = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'deposit',
          tileX: warehousePos.x,
          tileY: warehousePos.y,
          zoneX: newState.currentZone.x,
          zoneY: newState.currentZone.y,
          progress: 0,
          duration: TASK_DURATIONS.deposit,
        };

        // Put the current task back in queue and prioritize deposit
        currentZone.taskQueue = [nextTask, ...remainingQueue];
        currentZone.currentTask = depositTask;
        // Set player position to warehouse so they walk there
        newState.player.x = warehousePos.x;
        newState.player.y = warehousePos.y;
      }
    }
  }

  // AUTO-DEPOSIT: If basket is full and no tasks, go deposit immediately
  if (!currentZone.currentTask && currentZone.taskQueue.length === 0 && newState.player.basket && newState.player.basket.length >= newState.player.basketCapacity) {
    const warehousePos = findWarehouseTile(newState);
    if (warehousePos) {
      // Create deposit task at warehouse location
      const depositTask: Task = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'deposit',
        tileX: warehousePos.x,
        tileY: warehousePos.y,
        zoneX: newState.currentZone.x,
        zoneY: newState.currentZone.y,
        progress: 0,
        duration: TASK_DURATIONS.deposit,
      };

      currentZone.currentTask = depositTask;
      // Set player position to warehouse so they walk there
      newState.player.x = warehousePos.x;
      newState.player.y = warehousePos.y;
    }
  }

  // FARMER AUTOMATION: Generate automated tasks when farmer is idle
  if (!currentZone.currentTask && currentZone.taskQueue.length === 0) {
    const autoTasks = generateFarmerAutoTasks(newState, currentZone);
    if (autoTasks.length > 0) {
      // Add the first task as current, rest go to queue
      currentZone.currentTask = autoTasks[0];
      currentZone.taskQueue = [...autoTasks.slice(1)];
    }
  }

  // Idle wandering: If no tasks, randomly move the farmer around
  if (!currentZone.currentTask && currentZone.taskQueue.length === 0) {
    // Check if player has reached their current target (visual position matches logical position)
    const visualX = newState.player.visualX ?? newState.player.x;
    const visualY = newState.player.visualY ?? newState.player.y;
    const dx = Math.abs(visualX - newState.player.x);
    const dy = Math.abs(visualY - newState.player.y);
    const hasReachedTarget = dx < 0.1 && dy < 0.1;

    // Every 3 seconds (on average), pick a new random tile to wander to
    if (hasReachedTarget && Math.random() < deltaTime / 3000) {
      const grid = getCurrentGrid(newState);
      const walkableTiles: { x: number; y: number }[] = [];

      // Find all walkable tiles (grass, dirt, planted crops, themed ground tiles)
      grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          const isWalkable =
            tile.type === 'grass' ||
            (tile.type === 'dirt' && tile.cleared) ||
            tile.type === 'planted' ||
            tile.type === 'grown' ||
            tile.type === 'sand' ||
            tile.type === 'seaweed' ||
            tile.type === 'shells' ||
            tile.type === 'cactus' ||
            tile.type === 'rocks' ||
            tile.type === 'cave' ||
            tile.type === 'mountain';
          // Explicitly exclude ocean - not walkable
          if (isWalkable && tile.type !== 'ocean') {
            walkableTiles.push({ x, y });
          }
        });
      });

      // Pick a random walkable tile nearby (within 5 tiles)
      const nearbyTiles = walkableTiles.filter(t => {
        const dx = Math.abs(t.x - newState.player.x);
        const dy = Math.abs(t.y - newState.player.y);
        return dx <= 5 && dy <= 5 && (dx > 0 || dy > 0); // Not current position
      });

      if (nearbyTiles.length > 0) {
        const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
        newState.player.x = randomTile.x;
        newState.player.y = randomTile.y;
      }
    }
  }

  // Update all zones
  const newZones = { ...newState.zones };

  // Process each owned zone
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned) return; // Skip unowned zones

    let newGrid = zone.grid;

    // Note: Sprinkler auto-watering is now handled in the crop growth section below
    // This ensures crops in sprinkler range are watered on EVERY tick, not just new days

    // Update crop growth - time-based growth after watering
    newGrid = newGrid.map((row, y) =>
      row.map((tile, x) => {
        if (tile.type === 'planted' && tile.crop) {
          const cropInfo = CROP_INFO[tile.crop];

          // Auto-water crops in sprinkler range (every tick, not just new days)
          const inSprinklerRange = isInSprinklerRange(newGrid, x, y);
          let updatedTile = tile;

          if (inSprinklerRange && !tile.wateredToday) {
            // Crops in sprinkler range are automatically watered
            updatedTile = { ...tile, wateredToday: true };
          }

          // Start growth timer when first watered
          if (updatedTile.wateredToday && !updatedTile.wateredTimestamp) {
            return {
              ...updatedTile,
              wateredTimestamp: newGameTime,
            };
          }

          // Calculate growth based on elapsed time since watering
          if (updatedTile.wateredTimestamp !== undefined && updatedTile.crop) {
            const timeSinceWatered = newGameTime - updatedTile.wateredTimestamp;
            const cropType = updatedTile.crop as Exclude<import('@/types/game').CropType, null>;
            const quality = newState.player.inventory.seedQuality[cropType];
            const growthMultiplier = quality ? quality.growthSpeed : 1.0;
            const adjustedGrowTime = cropInfo.growTime / growthMultiplier;

            const growthPercentage = (timeSinceWatered / adjustedGrowTime) * 100;
            const newGrowthStage = Math.min(100, growthPercentage);

            // Once watered, crops continue growing without needing more water
            return {
              ...updatedTile,
              growthStage: newGrowthStage,
              type: (newGrowthStage >= 100 ? 'grown' : 'planted') as TileType,
            };
          }

          return updatedTile;
        }
        return tile;
      })
    );

    newZones[zoneKey] = { ...zone, grid: newGrid };
  });

  // Natural overgrowth: Empty tiles in farm zones slowly get reclaimed by nature
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned || zone.theme !== 'farm') return; // Only farm zones overgrow

    const updatedGrid = zone.grid.map(row =>
      row.map(tile => {
        // Dirt turns into grass after 30 seconds if untouched
        const isUntouchedDirt = tile.type === 'dirt' &&
                                tile.cleared &&
                                !tile.crop &&
                                !tile.hasSprinkler &&
                                !tile.isConstructing;

        if (isUntouchedDirt) {
          // Set initial last worked time if not set
          if (tile.lastWorkedTime === undefined) {
            return {
              ...tile,
              lastWorkedTime: newGameTime,
            };
          }

          // Convert dirt to grass after 30 seconds
          const DIRT_TO_GRASS_TIME = 30000; // 30 seconds
          if (newGameTime - tile.lastWorkedTime >= DIRT_TO_GRASS_TIME) {
            return {
              ...tile,
              type: 'grass' as TileType,
              lastWorkedTime: newGameTime,
              overgrowthTime: newGameTime + (900000 + Math.random() * 900000), // 15-30 minutes random
            } as Tile;
          }
        }

        // Only process cleared grass tiles without crops or buildings
        const isEmptyGrassTile = tile.type === 'grass' &&
                                 tile.cleared &&
                                 !tile.crop &&
                                 !tile.hasSprinkler &&
                                 !tile.isConstructing;

        if (isEmptyGrassTile) {
          // Set initial last worked time if not set
          if (tile.lastWorkedTime === undefined) {
            return {
              ...tile,
              lastWorkedTime: newGameTime,
              overgrowthTime: newGameTime + (900000 + Math.random() * 900000), // 15-30 minutes random
            };
          }

          // Check if overgrowth time has passed
          if (tile.overgrowthTime !== undefined && newGameTime >= tile.overgrowthTime) {
            // Randomly choose between rock and tree
            const overgrowthType: TileType = Math.random() < 0.5 ? 'rock' : 'tree';
            // Assign random variant for overgrown obstacles
            const overgrowthVariant = overgrowthType === 'rock'
              ? Math.floor(Math.random() * 4) + 1  // Random 1, 2, 3, or 4 for rocks
              : Math.floor(Math.random() * 2) + 1; // Random 1 or 2 for trees
            return {
              ...tile,
              type: overgrowthType,
              cleared: false,
              lastWorkedTime: undefined,
              overgrowthTime: undefined,
              variant: overgrowthVariant,
            } as Tile;
          }
        }

        return tile;
      })
    );

    newZones[zoneKey] = { ...zone, grid: updatedGrid };
  });

  // Complete building construction when timer expires
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned) return;

    let hasConstructionUpdates = false;
    const updatedGrid = zone.grid.map(row =>
      row.map(tile => {
        // Check if tile is under construction and ready to complete
        if (tile.isConstructing && tile.constructionStartTime !== undefined && tile.constructionDuration !== undefined && tile.constructionTarget) {
          const elapsedTime = newGameTime - tile.constructionStartTime;
          if (elapsedTime >= tile.constructionDuration) {
            // Construction complete! Convert to final building type
            hasConstructionUpdates = true;
            return {
              ...tile,
              type: tile.constructionTarget,
              isConstructing: false,
              constructionTarget: undefined,
              constructionStartTime: undefined,
              constructionDuration: undefined,
            };
          }
        }
        return tile;
      })
    );

    if (hasConstructionUpdates) {
      newZones[zoneKey] = { ...zone, grid: updatedGrid };
    }
  });


  // ========== WATER BOT AI (ALL ZONES) ==========
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned || !zone.waterBots || zone.waterBots.length === 0) return;

    const grid = zone.grid;
    let updatedGrid = grid;
    const updatedBots = zone.waterBots.map(bot => {
      // Respawn garaged bots if there's work to do
      if (bot.status === 'garaged') {
        // Check if there are unwatered crops
        const hasWork = grid.some((row, y) =>
          row.some((tile, x) =>
            tile.type === 'planted' && tile.crop && !tile.wateredToday && !isInSprinklerRange(grid, x, y)
          )
        );

        if (hasWork) {
          // Respawn at garage
          const garagePos = findGaragePosition(grid);
          if (garagePos) {
            return { ...bot, status: 'idle' as const, x: garagePos.x, y: garagePos.y, visualX: garagePos.x, visualY: garagePos.y };
          }
        }
        return bot; // Stay garaged
      }

      if (bot.x === undefined || bot.y === undefined) return bot;

      const botX = bot.x;
      const botY = bot.y;
      let visualX = bot.visualX ?? botX;
      let visualY = bot.visualY ?? botY;

      const dx = botX - visualX;
      const dy = botY - visualY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        visualX += dx * MOVE_SPEED;
        visualY += dy * MOVE_SPEED;
      } else {
        visualX = botX;
        visualY = botY;
      }

      const unwateredCrops: Array<{ x: number; y: number }> = [];
      grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          // Skip crops in sprinkler range - they auto-water themselves
          if (tile.type === 'planted' && tile.crop && !tile.wateredToday && !isInSprinklerRange(grid, x, y)) {
            unwateredCrops.push({ x, y });
          }
        });
      });

      // Filter out crops already claimed by other water bots
      const claimedWaterTiles = new Set<string>();
      zone.waterBots.forEach(otherBot => {
        if (otherBot.id !== bot.id && otherBot.targetX !== undefined && otherBot.targetY !== undefined) {
          claimedWaterTiles.add(`${otherBot.targetX},${otherBot.targetY}`);
        }
      });

      const availableWaterCrops = unwateredCrops.filter(crop =>
        !claimedWaterTiles.has(`${crop.x},${crop.y}`)
      );

      if (bot.waterLevel > 0 && availableWaterCrops.length > 0) {
        let nearest = availableWaterCrops[0];
        let minDist = Math.abs(botX - nearest.x) + Math.abs(botY - nearest.y);
        availableWaterCrops.forEach(crop => {
          const dist = Math.abs(botX - crop.x) + Math.abs(botY - crop.y);
          if (dist < minDist) { minDist = dist; nearest = crop; }
        });

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const ACTION_DURATION = getAdjustedDuration(1500, bot.supercharged);
          if (bot.actionStartTime !== undefined) {
            const elapsed = newGameTime - bot.actionStartTime;
            if (elapsed >= ACTION_DURATION) {
              updatedGrid = updatedGrid.map((row, rowY) =>
                row.map((tile, tileX) => {
                  if (tileX === nearest.x && rowY === nearest.y) {
                    return { ...tile, wateredToday: true, wateredTimestamp: newGameTime }; // Always use current time, don't reuse old timestamps
                  }
                  return tile;
                })
              );
              return { ...bot, waterLevel: bot.waterLevel - 1, status: 'idle' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
            } else {
              return { ...bot, status: 'watering' as const, visualX, visualY };
            }
          } else {
            return { ...bot, status: 'watering' as const, visualX, visualY, actionStartTime: newGameTime, actionDuration: ACTION_DURATION };
          }
        } else {
          let newX = botX, newY = botY;
          if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
            if (botX < nearest.x) newX++; else if (botX > nearest.x) newX--;
            else if (botY < nearest.y) newY++; else if (botY > nearest.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: nearest.x, targetY: nearest.y, visualX, visualY };
        }
      } else if (bot.waterLevel === 0) {
        let wellPos: { x: number; y: number } | null = null;
        grid.forEach((row, y) => { row.forEach((tile, x) => { if (tile.type === 'well') wellPos = { x, y }; }); });
        if (wellPos) {
          const well: { x: number; y: number } = wellPos;
          const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
          if (botX === well.x && botY === well.y && hasArrivedVisually) {
            // Bot has arrived at well, start/continue refilling
            const REFILL_DURATION = getAdjustedDuration(3000, bot.supercharged); // 3 seconds to refill (or 1.5s if supercharged)
            if (bot.actionStartTime !== undefined) {
              const elapsed = newGameTime - bot.actionStartTime;
              if (elapsed >= REFILL_DURATION) {
                // Refill complete
                return { ...bot, waterLevel: WATERBOT_MAX_WATER, status: 'refilling' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
              } else {
                // Still refilling
                return { ...bot, status: 'refilling' as const, visualX, visualY };
              }
            } else {
              // Start refilling
              return { ...bot, status: 'refilling' as const, visualX, visualY, actionStartTime: newGameTime, actionDuration: REFILL_DURATION };
            }
          } else {
            // Travel to well
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < well.x) newX++; else if (botX > well.x) newX--;
              else if (botY < well.y) newY++; else if (botY > well.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: well.x, targetY: well.y, visualX, visualY };
          }
        }
        // Idle - go to garage if it exists, otherwise wander
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - check if should despawn
            const GARAGE_DESPAWN_TIME = 5000; // 5 seconds
            const idleTime = bot.idleStartTime ? newGameTime - bot.idleStartTime : 0;

            if (idleTime >= GARAGE_DESPAWN_TIME) {
              // Despawn - set to garaged status and clear position
              return { ...bot, status: 'garaged' as const, x: undefined, y: undefined, visualX: undefined, visualY: undefined, targetX: undefined, targetY: undefined, idleStartTime: undefined };
            } else {
              // Track idle time at garage
              const startTime = bot.idleStartTime || newGameTime;
              return { ...bot, status: 'idle' as const, visualX, visualY, idleStartTime: startTime };
            }
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'idle' as const, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY, idleStartTime: undefined };
          }
        }
        // No garage - wander randomly
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => { row.forEach((tile, x) => {
            const isWalkable = tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared) || tile.type === 'planted' || tile.type === 'grown' || tile.type === 'sand' || tile.type === 'seaweed' || tile.type === 'shells' || tile.type === 'cactus' || tile.type === 'rocks' || tile.type === 'cave' || tile.type === 'mountain';
            if (isWalkable && tile.type !== 'ocean') walkableTiles.push({ x, y });
          }); });
          const nearbyTiles = walkableTiles.filter(t => { const dx = Math.abs(t.x - botX); const dy = Math.abs(t.y - botY); return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0); });
          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, visualX, visualY };
          }
        }
      } else {
        // Idle - go to garage if it exists, otherwise wander
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - stay parked
            return { ...bot, status: 'idle' as const, visualX, visualY };
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'idle' as const, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY };
          }
        }
        // No garage - wander randomly
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => { row.forEach((tile, x) => {
            const isWalkable = tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared) || tile.type === 'planted' || tile.type === 'grown' || tile.type === 'sand' || tile.type === 'seaweed' || tile.type === 'shells' || tile.type === 'cactus' || tile.type === 'rocks' || tile.type === 'cave' || tile.type === 'mountain';
            if (isWalkable && tile.type !== 'ocean') walkableTiles.push({ x, y });
          }); });
          const nearbyTiles = walkableTiles.filter(t => { const dx = Math.abs(t.x - botX); const dy = Math.abs(t.y - botY); return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0); });
          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, visualX, visualY };
          }
        }
      }
      return { ...bot, visualX, visualY };
    });
    newZones[zoneKey] = { ...zone, waterBots: updatedBots, grid: updatedGrid };
  });

  // ========== HARVEST BOT AI (ALL ZONES) ==========
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned || !zone.harvestBots || zone.harvestBots.length === 0) return;

    const grid = zone.grid;
    let updatedGrid = grid;
    const updatedHarvestBots = zone.harvestBots.map(bot => {
      if (bot.x === undefined || bot.y === undefined) return bot;

      const botX = bot.x;
      const botY = bot.y;
      let visualX = bot.visualX ?? botX;
      let visualY = bot.visualY ?? botY;

      const dx = botX - visualX;
      const dy = botY - visualY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        visualX += dx * MOVE_SPEED;
        visualY += dy * MOVE_SPEED;
      } else {
        visualX = botX;
        visualY = botY;
      }

      const isInventoryFull = bot.inventory.length >= bot.inventoryCapacity;

      const grownCrops: Array<{ x: number; y: number }> = [];
      grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (tile.type === 'grown' && tile.crop) {
            grownCrops.push({ x, y });
          }
        });
      });

      // Filter out crops already claimed by other harvest bots
      const claimedCrops = new Set<string>();
      zone.harvestBots.forEach(otherBot => {
        if (otherBot.id !== bot.id && otherBot.targetX !== undefined && otherBot.targetY !== undefined) {
          claimedCrops.add(`${otherBot.targetX},${otherBot.targetY}`);
        }
      });

      const availableCrops = grownCrops.filter(crop =>
        !claimedCrops.has(`${crop.x},${crop.y}`)
      );

      const hasInventory = bot.inventory.length > 0;
      const noCropsAvailable = availableCrops.length === 0;
      const idleTimeout = 15000;

      if (hasInventory && noCropsAvailable && !isInventoryFull) {
        if (!bot.idleStartTime) {
          return { ...bot, idleStartTime: newState.gameTime, visualX, visualY };
        }
        if (newState.gameTime - bot.idleStartTime >= idleTimeout) {
          let warehousePos: { x: number; y: number } | null = null;
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              if (tile.type === 'warehouse') {
                warehousePos = { x, y };
              }
            });
          });

          if (warehousePos) {
            const warehouse: { x: number; y: number } = warehousePos;
            const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;

            if (botX === warehouse.x && botY === warehouse.y && hasArrivedVisually) {
              const DEPOSIT_DURATION = getAdjustedDuration(3000, bot.supercharged); // 3 seconds to deposit (or 1.5s if supercharged)

              // If already depositing, check if time has elapsed
              if (bot.actionStartTime !== undefined) {
                const elapsed = newState.gameTime - bot.actionStartTime;
                if (elapsed >= DEPOSIT_DURATION) {
                  // Deposit complete
                  newState = { ...newState, warehouse: [...newState.warehouse, ...bot.inventory] };
                  return { ...bot, inventory: [], idleStartTime: undefined, status: 'depositing' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined, targetX: undefined, targetY: undefined };
                } else {
                  // Still depositing
                  return { ...bot, status: 'depositing' as const, visualX, visualY };
                }
              } else {
                // Start depositing
                return { ...bot, status: 'depositing' as const, visualX, visualY, actionStartTime: newState.gameTime, actionDuration: DEPOSIT_DURATION };
              }
            } else {
              // Travel to warehouse
              let newX = botX, newY = botY;
              if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
                if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
                else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
              }
              return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
            }
          }
        }
      }

      if (isInventoryFull) {
        let warehousePos: { x: number; y: number } | null = null;
        grid.forEach((row, y) => {
          row.forEach((tile, x) => {
            if (tile.type === 'warehouse') {
              warehousePos = { x, y };
            }
          });
        });

        if (warehousePos) {
          const warehouse: { x: number; y: number } = warehousePos;
          const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;

          if (botX === warehouse.x && botY === warehouse.y && hasArrivedVisually) {
            const DEPOSIT_DURATION = getAdjustedDuration(3000, bot.supercharged); // 3 seconds to deposit (or 1.5s if supercharged)

            // If already depositing, check if time has elapsed
            if (bot.actionStartTime !== undefined) {
              const elapsed = newState.gameTime - bot.actionStartTime;
              if (elapsed >= DEPOSIT_DURATION) {
                // Deposit complete
                newState = { ...newState, warehouse: [...newState.warehouse, ...bot.inventory] };
                return { ...bot, inventory: [], idleStartTime: undefined, status: 'depositing' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
              } else {
                // Still depositing
                return { ...bot, status: 'depositing' as const, visualX, visualY };
              }
            } else {
              // Start depositing
              return { ...bot, status: 'depositing' as const, visualX, visualY, actionStartTime: newState.gameTime, actionDuration: DEPOSIT_DURATION };
            }
          } else {
            // Travel to warehouse
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
              else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
          }
        }
      }

      if (!isInventoryFull && availableCrops.length > 0) {
        // Simple distance-based selection: Pick the nearest unclaimed crop
        const sortedCrops = availableCrops.sort((a, b) => {
          const distA = Math.abs(botX - a.x) + Math.abs(botY - a.y);
          const distB = Math.abs(botX - b.x) + Math.abs(botY - b.y);
          return distA - distB;
        });

        const nearest = sortedCrops[0]; // Always pick the nearest

        // Debug: Log when selecting new target
        if (bot.targetX !== nearest.x || bot.targetY !== nearest.y) {
          console.log(`[${bot.id}] CLAIMED: (${nearest.x}, ${nearest.y}), bot at (${botX}, ${botY}), ${availableCrops.length} crops available`);
        }

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const tile = updatedGrid[nearest.y]?.[nearest.x];
          if (tile && tile.type === 'grown' && tile.crop) {
            const ACTION_DURATION = getAdjustedDuration(1500, bot.supercharged);

            if (bot.actionStartTime !== undefined) {
              const elapsed = newState.gameTime - bot.actionStartTime;
              if (elapsed >= ACTION_DURATION) {
                const cropType = tile.crop;
                const quality = newState.player.inventory.seedQuality[cropType];
                console.log(`[${bot.id}] Successfully harvested ${cropType} at (${nearest.x}, ${nearest.y})`);

                updatedGrid = updatedGrid.map((row, rowY) =>
                  row.map((t, tileX) => {
                    if (tileX === nearest.x && rowY === nearest.y) {
                      return { ...t, type: 'dirt' as import('@/types/game').TileType, crop: null, growthStage: 0, plantedDay: undefined, wateredTimestamp: undefined, wateredToday: false, lastWorkedTime: newState.gameTime, overgrowthTime: newState.gameTime + (900000 + Math.random() * 900000) };
                    }
                    return t;
                  })
                );

                const improvedQuality = Math.random() < 0.1 ? { generation: quality.generation + 1, yield: Math.min(3.0, quality.yield + 0.1), growthSpeed: Math.min(2.0, quality.growthSpeed + 0.05) } : quality;

                newState = {
                  ...newState,
                  player: {
                    ...newState.player,
                    inventory: {
                      ...newState.player.inventory,
                      seeds: { ...newState.player.inventory.seeds, [cropType]: newState.player.inventory.seeds[cropType] + 1 },
                      seedQuality: { ...newState.player.inventory.seedQuality, [cropType]: improvedQuality },
                    },
                  },
                };

                // RELEASE CLAIM: Clear target after successful harvest
                console.log(`[${bot.id}] RELEASED: (${nearest.x}, ${nearest.y}) after harvest`);
                return { ...bot, inventory: [...bot.inventory, { crop: cropType, quality: improvedQuality }], status: 'idle' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined, idleStartTime: undefined, targetX: undefined, targetY: undefined };
              } else {
                return { ...bot, status: 'harvesting' as const, visualX, visualY };
              }
            } else {
              return { ...bot, status: 'harvesting' as const, visualX, visualY, actionStartTime: newState.gameTime, actionDuration: ACTION_DURATION };
            }
          } else {
            // Target tile is no longer harvestable - RELEASE CLAIM and go idle
            console.log(`[${bot.id}] RELEASED: (${nearest.x}, ${nearest.y}) - tile not harvestable`);
            return { ...bot, status: 'idle' as const, targetX: undefined, targetY: undefined, actionStartTime: undefined, actionDuration: undefined, visualX, visualY };
          }
        } else {
          // Traveling to target - keep claim active
          let newX = botX, newY = botY;
          if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
            if (botX < nearest.x) newX++; else if (botX > nearest.x) newX--;
            else if (botY < nearest.y) newY++; else if (botY > nearest.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: nearest.x, targetY: nearest.y, visualX, visualY, idleStartTime: undefined };
        }
      } else {
        // Idle - go to garage if it exists, otherwise wander
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - stay parked
            return { ...bot, status: 'idle' as const, visualX, visualY };
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'idle' as const, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY };
          }
        }
        // No garage - wander randomly
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable = tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared) || tile.type === 'planted' || tile.type === 'grown' || tile.type === 'sand' || tile.type === 'seaweed' || tile.type === 'shells' || tile.type === 'cactus' || tile.type === 'rocks' || tile.type === 'cave' || tile.type === 'mountain';
              if (isWalkable && tile.type !== 'ocean') walkableTiles.push({ x, y });
            });
          });

          const nearbyTiles = walkableTiles.filter(t => {
            const dx = Math.abs(t.x - botX);
            const dy = Math.abs(t.y - botY);
            return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0);
          });

          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, visualX, visualY };
          }
        }
      }

      return { ...bot, visualX, visualY };
    });
    newZones[zoneKey] = { ...zone, harvestBots: updatedHarvestBots, grid: updatedGrid };
  });

  // ========== SEED BOT AI (ALL ZONES) ==========
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned || !zone.seedBots || zone.seedBots.length === 0) return;

    const grid = zone.grid;
    let updatedGrid = grid;
    const updatedSeedBots = zone.seedBots.map(bot => {
      if (bot.x === undefined || bot.y === undefined) return bot;

      const botX = bot.x;
      const botY = bot.y;
      let visualX = bot.visualX ?? botX;
      let visualY = bot.visualY ?? botY;

      const dx = botX - visualX;
      const dy = botY - visualY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        visualX += dx * MOVE_SPEED;
        visualY += dy * MOVE_SPEED;
      } else {
        visualX = botX;
        visualY = botY;
      }

      if (bot.jobs.length === 0) {
        // Idle - go to garage if it exists, otherwise wander
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - stay parked
            return { ...bot, status: 'idle' as const, currentJobId: undefined, visualX, visualY };
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'idle' as const, currentJobId: undefined, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY };
          }
        }
        // No garage - wander randomly
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable =
                tile.type === 'grass' ||
                (tile.type === 'dirt' && tile.cleared) ||
                tile.type === 'planted' ||
                tile.type === 'grown';
              if (isWalkable) {
                walkableTiles.push({ x, y });
              }
            });
          });

          const nearbyTiles = walkableTiles.filter(t => {
            const dx = Math.abs(t.x - botX);
            const dy = Math.abs(t.y - botY);
            return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0);
          });

          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, currentJobId: undefined, visualX, visualY };
          }
        }
        return { ...bot, status: 'idle' as const, currentJobId: undefined, visualX, visualY };
      }

      let currentJob = bot.jobs.find(j => j.id === bot.currentJobId);
      if (!currentJob) {
        currentJob = bot.jobs[0];
      }

      const plantableTiles = currentJob.targetTiles.filter(targetTile => {
        const tile = grid[targetTile.y]?.[targetTile.x];
        return tile && ((tile.type === 'dirt' && tile.cleared) || tile.type === 'grass') && !tile.crop && !tile.hasSprinkler;
      });

      if (plantableTiles.length === 0) {
        const currentJobIndex = bot.jobs.findIndex(j => j.id === currentJob?.id);
        const nextJobIndex = (currentJobIndex + 1) % bot.jobs.length;
        const nextJob = bot.jobs[nextJobIndex];

        const nextPlantableTiles = nextJob.targetTiles.filter(targetTile => {
          const tile = grid[targetTile.y]?.[targetTile.x];
          return tile && ((tile.type === 'dirt' && tile.cleared) || tile.type === 'grass') && !tile.crop && !tile.hasSprinkler;
        });

        if (nextPlantableTiles.length > 0) {
          currentJob = nextJob;
        } else {
          return { ...bot, status: 'idle' as const, currentJobId: undefined, visualX, visualY };
        }
      }

      const cropType = currentJob.cropType;
      const currentSeeds = newState.player.inventory.seeds[cropType];

      if (bot.autoBuySeeds && currentSeeds < 5) {
        const seedCost = getCurrentSeedCost(cropType, newState.cropsSold);
        const amountToBuy = 10;
        const totalCost = seedCost * amountToBuy;

        if (newState.player.money >= totalCost) {
          newState = {
            ...newState,
            player: {
              ...newState.player,
              money: newState.player.money - totalCost,
              inventory: {
                ...newState.player.inventory,
                seeds: {
                  ...newState.player.inventory.seeds,
                  [cropType]: newState.player.inventory.seeds[cropType] + amountToBuy,
                },
              },
            },
          };
        }
      }

      if (newState.player.inventory.seeds[cropType] <= 0) {
        // Idle - go to garage if it exists, otherwise wander
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - stay parked
            return { ...bot, status: 'idle' as const, currentJobId: currentJob.id, visualX, visualY };
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'idle' as const, currentJobId: currentJob.id, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY };
          }
        }
        // No garage - wander randomly
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable =
                tile.type === 'grass' ||
                (tile.type === 'dirt' && tile.cleared) ||
                tile.type === 'planted' ||
                tile.type === 'grown';
              if (isWalkable) {
                walkableTiles.push({ x, y });
              }
            });
          });

          const nearbyTiles = walkableTiles.filter(t => {
            const dx = Math.abs(t.x - botX);
            const dy = Math.abs(t.y - botY);
            return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0);
          });

          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, currentJobId: currentJob.id, visualX, visualY };
          }
        }
        return { ...bot, status: 'idle' as const, currentJobId: currentJob.id, visualX, visualY };
      }

      const refreshedPlantableTiles = currentJob.targetTiles.filter(targetTile => {
        const tile = updatedGrid[targetTile.y]?.[targetTile.x];
        return tile && ((tile.type === 'dirt' && tile.cleared) || tile.type === 'grass') && !tile.crop && !tile.hasSprinkler;
      });

      // Filter out tiles already claimed by other seed bots
      const claimedSeedTiles = new Set<string>();
      zone.seedBots.forEach(otherBot => {
        if (otherBot.id !== bot.id && otherBot.targetX !== undefined && otherBot.targetY !== undefined) {
          claimedSeedTiles.add(`${otherBot.targetX},${otherBot.targetY}`);
        }
      });

      const availablePlantableTiles = refreshedPlantableTiles.filter(tile =>
        !claimedSeedTiles.has(`${tile.x},${tile.y}`)
      );

      if (availablePlantableTiles.length > 0) {
        let nearest = availablePlantableTiles[0];
        let minDist = Math.abs(botX - nearest.x) + Math.abs(botY - nearest.y);
        availablePlantableTiles.forEach(tile => {
          const dist = Math.abs(botX - tile.x) + Math.abs(botY - tile.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = tile;
          }
        });

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const tile = updatedGrid[nearest.y]?.[nearest.x];
          if (tile && ((tile.type === 'dirt' && tile.cleared) || tile.type === 'grass') && !tile.crop) {
            const ACTION_DURATION = getAdjustedDuration(800, bot.supercharged); // Faster planting (400ms if supercharged)

            if (bot.actionStartTime !== undefined) {
              const elapsed = newState.gameTime - bot.actionStartTime;
              if (elapsed >= ACTION_DURATION) {
                updatedGrid = updatedGrid.map((row, rowY) =>
                  row.map((t, tileX) => {
                    if (tileX === nearest.x && rowY === nearest.y) {
                      return {
                        ...t,
                        type: 'planted' as import('@/types/game').TileType,
                        crop: cropType,
                        growthStage: 0,
                        lastWorkedTime: undefined,
                        overgrowthTime: undefined,
                      };
                    }
                    return t;
                  })
                );

                newState = {
                  ...newState,
                  player: {
                    ...newState.player,
                    inventory: {
                      ...newState.player.inventory,
                      seeds: {
                        ...newState.player.inventory.seeds,
                        [cropType]: newState.player.inventory.seeds[cropType] - 1,
                      },
                    },
                  },
                };

                return { ...bot, status: 'planting' as const, currentJobId: currentJob.id, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
              } else {
                return { ...bot, status: 'planting' as const, currentJobId: currentJob.id, visualX, visualY };
              }
            } else {
              return { ...bot, status: 'planting' as const, currentJobId: currentJob.id, visualX, visualY, actionStartTime: newState.gameTime, actionDuration: ACTION_DURATION };
            }
          }
        } else {
          let newX = botX, newY = botY;
          if (Math.random() < (deltaTime / 250)) { // Faster movement (was 500)
            if (botX < nearest.x) newX++; else if (botX > nearest.x) newX--;
            else if (botY < nearest.y) newY++; else if (botY > nearest.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: nearest.x, targetY: nearest.y, currentJobId: currentJob.id, visualX, visualY };
        }
      } else {
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable =
                tile.type === 'grass' ||
                (tile.type === 'dirt' && tile.cleared) ||
                tile.type === 'planted' ||
                tile.type === 'grown';
              if (isWalkable) {
                walkableTiles.push({ x, y });
              }
            });
          });

          const nearbyTiles = walkableTiles.filter(t => {
            const dx = Math.abs(t.x - botX);
            const dy = Math.abs(t.y - botY);
            return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0);
          });

          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, currentJobId: currentJob.id, visualX, visualY };
          }
        }
        return { ...bot, status: 'idle' as const, currentJobId: currentJob.id, visualX, visualY };
      }

      return { ...bot, visualX, visualY };
    });
    newZones[zoneKey] = { ...zone, seedBots: updatedSeedBots, grid: updatedGrid };
  });

  // ========== TRANSPORT BOT AI (START ZONE ONLY) ==========
  const startZoneKey = '0,0';
  const startZone = newZones[startZoneKey];
  if (startZone && startZone.owned && startZone.transportBots && startZone.transportBots.length > 0) {
    const grid = startZone.grid;
    const updatedTransportBots = startZone.transportBots.map(bot => {
      if (bot.x === undefined || bot.y === undefined) return bot;

      const botX = bot.x;
      const botY = bot.y;
      let visualX = bot.visualX ?? botX;
      let visualY = bot.visualY ?? botY;

      const dx = botX - visualX;
      const dy = botY - visualY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        visualX += dx * MOVE_SPEED;
        visualY += dy * MOVE_SPEED;
      } else {
        visualX = botX;
        visualY = botY;
      }

      // Find warehouse and export positions
      let warehousePos: { x: number; y: number } | null = null;
      let exportPos: { x: number; y: number } | null = null;
      grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (tile.type === 'warehouse' && !warehousePos) warehousePos = { x, y };
          if (tile.type === 'export' && !exportPos) exportPos = { x, y };
        });
      });

      if (!warehousePos || !exportPos) {
        return { ...bot, visualX, visualY, status: 'idle' as const };
      }

      const warehouse: { x: number; y: number } = warehousePos;
      const exportStation: { x: number; y: number } = exportPos;

      // Bot has inventory, go to export to sell
      if (bot.inventory.length > 0) {
        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === exportStation.x && botY === exportStation.y && hasArrivedVisually) {
          // Selling at export station
          const ACTION_DURATION = getAdjustedDuration(2000, bot.supercharged);
          if (bot.actionStartTime !== undefined) {
            const elapsed = newGameTime - bot.actionStartTime;
            if (elapsed >= ACTION_DURATION) {
              // Calculate total money from selling (rounded to nearest dollar)
              const totalMoney = Math.round(bot.inventory.reduce((sum, item) => {
                const cropInfo = CROP_INFO[item.crop];
                return sum + (cropInfo.sellPrice * item.quality.yield);
              }, 0));

              // Create sales records for this transport bot sale
              const cropCounts: Record<string, number> = {};
              bot.inventory.forEach(item => {
                cropCounts[item.crop] = (cropCounts[item.crop] || 0) + 1;
              });

              const salesRecords: import('@/types/game').SaleRecord[] = [];
              Object.entries(cropCounts).forEach(([crop, quantity]) => {
                const cropType = crop as Exclude<import('@/types/game').CropType, null>;
                const cropInfo = CROP_INFO[cropType];
                const avgQuality = bot.inventory
                  .filter(item => item.crop === crop)
                  .reduce((sum, item) => sum + item.quality.yield, 0) / quantity;
                const pricePerUnit = Math.floor(cropInfo.sellPrice * avgQuality);
                const revenue = pricePerUnit * quantity;

                salesRecords.push({
                  timestamp: newGameTime,
                  day: newState.currentDay,
                  crop: cropType,
                  quantity,
                  pricePerUnit,
                  totalRevenue: revenue,
                  zoneKey: startZoneKey,
                });
              });

              // Update sales history (keep last 100 records)
              const existingSalesHistory = newState.salesHistory || [];
              const newSalesHistory = [...existingSalesHistory, ...salesRecords].slice(-100);

              // Update player money
              newState = {
                ...newState,
                player: {
                  ...newState.player,
                  money: newState.player.money + totalMoney,
                },
                salesHistory: newSalesHistory,
              };

              // Clear bot inventory
              return { ...bot, inventory: [], status: 'selling' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
            } else {
              return { ...bot, status: 'selling' as const, visualX, visualY };
            }
          } else {
            return { ...bot, status: 'selling' as const, visualX, visualY, actionStartTime: newGameTime, actionDuration: ACTION_DURATION };
          }
        } else {
          // Travel to export station
          let newX = botX, newY = botY;
          if (Math.random() < (deltaTime / 400)) { // Slightly faster than other bots
            if (botX < exportStation.x) newX++; else if (botX > exportStation.x) newX--;
            else if (botY < exportStation.y) newY++; else if (botY > exportStation.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'transporting' as const, targetX: exportStation.x, targetY: exportStation.y, visualX, visualY };
        }
      }
      // Bot has empty inventory, check warehouse for items
      else if (newState.warehouse.length > 0 && bot.inventory.length < bot.inventoryCapacity) {
        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === warehouse.x && botY === warehouse.y && hasArrivedVisually) {
          // Loading from warehouse
          const ACTION_DURATION = getAdjustedDuration(1500, bot.supercharged);
          if (bot.actionStartTime !== undefined) {
            const elapsed = newGameTime - bot.actionStartTime;
            if (elapsed >= ACTION_DURATION) {
              // Load items from warehouse (up to capacity)
              const itemsToLoad = newState.warehouse.slice(0, Math.min(bot.inventoryCapacity - bot.inventory.length, newState.warehouse.length));
              const remainingItems = newState.warehouse.slice(itemsToLoad.length);

              // Update warehouse
              newState = {
                ...newState,
                warehouse: remainingItems,
              };

              // Load items into bot
              return { ...bot, inventory: [...bot.inventory, ...itemsToLoad], status: 'loading' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
            } else {
              return { ...bot, status: 'loading' as const, visualX, visualY };
            }
          } else {
            return { ...bot, status: 'loading' as const, visualX, visualY, actionStartTime: newGameTime, actionDuration: ACTION_DURATION };
          }
        } else {
          // Travel to warehouse
          let newX = botX, newY = botY;
          if (Math.random() < (deltaTime / 400)) { // Slightly faster than other bots
            if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
            else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
        }
      }
      // Idle - go to garage if it exists, otherwise wander near warehouse
      else {
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - stay parked
            return { ...bot, status: 'idle' as const, visualX, visualY };
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < (deltaTime / 400)) { // Slightly faster than other bots
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'idle' as const, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY };
          }
        }
        // No garage - wander near warehouse
        // Check if bot has reached current target (visual position matches logical position)
        const hasReachedTarget = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;

        // Every 2-3 seconds (on average), pick a new random tile to wander to
        if (hasReachedTarget && Math.random() < (deltaTime / 2500)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable = tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared) || tile.type === 'planted' || tile.type === 'grown';
              if (isWalkable) walkableTiles.push({ x, y });
            });
          });

          // Wander near warehouse (within 5 tiles)
          const nearWarehouse = walkableTiles.filter(t => {
            const dx = Math.abs(t.x - warehouse.x);
            const dy = Math.abs(t.y - warehouse.y);
            return dx <= 5 && dy <= 5 && (t.x !== botX || t.y !== botY); // Not current position
          });

          if (nearWarehouse.length > 0) {
            const randomTile = nearWarehouse[Math.floor(Math.random() * nearWarehouse.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, visualX, visualY };
          }
        }

        return { ...bot, status: 'idle' as const, visualX, visualY };
      }

      return { ...bot, visualX, visualY };
    });
    newZones[startZoneKey] = { ...startZone, transportBots: updatedTransportBots };
  }

  // ========== DEMOLISH BOT AI (ALL ZONES) ==========
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned || !zone.demolishBots || zone.demolishBots.length === 0) return;

    const grid = zone.grid;
    let updatedGrid = grid;

    // Track claimed tiles across all bots in this update cycle
    const globalClaimedTiles = new Set<string>();

    // Process bots sequentially to properly track claims
    const updatedDemolishBots: import('@/types/game').DemolishBot[] = [];

    for (const bot of zone.demolishBots) {
      if (bot.x === undefined || bot.y === undefined) {
        updatedDemolishBots.push(bot);
        continue;
      }

      const botX = bot.x;
      const botY = bot.y;
      let visualX = bot.visualX ?? botX;
      let visualY = bot.visualY ?? botY;

      const dx = botX - visualX;
      const dy = botY - visualY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        visualX += dx * MOVE_SPEED;
        visualY += dy * MOVE_SPEED;
      } else {
        visualX = botX;
        visualY = botY;
      }

      // Find rocks and forest tiles that need clearing
      const obstacleTiles: Array<{ x: number; y: number }> = [];
      grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (tile.type === 'rock' || tile.type === 'tree') {
            obstacleTiles.push({ x, y });
          }
        });
      });

      // Filter out obstacles already claimed by other bots processed before this one
      const availableObstacles = obstacleTiles.filter(obstacle =>
        !globalClaimedTiles.has(`${obstacle.x},${obstacle.y}`)
      );

      // Check if bot has a current target and if it still exists
      let currentTargetStillExists = false;
      if (bot.targetX !== undefined && bot.targetY !== undefined) {
        const targetTile = grid[bot.targetY]?.[bot.targetX];
        currentTargetStillExists = targetTile && (targetTile.type === 'rock' || targetTile.type === 'tree');
      }

      // Only recalculate target if current target doesn't exist or bot is idle without a target
      let nearest: { x: number; y: number } | null = null;
      if (currentTargetStillExists && bot.targetX !== undefined && bot.targetY !== undefined) {
        // Stick with current target
        nearest = { x: bot.targetX, y: bot.targetY };
      } else if (availableObstacles.length > 0) {
        // Find nearest unclaimed obstacle (sorted approach like harvest bots)
        const sortedObstacles = availableObstacles.sort((a, b) => {
          const distA = Math.abs(botX - a.x) + Math.abs(botY - a.y);
          const distB = Math.abs(botX - b.x) + Math.abs(botY - b.y);
          return distA - distB;
        });
        nearest = sortedObstacles[0];
      }

      if (nearest) {
        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          // Bot has arrived at obstacle, start/continue clearing
          const CLEARING_DURATION = getAdjustedDuration(TASK_DURATIONS.clear, bot.supercharged); // 10 seconds (or 5s if supercharged)
          if (bot.actionStartTime !== undefined) {
            const elapsed = newGameTime - bot.actionStartTime;
            if (elapsed >= CLEARING_DURATION) {
              // Clearing complete - clear the tile
              updatedGrid = updatedGrid.map((row, rowY) =>
                row.map((tile, tileX) => {
                  if (tileX === nearest.x && rowY === nearest.y) {
                    return { ...tile, type: 'dirt' as const, cleared: true, lastWorkedTime: newGameTime };
                  }
                  return tile;
                })
              );
              const updatedBot = { ...bot, status: 'idle' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
              updatedDemolishBots.push(updatedBot);
              continue;
            } else {
              // Still clearing - keep existing target and preserve timing for progress bar
              const updatedBot = { ...bot, status: 'clearing' as const, visualX, visualY, actionStartTime: bot.actionStartTime, actionDuration: bot.actionDuration };
              if (updatedBot.targetX !== undefined && updatedBot.targetY !== undefined) {
                globalClaimedTiles.add(`${updatedBot.targetX},${updatedBot.targetY}`);
              }
              updatedDemolishBots.push(updatedBot);
              continue;
            }
          } else {
            // Start clearing - keep existing target
            const updatedBot = { ...bot, status: 'clearing' as const, visualX, visualY, actionStartTime: newGameTime, actionDuration: CLEARING_DURATION };
            if (updatedBot.targetX !== undefined && updatedBot.targetY !== undefined) {
              globalClaimedTiles.add(`${updatedBot.targetX},${updatedBot.targetY}`);
            }
            updatedDemolishBots.push(updatedBot);
            continue;
          }
        } else {
          // Travel to obstacle - claim new target
          let newX = botX, newY = botY;
          if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
            if (botX < nearest.x) newX++; else if (botX > nearest.x) newX--;
            else if (botY < nearest.y) newY++; else if (botY > nearest.y) newY--;
          }
          const updatedBot = { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: nearest.x, targetY: nearest.y, visualX, visualY };
          globalClaimedTiles.add(`${nearest.x},${nearest.y}`);
          updatedDemolishBots.push(updatedBot);
          continue;
        }
      } else {
        // Idle - go to garage if it exists, otherwise wander
        const garagePos = findGaragePosition(grid);
        if (garagePos) {
          // Garage exists - navigate to it and park
          if (botX === garagePos.x && botY === garagePos.y) {
            // Already at garage - stay parked
            updatedDemolishBots.push({ ...bot, status: 'idle' as const, visualX, visualY });
            continue;
          } else {
            // Travel to garage
            let newX = botX, newY = botY;
            if (Math.random() < getMovementSpeed(deltaTime, bot.supercharged)) {
              if (botX < garagePos.x) newX++; else if (botX > garagePos.x) newX--;
              else if (botY < garagePos.y) newY++; else if (botY > garagePos.y) newY--;
            }
            const updatedBot = { ...bot, x: newX, y: newY, status: 'idle' as const, targetX: garagePos.x, targetY: garagePos.y, visualX, visualY };
            globalClaimedTiles.add(`${garagePos.x},${garagePos.y}`);
            updatedDemolishBots.push(updatedBot);
            continue;
          }
        }
        // No garage - wander randomly
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable = tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared) || tile.type === 'planted' || tile.type === 'grown' || tile.type === 'sand' || tile.type === 'seaweed' || tile.type === 'shells' || tile.type === 'cactus';
              if (isWalkable) walkableTiles.push({ x, y });
            });
          });
          const nearbyTiles = walkableTiles.filter(t => { const dx = Math.abs(t.x - botX); const dy = Math.abs(t.y - botY); return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0); });
          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            updatedDemolishBots.push({ ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, visualX, visualY });
            continue;
          }
        }
      }
      // Default: keep bot as-is
      updatedDemolishBots.push({ ...bot, visualX, visualY });
    }
    newZones[zoneKey] = { ...zone, demolishBots: updatedDemolishBots, grid: updatedGrid };
  });

  // Check and auto-refill seeds if enabled
  newState = checkAndAutoRefill(newState);

  // Update current zone with modified task queue and current task
  newState = {
    ...newState,
    zones: {
      ...newZones,
      [currentZoneKey]: {
        ...newZones[currentZoneKey],
        taskQueue: currentZone.taskQueue,
        currentTask: currentZone.currentTask,
      },
    },
  };

  // Check for completed constructions and convert them to final buildings
  newState = checkConstructionCompletion(newState);

  return {
    ...newState,
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
          type: 'grass' as TileType,
          cleared: true,
          lastWorkedTime: state.gameTime,
          overgrowthTime: state.gameTime + (900000 + Math.random() * 900000), // 15-30 minutes random
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

  // Can only plant on cleared grass/dirt tiles without crops, sprinklers, or buildings
  if (!tile || !tile.cleared || tile.crop || !cropType) return state;
  if (tile.hasSprinkler) return state; // Don't plant on sprinklers
  if (tile.type !== 'grass' && tile.type !== 'dirt') return state; // Don't plant on buildings

  // Seed count is already decreased when task was queued, so just plant
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          type: 'planted' as TileType,
          crop: cropType,
          growthStage: 0,
          plantedDay: state.currentDay, // Track when planted
          wateredTimestamp: undefined, // Crop needs to be watered first before growing
          wateredToday: false, // Crop needs water after planting
          lastWorkedTime: undefined, // Clear overgrowth tracking - tile is in use
          overgrowthTime: undefined,
        };
      }
      return t;
    })
  );

  return updateCurrentGrid(state, newGrid);
}

export function harvestCrop(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);
  const tile = grid[tileY]?.[tileX];
  if (!tile || tile.type !== 'grown' || !tile.crop) return state;

  // Check if basket is full
  if (state.player.basket && state.player.basket.length >= state.player.basketCapacity) return state;

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
          wateredTimestamp: undefined, // Clear old timestamp to prevent reuse on next crop
          wateredToday: false, // Reset watering status
          lastWorkedTime: state.gameTime,
          overgrowthTime: state.gameTime + (900000 + Math.random() * 900000), // 15-30 minutes random
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

  // After placing sprinkler, instantly water all plants in 7x7 coverage area
  const wateredGrid = newGrid.map((row, y) =>
    row.map((t, x) => {
      const dx = Math.abs(x - tileX);
      const dy = Math.abs(y - tileY);

      // Check if tile is in sprinkler range (7x7 area)
      if (dx <= SPRINKLER_RANGE && dy <= SPRINKLER_RANGE) {
        // If there's a planted crop that hasn't been watered, water it instantly
        if (t.type === 'planted' && !t.wateredTimestamp) {
          return {
            ...t,
            wateredTimestamp: state.gameTime,
            wateredToday: true,
          };
        }
      }
      return t;
    })
  );

  const updatedState = updateCurrentGrid(state, wateredGrid);

  // Return state with sprinkler count decreased
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
  const cost = getCurrentSeedCost(cropType, state.cropsSold) * amount;
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

export function toggleAutoBuy(state: GameState, cropType: Exclude<CropType, null>): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      autoBuy: {
        ...state.player.autoBuy,
        [cropType]: !state.player.autoBuy[cropType],
      },
    },
  };
}

// Generate automated farmer tasks based on player's automation settings
function generateFarmerAutoTasks(state: GameState, zone: Zone): Task[] {
  const tasks: Task[] = [];
  const { farmerAuto, basket, basketCapacity, inventory } = state.player;
  const grid = zone.grid;

  // Priority 1: Auto Sell (if basket has items, go to export building to sell)
  if (farmerAuto.autoSell && basket.length > 0) {
    const exportPos = findExportTile(state);
    if (exportPos) {
      // Go to export building to sell crops (no distance restriction)
      tasks.push({
        id: `auto-sell-${Date.now()}`,
        type: 'deposit',
        tileX: exportPos.x,
        tileY: exportPos.y,
        zoneX: state.currentZone.x,
        zoneY: state.currentZone.y,
        progress: 0,
        duration: TASK_DURATIONS.deposit,
      });
      return tasks; // Return immediately - selling is highest priority
    }
  }

  // Priority 2: Auto Harvest (if basket not full and there are grown crops nearby)
  if (farmerAuto.autoHarvest && basket.length < basketCapacity) {
    const harvestableTiles: Array<{ x: number; y: number; dist: number }> = [];
    grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === 'grown') {
          const dist = Math.abs(state.player.x - x) + Math.abs(state.player.y - y);
          harvestableTiles.push({ x, y, dist });
        }
      });
    });

    // Sort by distance and take closest tiles
    harvestableTiles.sort((a, b) => a.dist - b.dist);
    const nearbyHarvestable = harvestableTiles.slice(0, Math.min(5, basketCapacity - basket.length));

    nearbyHarvestable.forEach(tile => {
      tasks.push({
        id: `auto-harvest-${tile.x}-${tile.y}-${Date.now()}`,
        type: 'harvest',
        tileX: tile.x,
        tileY: tile.y,
        zoneX: state.currentZone.x,
        zoneY: state.currentZone.y,
        progress: 0,
        duration: TASK_DURATIONS.harvest,
      });
    });

    if (tasks.length > 0) return tasks;
  }

  // Priority 3: Auto Water (water planted crops that need watering)
  if (farmerAuto.autoWater) {
    const unwateredTiles: Array<{ x: number; y: number; dist: number }> = [];
    grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === 'planted' && !tile.wateredToday) {
          const dist = Math.abs(state.player.x - x) + Math.abs(state.player.y - y);
          unwateredTiles.push({ x, y, dist });
        }
      });
    });

    // Sort by distance and take closest tiles
    unwateredTiles.sort((a, b) => a.dist - b.dist);
    const nearbyUnwatered = unwateredTiles.slice(0, 10);

    nearbyUnwatered.forEach(tile => {
      tasks.push({
        id: `auto-water-${tile.x}-${tile.y}-${Date.now()}`,
        type: 'water',
        tileX: tile.x,
        tileY: tile.y,
        zoneX: state.currentZone.x,
        zoneY: state.currentZone.y,
        progress: 0,
        duration: TASK_DURATIONS.water,
      });
    });

    if (tasks.length > 0) return tasks;
  }

  // Priority 4: Auto Plant (plant seeds on empty cleared dirt/grass)
  if (farmerAuto.autoPlant && inventory.seeds[farmerAuto.autoPlantCrop] > 0) {
    const plantableTiles: Array<{ x: number; y: number; dist: number }> = [];
    grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const isPlantable =
          (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) &&
          !tile.crop &&
          !tile.hasSprinkler &&
          !tile.isConstructing;
        if (isPlantable) {
          const dist = Math.abs(state.player.x - x) + Math.abs(state.player.y - y);
          plantableTiles.push({ x, y, dist });
        }
      });
    });

    // Sort by distance and take closest tiles (limit to available seeds)
    plantableTiles.sort((a, b) => a.dist - b.dist);
    const nearbyPlantable = plantableTiles.slice(0, Math.min(10, inventory.seeds[farmerAuto.autoPlantCrop]));

    nearbyPlantable.forEach(tile => {
      tasks.push({
        id: `auto-plant-${tile.x}-${tile.y}-${Date.now()}`,
        type: 'plant',
        tileX: tile.x,
        tileY: tile.y,
        zoneX: state.currentZone.x,
        zoneY: state.currentZone.y,
        cropType: farmerAuto.autoPlantCrop,
        progress: 0,
        duration: TASK_DURATIONS.plant,
      });
    });

    if (tasks.length > 0) return tasks;
  }

  return tasks;
}

export function checkAndAutoRefill(state: GameState): GameState {
  let newState = state;

  // Check each crop type
  const cropTypes: Array<Exclude<CropType, null>> = ['carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon', 'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'];

  for (const cropType of cropTypes) {
    // If auto-buy is enabled and seeds are at 0, buy 1 seed
    if (newState.player.autoBuy[cropType] && newState.player.inventory.seeds[cropType] === 0) {
      const cost = getCurrentSeedCost(cropType, newState.cropsSold);

      // Only buy if player has enough money
      if (newState.player.money >= cost) {
        newState = buySeeds(newState, cropType, 1);
      }
    }
  }

  return newState;
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
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  const MAX_WATERBOTS = 3;

  // Check if player has reached max capacity (2 total)
  if (state.player.inventory.waterbots >= MAX_WATERBOTS) return state;

  // Progressive pricing - cost increases with each bot owned
  const currentCost = getBotCost(WATERBOT_COST, state.player.inventory.waterbots);

  // Check if player can afford it
  if (state.player.money < currentCost) return state;

  // Limit purchase to 1 bot per zone
  const actualAmount = 1;
  const actualCost = currentCost;

  // Create actual WaterBot entities
  const newBots: WaterBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = `waterbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const spawnX = state.player.x + (i + 1);
    const spawnY = state.player.y;
    newBots.push({
      id: botId,
      waterLevel: WATERBOT_MAX_WATER, // Start with full water
      jobs: [], // Start with no jobs
      status: 'idle',
      x: spawnX, // Spawn near player
      y: spawnY,
      visualX: spawnX, // Initialize visual position to match
      visualY: spawnY,
    });
  }


  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - actualCost,
      inventory: {
        ...state.player.inventory,
        waterbots: state.player.inventory.waterbots + actualAmount,
      },
    },
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        waterBots: [...currentZone.waterBots, ...newBots],
      },
    },
  };
}

export function buyHarvestbots(state: GameState, amount: number): GameState {
  // Limit to 7 harvest bots total
  if (state.player.inventory.harvestbots >= 7) return state; // Already has 7 harvest bots

  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  // Progressive pricing - cost increases with each bot owned
  const currentCost = getBotCost(HARVESTBOT_COST, state.player.inventory.harvestbots);

  // Check if player can afford it
  if (state.player.money < currentCost) return state;

  // Limit purchase to 1 bot per zone
  const actualAmount = 1;
  const actualCost = currentCost;

  // Create actual HarvestBot entities
  const newBots: import('@/types/game').HarvestBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = `harvestbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const spawnX = state.player.x + (i + 1);
    const spawnY = state.player.y + 1;
    newBots.push({
      id: botId,
      inventory: [], // Start with empty inventory
      inventoryCapacity: 8, // Same as player basket capacity
      jobs: [], // Start with no jobs
      status: 'idle',
      x: spawnX, // Spawn near player
      y: spawnY,
      visualX: spawnX, // Initialize visual position to match
      visualY: spawnY,
    });
  }


  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - actualCost,
      inventory: {
        ...state.player.inventory,
        harvestbots: state.player.inventory.harvestbots + actualAmount,
      },
    },
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        harvestBots: [...currentZone.harvestBots, ...newBots],
      },
    },
  };
}

export function buySeedbots(state: GameState, amount: number): GameState {
  // Limit to 3 seed bots total
  if (state.player.inventory.seedbots >= 3) return state; // Already has 3 seed bots

  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  // Progressive pricing - cost increases with each bot owned
  const currentCost = getBotCost(SEEDBOT_COST, state.player.inventory.seedbots);

  // Check if player can afford it
  if (state.player.money < currentCost) return state;

  // Limit purchase to 1 bot per zone
  const actualAmount = 1;
  const actualCost = currentCost;

  // Create actual SeedBot entities
  const newBots: import('@/types/game').SeedBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = `seedbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const spawnX = state.player.x + (i + 1);
    const spawnY = state.player.y + 1;
    newBots.push({
      id: botId,
      jobs: [], // Start with no jobs configured
      status: 'idle',
      autoBuySeeds: true, // Auto-buy seeds enabled by default
      x: spawnX, // Spawn near player
      y: spawnY,
      visualX: spawnX, // Initialize visual position to match
      visualY: spawnY,
    });
  }


  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - actualCost,
      inventory: {
        ...state.player.inventory,
        seedbots: state.player.inventory.seedbots + actualAmount,
      },
    },
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        seedBots: [...currentZone.seedBots, ...newBots],
      },
    },
  };
}

export function buyTransportbots(state: GameState, amount: number): GameState {
  // Transport bots only work in the starting zone (0,0)
  const startZoneKey = '0,0';
  const startZone = state.zones[startZoneKey];
  if (!startZone) return state; // Start zone doesn't exist
  if (startZone.transportBots.length >= 1) return state; // Max 1 transport bot

  // Progressive pricing - cost increases with each bot owned
  const currentCost = getBotCost(TRANSPORTBOT_COST, state.player.inventory.transportbots || 0);

  // Check if player can afford it
  if (state.player.money < currentCost) return state;

  // Limit purchase to 1 bot at a time
  const actualAmount = 1;
  const actualCost = currentCost;

  // Create actual TransportBot entities
  const newBots: import('@/types/game').TransportBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = `transportbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Find warehouse position to spawn near it
    let spawnX = 10;
    let spawnY = 10;
    startZone.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === 'warehouse') {
          spawnX = x + 1;
          spawnY = y;
        }
      });
    });

    newBots.push({
      id: botId,
      inventory: [],
      inventoryCapacity: 16, // Can carry 16 crops
      status: 'idle',
      x: spawnX, // Spawn near warehouse
      y: spawnY,
      visualX: spawnX,
      visualY: spawnY,
    });
  }

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - actualCost,
      inventory: {
        ...state.player.inventory,
        transportbots: state.player.inventory.transportbots + actualAmount,
      },
    },
    zones: {
      ...state.zones,
      [startZoneKey]: {
        ...startZone,
        transportBots: [...startZone.transportBots, ...newBots],
      },
    },
  };
}

export function buyDemolishbots(state: GameState, amount: number): GameState {
  // Limit to 3 demolish bots total (with fallback for undefined)
  const currentDemolishbots = state.player.inventory.demolishbots || 0;
  if (currentDemolishbots >= 3) return state;

  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  // Progressive pricing - cost increases with each bot owned
  const currentCost = getBotCost(DEMOLISHBOT_COST, currentDemolishbots);

  // Check if player can afford it
  if (state.player.money < currentCost) return state;

  // Limit purchase to 1 bot at a time
  const actualAmount = 1;
  const actualCost = currentCost;

  // Create actual DemolishBot entities
  const newBots: DemolishBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = `demolishbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const spawnX = state.player.x + (i + 1);
    const spawnY = state.player.y;
    newBots.push({
      id: botId,
      jobs: [], // Start with no jobs
      status: 'idle',
      x: spawnX, // Spawn near player
      y: spawnY,
      visualX: spawnX,
      visualY: spawnY,
    });
  }

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - actualCost,
      inventory: {
        ...state.player.inventory,
        demolishbots: (state.player.inventory.demolishbots || 0) + actualAmount,
      },
    },
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        demolishBots: [...(currentZone.demolishBots || []), ...newBots],
      },
    },
  };
}

export function updateSeedBotJobs(
  state: GameState,
  botId: string,
  jobs: import('@/types/game').SeedBotJob[],
  autoBuySeeds: boolean
): GameState {
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  return {
    ...state,
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        seedBots: currentZone.seedBots.map((bot) =>
          bot.id === botId
            ? { ...bot, jobs, autoBuySeeds }
            : bot
        ),
      },
    },
  };
}

export function upgradeBag(state: GameState): GameState {
  const currentUpgrades = state.player.bagUpgrades || 0;

  // Check if max upgrades reached
  if (currentUpgrades >= MAX_BAG_UPGRADES) return state;

  const upgradeCost = BAG_UPGRADE_COSTS[currentUpgrades];
  if (state.player.money < upgradeCost) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - upgradeCost,
      basketCapacity: state.player.basketCapacity + BAG_UPGRADE_CAPACITY,
      bagUpgrades: currentUpgrades + 1,
    },
  };
}

export function buyMechanicShop(state: GameState): GameState {
  // Only allow buying if they don't already have one
  if (state.player.money < MECHANIC_SHOP_COST || state.player.inventory.mechanicShop >= 1) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - MECHANIC_SHOP_COST,
      inventory: {
        ...state.player.inventory,
        mechanicShop: 1,
      },
    },
  };
}

export function placeMechanicShop(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);

  // Check bounds for 2x2 placement
  if (tileX + 1 >= GAME_CONFIG.gridWidth || tileY + 1 >= GAME_CONFIG.gridHeight) {
    return state; // Not enough space
  }

  // Check that all 4 tiles are cleared grass/dirt
  const tiles = [
    grid[tileY]?.[tileX],
    grid[tileY]?.[tileX + 1],
    grid[tileY + 1]?.[tileX],
    grid[tileY + 1]?.[tileX + 1],
  ];

  const allTilesValid = tiles.every(t =>
    t && t.cleared && (t.type === 'grass' || t.type === 'dirt')
  );

  if (!allTilesValid || state.player.inventory.mechanicShop <= 0) {
    return state;
  }

  // Check if this is a relocation (building already placed elsewhere)
  const isRelocation = state.player.inventory.mechanicShopPlaced;

  // If relocating, place instantly. If first time, go through construction.
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if ((x === tileX || x === tileX + 1) && (y === tileY || y === tileY + 1)) {
        if (isRelocation) {
          // Instant placement for relocation
          return {
            ...t,
            type: 'mechanic' as const,
          };
        } else {
          // Construction phase for first-time placement
          return {
            ...t,
            isConstructing: true,
            constructionTarget: 'mechanic' as const,
            constructionStartTime: state.gameTime,
            constructionDuration: CONSTRUCTION_DURATIONS.mechanic,
          };
        }
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
        mechanicShopPlaced: true,
      },
    },
  };
}

export function relocateMechanicShop(state: GameState): GameState {
  // Only allow relocating if the shop is currently placed
  if (!state.player.inventory.mechanicShopPlaced) {
    return state;
  }

  // Find and remove the mechanic shop tile from all zones (including construction sites)
  const newZones = { ...state.zones };
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    const newGrid = zone.grid.map(row =>
      row.map(tile => {
        // Remove completed mechanic shops
        if (tile.type === 'mechanic') {
          return {
            ...tile,
            type: 'grass' as const,
          };
        }
        // Also remove mechanic shops still under construction
        if (tile.isConstructing && tile.constructionTarget === 'mechanic') {
          return {
            ...tile,
            type: 'grass' as const,
            isConstructing: false,
            constructionTarget: undefined,
            constructionStartTime: undefined,
            constructionDuration: undefined,
          };
        }
        return tile;
      })
    );
    newZones[zoneKey] = { ...zone, grid: newGrid };
  });

  return {
    ...state,
    zones: newZones,
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        mechanicShopPlaced: false,
      },
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
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  // Check if there's already a task queued or in progress for this tile
  const hasExistingTask = currentZone.taskQueue.some(
    t => t.tileX === tileX && t.tileY === tileY &&
         t.zoneX === state.currentZone.x && t.zoneY === state.currentZone.y
  );
  const isCurrentTask = currentZone.currentTask &&
    currentZone.currentTask.tileX === tileX &&
    currentZone.currentTask.tileY === tileY &&
    currentZone.currentTask.zoneX === state.currentZone.x &&
    currentZone.currentTask.zoneY === state.currentZone.y;

  // If a task already exists for this tile, don't add a new one
  if (hasExistingTask || isCurrentTask) {
    return state;
  }

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

  // Manual tasks should be prioritized above automated tasks
  // Find the first automated task (IDs start with "auto-")
  const firstAutoTaskIndex = currentZone.taskQueue.findIndex(t => t.id.startsWith('auto-'));

  let newTaskQueue: import('@/types/game').Task[];
  if (firstAutoTaskIndex >= 0) {
    // Insert manual task before first automated task
    newTaskQueue = [
      ...currentZone.taskQueue.slice(0, firstAutoTaskIndex),
      task,
      ...currentZone.taskQueue.slice(firstAutoTaskIndex),
    ];
  } else {
    // No automated tasks, add to end normally
    newTaskQueue = [...currentZone.taskQueue, task];
  }

  return {
    ...state,
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        taskQueue: newTaskQueue,
      },
    },
  };
}

// Remove task from queue
export function removeTask(state: GameState, taskId: string): GameState {
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  return {
    ...state,
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        taskQueue: currentZone.taskQueue.filter(t => t.id !== taskId),
      },
    },
  };
}

// Find warehouse tile coordinates in current zone
function findWarehouseTile(state: GameState): { x: number; y: number } | null {
  const grid = getCurrentGrid(state);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x].type === 'warehouse') {
        return { x, y };
      }
    }
  }
  return null;
}

function findExportTile(state: GameState): { x: number; y: number } | null {
  const grid = getCurrentGrid(state);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x].type === 'export') {
        return { x, y };
      }
    }
  }
  return null;
}

// Deposit all items from basket - if at export building, sell them; if at warehouse, store them
export function depositToWarehouse(state: GameState): GameState {
  const grid = getCurrentGrid(state);
  const currentTile = grid[state.player.y]?.[state.player.x];

  // If at export building, sell the crops
  if (currentTile?.type === 'export') {
    // Use the sellCrops function which properly records sales history
    const result = sellCrops(state);
    if (result.success) {
      return result.state;
    }
    // If sell failed, return unchanged state
    return state;
  }

  // Otherwise, just deposit to warehouse (storage)
  return {
    ...state,
    warehouse: [...state.warehouse, ...state.player.basket],
    player: {
      ...state.player,
      basket: [], // Empty the basket
    },
  };
}

/**
 * Records earnings for a specific zone
 */
export function recordZoneEarnings(state: GameState, amount: number, zoneName: string): GameState {
  // Initialize zoneEarnings if it doesn't exist
  const zoneEarnings = state.zoneEarnings || {};

  // Get the zone key from current zone
  const zoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);

  // Get or create the ZoneEarnings for the current zone
  const currentZoneEarnings = zoneEarnings[zoneKey] || {
    zoneKey,
    zoneName,
    totalEarnings: 0,
    earningsHistory: [],
  };

  // Add the amount to total earnings
  const newTotalEarnings = currentZoneEarnings.totalEarnings + amount;

  // Add an entry to earningsHistory (keep only last 20)
  const newEarningsHistory = [
    { timestamp: Date.now(), amount },
    ...currentZoneEarnings.earningsHistory,
  ].slice(0, 20);

  // Update the zone earnings
  const updatedZoneEarnings: ZoneEarnings = {
    ...currentZoneEarnings,
    totalEarnings: newTotalEarnings,
    earningsHistory: newEarningsHistory,
  };

  return {
    ...state,
    zoneEarnings: {
      ...zoneEarnings,
      [zoneKey]: updatedZoneEarnings,
    },
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
  const salesRecords: import('@/types/game').SaleRecord[] = [];

  state.player.basket.forEach(item => {
    const cropInfo = CROP_INFO[item.crop];
    const pricePerCrop = Math.floor(cropInfo.sellPrice * item.quality.yield);
    totalEarned += pricePerCrop;
    cropCounts[item.crop] = (cropCounts[item.crop] || 0) + 1;
  });

  // Create sale records for each crop type sold
  Object.entries(cropCounts).forEach(([crop, quantity]) => {
    const cropType = crop as Exclude<import('@/types/game').CropType, null>;
    const cropInfo = CROP_INFO[cropType];
    const avgQuality = state.player.basket
      .filter(item => item.crop === crop)
      .reduce((sum, item) => sum + item.quality.yield, 0) / quantity;
    const pricePerUnit = Math.floor(cropInfo.sellPrice * avgQuality);
    const revenue = pricePerUnit * quantity;

    salesRecords.push({
      timestamp: state.gameTime,
      day: state.currentDay,
      crop: cropType,
      quantity,
      pricePerUnit,
      totalRevenue: revenue,
      zoneKey: getZoneKey(state.currentZone.x, state.currentZone.y),
    });
  });

  const summary = Object.entries(cropCounts)
    .map(([crop, count]) => `${count} ${crop}`)
    .join(', ');

  // Get the current zone for earnings tracking
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];
  const zoneName = currentZone?.name || 'Unknown Zone';

  // Update sales history (keep last 100 records)
  const existingSalesHistory = state.salesHistory || [];
  const newSalesHistory = [...existingSalesHistory, ...salesRecords].slice(-100);

  let newState: GameState = {
    ...state,
    player: {
      ...state.player,
      money: state.player.money + totalEarned,
      basket: [], // Empty the basket
    },
    salesHistory: newSalesHistory,
  };

  // Record earnings for this zone
  newState = recordZoneEarnings(newState, totalEarned, zoneName);

  return {
    success: true,
    state: newState,
    message: `Sold ${summary} for $${totalEarned}!`,
  };
}

export function buyWell(state: GameState): GameState {
  // Check if player can afford it
  if (state.player.money < WELL_COST) return state;

  // Check if player already has a well
  if (state.player.inventory.well >= 1) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - WELL_COST,
      inventory: {
        ...state.player.inventory,
        well: 1,
      },
    },
  };
}

export function placeWell(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);

  // Check bounds for 2x2 placement
  if (tileX + 1 >= GAME_CONFIG.gridWidth || tileY + 1 >= GAME_CONFIG.gridHeight) {
    return state; // Not enough space
  }

  // Check that all 4 tiles are cleared grass/dirt
  const tiles = [
    grid[tileY]?.[tileX],
    grid[tileY]?.[tileX + 1],
    grid[tileY + 1]?.[tileX],
    grid[tileY + 1]?.[tileX + 1],
  ];

  const allTilesValid = tiles.every(t =>
    t && t.cleared && (t.type === 'grass' || t.type === 'dirt')
  );

  if (!allTilesValid || state.player.inventory.well <= 0) {
    return state;
  }

  // Check if this is a relocation (building already placed in this zone)
  const isRelocation = state.player.inventory.wellPlaced;

  // If relocating, place instantly. If first time, go through construction.
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if ((x === tileX || x === tileX + 1) && (y === tileY || y === tileY + 1)) {
        if (isRelocation) {
          // Instant placement for relocation
          return {
            ...t,
            type: 'well' as const,
          };
        } else {
          // Construction phase for first-time placement
          return {
            ...t,
            isConstructing: true,
            constructionTarget: 'well' as const,
            constructionStartTime: state.gameTime,
            constructionDuration: CONSTRUCTION_DURATIONS.well,
          };
        }
      }
      return t;
    })
  );

  return {
    ...state,
    zones: {
      ...state.zones,
      [getZoneKey(state.currentZone.x, state.currentZone.y)]: {
        ...state.zones[getZoneKey(state.currentZone.x, state.currentZone.y)],
        grid: newGrid,
      },
    },
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        wellPlaced: true,
      },
    },
  };
}

export function buyGarage(state: GameState): GameState {
  // Check if player can afford it
  if (state.player.money < GARAGE_COST) return state;

  // Check if player already has a garage
  if (state.player.inventory.garage >= 1) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - GARAGE_COST,
      inventory: {
        ...state.player.inventory,
        garage: 1,
      },
    },
  };
}

export function placeGarage(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);

  // Check bounds for 2x2 placement
  if (tileX + 1 >= GAME_CONFIG.gridWidth || tileY + 1 >= GAME_CONFIG.gridHeight) {
    return state; // Not enough space
  }

  // Check that all 4 tiles are cleared grass/dirt
  const tiles = [
    grid[tileY]?.[tileX],
    grid[tileY]?.[tileX + 1],
    grid[tileY + 1]?.[tileX],
    grid[tileY + 1]?.[tileX + 1],
  ];

  const allTilesValid = tiles.every(t =>
    t && t.cleared && (t.type === 'grass' || t.type === 'dirt')
  );

  if (!allTilesValid || state.player.inventory.garage <= 0) {
    return state;
  }

  // Check if this is a relocation (building already placed in this zone)
  const isRelocation = state.player.inventory.garagePlaced;

  // If relocating, place instantly. If first time, go through construction.
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if ((x === tileX || x === tileX + 1) && (y === tileY || y === tileY + 1)) {
        if (isRelocation) {
          // Instant placement for relocation
          return {
            ...t,
            type: 'garage' as const,
          };
        } else {
          // Construction phase for first-time placement
          return {
            ...t,
            isConstructing: true,
            constructionTarget: 'garage' as const,
            constructionStartTime: state.gameTime,
            constructionDuration: CONSTRUCTION_DURATIONS.garage,
          };
        }
      }
      return t;
    })
  );

  return {
    ...state,
    zones: {
      ...state.zones,
      [getZoneKey(state.currentZone.x, state.currentZone.y)]: {
        ...state.zones[getZoneKey(state.currentZone.x, state.currentZone.y)],
        grid: newGrid,
      },
    },
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        garagePlaced: true,
      },
    },
  };
}

export function relocateGarage(state: GameState): GameState {
  const grid = getCurrentGrid(state);

  // Find and remove the current garage
  const newGrid = grid.map(row =>
    row.map(tile => {
      if (tile.type === 'garage') {
        return {
          ...tile,
          type: 'grass' as const,
          cleared: true,
        };
      }
      return tile;
    })
  );

  return {
    ...state,
    zones: {
      ...state.zones,
      [getZoneKey(state.currentZone.x, state.currentZone.y)]: {
        ...state.zones[getZoneKey(state.currentZone.x, state.currentZone.y)],
        grid: newGrid,
      },
    },
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        garagePlaced: false,
      },
    },
  };
}

export function relocateWell(state: GameState): GameState {
  const grid = getCurrentGrid(state);

  // Find and remove the current well
  const newGrid = grid.map(row =>
    row.map(tile => {
      if (tile.type === 'well') {
        return {
          ...tile,
          type: 'grass' as const,
          cleared: true,
        };
      }
      return tile;
    })
  );

  return {
    ...state,
    zones: {
      ...state.zones,
      [getZoneKey(state.currentZone.x, state.currentZone.y)]: {
        ...state.zones[getZoneKey(state.currentZone.x, state.currentZone.y)],
        grid: newGrid,
      },
    },
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        wellPlaced: false,
      },
    },
  };
}

export function relocateSupercharger(state: GameState): GameState {
  const grid = getCurrentGrid(state);

  // Find and remove the current supercharger
  const newGrid = grid.map(row =>
    row.map(tile => {
      if (tile.type === 'supercharger') {
        return {
          ...tile,
          type: 'grass' as const,
          cleared: true,
        };
      }
      return tile;
    })
  );

  return {
    ...state,
    zones: {
      ...state.zones,
      [getZoneKey(state.currentZone.x, state.currentZone.y)]: {
        ...state.zones[getZoneKey(state.currentZone.x, state.currentZone.y)],
        grid: newGrid,
      },
    },
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        superchargerPlaced: false,
      },
    },
  };
}

export function buySupercharger(state: GameState): GameState {
  // Check if player can afford it
  if (state.player.money < SUPERCHARGER_COST) return state;

  // Check if player already has a supercharger
  if (state.player.inventory.supercharger >= 1) return state;

  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - SUPERCHARGER_COST,
      inventory: {
        ...state.player.inventory,
        supercharger: 1,
      },
    },
  };
}

export function placeSupercharger(state: GameState, tileX: number, tileY: number): GameState {
  const grid = getCurrentGrid(state);

  // Check bounds for 2x2 placement
  if (tileX + 1 >= GAME_CONFIG.gridWidth || tileY + 1 >= GAME_CONFIG.gridHeight) {
    return state; // Not enough space
  }

  // Check that all 4 tiles are cleared grass/dirt
  const tiles = [
    grid[tileY]?.[tileX],
    grid[tileY]?.[tileX + 1],
    grid[tileY + 1]?.[tileX],
    grid[tileY + 1]?.[tileX + 1],
  ];

  const allTilesValid = tiles.every(t =>
    t && t.cleared && (t.type === 'grass' || t.type === 'dirt')
  );

  if (!allTilesValid || state.player.inventory.supercharger <= 0) {
    return state;
  }

  // Check if this is a relocation (building already placed elsewhere)
  const isRelocation = state.player.inventory.superchargerPlaced;

  // If relocating, place instantly. If first time, go through construction.
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if ((x === tileX || x === tileX + 1) && (y === tileY || y === tileY + 1)) {
        if (isRelocation) {
          // Instant placement for relocation
          return {
            ...t,
            type: 'supercharger' as const,
          };
        } else {
          // Construction phase for first-time placement
          return {
            ...t,
            isConstructing: true,
            constructionTarget: 'supercharger' as const,
            constructionStartTime: state.gameTime,
            constructionDuration: CONSTRUCTION_DURATIONS.supercharger,
          };
        }
      }
      return t;
    })
  );

  return {
    ...state,
    zones: {
      ...state.zones,
      [getZoneKey(state.currentZone.x, state.currentZone.y)]: {
        ...state.zones[getZoneKey(state.currentZone.x, state.currentZone.y)],
        grid: newGrid,
      },
    },
    player: {
      ...state.player,
      inventory: {
        ...state.player.inventory,
        superchargerPlaced: true,
      },
    },
  };
}

/**
 * Checks all tiles in all zones for completed constructions and converts them to final buildings
 */
function checkConstructionCompletion(state: GameState): GameState {
  let newState = { ...state };

  // Iterate through all zones
  Object.keys(newState.zones).forEach(zoneKey => {
    const zone = newState.zones[zoneKey];
    let gridChanged = false;

    const newGrid = zone.grid.map(row =>
      row.map(tile => {
        // Check if this tile is constructing and construction is complete
        if (
          tile.isConstructing &&
          tile.constructionStartTime !== undefined &&
          tile.constructionDuration !== undefined &&
          tile.constructionTarget
        ) {
          const elapsedTime = newState.gameTime - tile.constructionStartTime;

          if (elapsedTime >= tile.constructionDuration) {
            // Construction complete! Convert to final building type
            gridChanged = true;
            return {
              ...tile,
              type: tile.constructionTarget,
              isConstructing: false,
              constructionTarget: undefined,
              constructionStartTime: undefined,
              constructionDuration: undefined,
            };
          }
        }
        return tile;
      })
    );

    if (gridChanged) {
      newState.zones[zoneKey] = {
        ...zone,
        grid: newGrid,
      };
    }
  });

  return newState;
}

export function superchargeBot(state: GameState, botId: string, botType: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish'): GameState {
  // Check if player can afford it
  if (state.player.money < SUPERCHARGE_BOT_COST) return state;

  let updated = false;

  // Get the current zone
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

  if (!currentZone) return state;

  // Find and supercharge the specific bot in the current zone
  let updatedZone = { ...currentZone };

  if (botType === 'water' && updatedZone.waterBots) {
    updatedZone.waterBots = updatedZone.waterBots.map(bot => {
      if (bot.id === botId && !bot.supercharged) {
        updated = true;
        return { ...bot, supercharged: true };
      }
      return bot;
    });
  } else if (botType === 'harvest' && updatedZone.harvestBots) {
    updatedZone.harvestBots = updatedZone.harvestBots.map(bot => {
      if (bot.id === botId && !bot.supercharged) {
        updated = true;
        return { ...bot, supercharged: true };
      }
      return bot;
    });
  } else if (botType === 'seed' && updatedZone.seedBots) {
    updatedZone.seedBots = updatedZone.seedBots.map(bot => {
      if (bot.id === botId && !bot.supercharged) {
        updated = true;
        return { ...bot, supercharged: true };
      }
      return bot;
    });
  } else if (botType === 'transport' && updatedZone.transportBots) {
    updatedZone.transportBots = updatedZone.transportBots.map(bot => {
      if (bot.id === botId && !bot.supercharged) {
        updated = true;
        return { ...bot, supercharged: true };
      }
      return bot;
    });
  } else if (botType === 'demolish' && updatedZone.demolishBots) {
    updatedZone.demolishBots = updatedZone.demolishBots.map(bot => {
      if (bot.id === botId && !bot.supercharged) {
        updated = true;
        return { ...bot, supercharged: true };
      }
      return bot;
    });
  }

  // Only deduct money if a bot was actually supercharged
  if (updated) {
    return {
      ...state,
      zones: {
        ...state.zones,
        [currentZoneKey]: updatedZone,
      },
      player: {
        ...state.player,
        money: state.player.money - SUPERCHARGE_BOT_COST,
      },
    };
  }

  return state;
}

// Handle place_well task in task execution
function handlePlaceWellTask(state: GameState, task: Task): GameState {
  return placeWell(state, task.tileX, task.tileY);
}



/**
 * Migrate old 1x1 buildings to 2x2 by expanding them if there's space
 * This ensures backward compatibility with old save files
 */
// REMOVED: migrateBuildingsTo2x2 function was corrupting properly-placed buildings
// It was deleting building tiles during load, causing the cascade corruption bug
