// Game types for Aaron and Chelsea's Farm

export type TileType =
  | 'grass'
  | 'dirt'
  | 'rock'
  | 'tree'
  | 'planted'
  | 'grown'
  | 'shop'
  | 'export'
  | 'warehouse'
  | 'waterbot'
  | 'arch'
  | 'mechanic';

export type CropType = 'carrot' | 'wheat' | 'tomato' | null;

export type ToolType = 'hoe' | 'seed_bag' | 'watering_can' | 'water_sprinkler' | 'scythe';

export type TaskType = 'clear' | 'plant' | 'water' | 'harvest' | 'place_sprinkler' | 'place_mechanic';

export interface Task {
  id: string;
  type: TaskType;
  tileX: number;
  tileY: number;
  zoneX: number;
  zoneY: number;
  cropType?: CropType; // For planting tasks
  progress: number; // 0-100
  duration: number; // milliseconds
}

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  crop: CropType;
  growthStage: number; // 0-100
  cleared: boolean;
  plantedDay?: number; // DEPRECATED: Which day the crop was planted
  wateredTimestamp?: number; // Game time when first watered (triggers growth)
  wateredToday: boolean; // Whether this tile has been watered today
  hasSprinkler: boolean; // Whether this tile has a sprinkler placed on it
  archDirection?: 'north' | 'south' | 'east' | 'west'; // Direction this arch leads to
  archTargetZone?: { x: number; y: number }; // Target zone coordinates
}

export interface SeedQuality {
  generation: number; // Higher = better seeds
  yield: number; // Multiplier for harvest value
  growthSpeed: number; // Multiplier for growth speed
}

export interface BasketItem {
  crop: Exclude<CropType, null>;
  quality: SeedQuality;
}

export interface Player {
  x: number;
  y: number;
  visualX?: number; // Animated visual position
  visualY?: number; // Animated visual position
  money: number;
  farmName: string; // Name of the farm
  selectedTool: ToolType;
  selectedCrop: CropType;
  basket: BasketItem[]; // Max 8 items
  basketCapacity: number; // Max basket size (upgradeable)
  bagUpgrades: number; // Number of bag upgrades purchased (0-3)
  inventory: {
    seeds: Record<Exclude<CropType, null>, number> & { null: number };
    seedQuality: Record<Exclude<CropType, null>, SeedQuality> & { null: SeedQuality };
    sprinklers: number; // How many sprinklers the player owns
    waterbots: number; // How many water bots the player owns
    harvestbots: number; // How many harvest bots the player owns
    mechanicShop: number; // How many mechanic shops the player owns (max 1)
    mechanicShopPlaced: boolean; // Whether the mechanic shop has been placed
  };
  autoBuy: {
    carrot: boolean;
    wheat: boolean;
    tomato: boolean;
  };
}

export interface CropGrowthInfo {
  daysToGrow: number; // DEPRECATED: kept for compatibility
  growTime: number; // Milliseconds to fully grow after watering
  sellPrice: number; // How much you can sell it for
  seedCost: number; // How much seeds cost in shop
}

export interface Tool {
  name: ToolType;
  cost: number;
  description: string;
  unlocked: boolean;
}

export type ZoneTheme = 'farm' | 'beach' | 'barn' | 'mountain' | 'desert';

export interface Zone {
  x: number; // Zone coordinate (0,0 is starting zone)
  y: number;
  grid: Tile[][];
  owned: boolean; // Whether player owns this zone
  purchasePrice: number; // Cost to buy this zone
  theme: ZoneTheme; // Visual theme of the zone
  name: string; // Display name
  description: string; // Description shown when previewing
}

export interface GameState {
  zones: Record<string, Zone>; // Key is "x,y"
  currentZone: { x: number; y: number }; // Which zone player is viewing
  player: Player;
  tools: Tool[];
  taskQueue: Task[]; // Queue of tasks for worker to complete
  currentTask: Task | null; // Task currently being executed
  currentDay: number; // Day counter
  dayProgress: number; // 0-100, progress through current day
  gameTime: number;
  isPaused: boolean;
  warehouse: BasketItem[]; // Warehouse storage for deposited crops
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
}
