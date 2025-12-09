// Game types for Aaron and Chelsea's Farm

export type TileType =
  | 'grass'
  | 'dirt'
  | 'rock'
  | 'tree'
  | 'planted'
  | 'grown'
  | 'shop'
  | 'waterbot';

export type CropType = 'carrot' | 'wheat' | 'tomato' | null;

export type ToolType = 'hoe' | 'seed_bag' | 'watering_can' | 'water_sprinkler' | 'scythe';

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  crop: CropType;
  growthStage: number; // 0-100
  cleared: boolean;
  plantedDay?: number; // Which day the crop was planted
  wateredToday: boolean; // Whether this tile has been watered today
  hasSprinkler: boolean; // Whether this tile has a sprinkler placed on it
}

export interface SeedQuality {
  generation: number; // Higher = better seeds
  yield: number; // Multiplier for harvest value
  growthSpeed: number; // Multiplier for growth speed
}

export interface Player {
  x: number;
  y: number;
  money: number;
  selectedTool: ToolType;
  selectedCrop: CropType;
  inventory: {
    seeds: Record<Exclude<CropType, null>, number> & { null: number };
    harvested: Record<Exclude<CropType, null>, number> & { null: number };
    seedQuality: Record<Exclude<CropType, null>, SeedQuality> & { null: SeedQuality };
    sprinklers: number; // How many sprinklers the player owns
    waterbots: number; // How many water bots the player owns
  };
}

export interface CropGrowthInfo {
  daysToGrow: number; // How many days it takes to fully grow
  sellPrice: number; // How much you can sell it for
  seedCost: number; // How much seeds cost in shop
}

export interface Tool {
  name: ToolType;
  cost: number;
  description: string;
  unlocked: boolean;
}

export interface GameState {
  grid: Tile[][];
  player: Player;
  tools: Tool[];
  currentDay: number; // Day counter
  dayProgress: number; // 0-100, progress through current day
  gameTime: number;
  isPaused: boolean;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
}
