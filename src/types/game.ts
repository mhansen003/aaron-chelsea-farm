// Game types for Aaron and Chelsea's Farm

export type TileType =
  | 'grass'
  | 'dirt'
  | 'rock'
  | 'tree'
  | 'planted'
  | 'grown';

export type CropType = 'carrot' | 'wheat' | 'tomato' | null;

export type ToolType = 'hoe' | 'watering_can' | 'scythe' | 'auto_harvester';

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  crop: CropType;
  growthStage: number; // 0-100
  cleared: boolean;
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
  selectedTool: ToolType | null;
  inventory: {
    seeds: Record<Exclude<CropType, null>, number> & { null: number };
    harvested: Record<Exclude<CropType, null>, number> & { null: number };
    seedQuality: Record<Exclude<CropType, null>, SeedQuality> & { null: SeedQuality };
  };
}

export interface Community {
  people: number;
  hunger: number; // 0-100, decreases over time
  happiness: number; // 0-100, affected by diet diversity
  dietaryNeeds: {
    carrot: number; // How much of each crop type they need
    wheat: number;
    tomato: number;
  };
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
  community: Community;
  gameTime: number;
  isPaused: boolean;
  lastFeedTime: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
}
