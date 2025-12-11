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
  | 'mechanic'
  | 'well'
  | 'garage'
  | 'supercharger'
  | 'ocean'
  | 'sand'
  | 'seaweed'
  | 'shells'
  | 'cactus'
  | 'rocks'
  | 'cave'
  | 'mountain';

export type CropType = 'carrot' | 'wheat' | 'tomato' | 'pumpkin' | 'watermelon' | 'peppers' | 'grapes' | 'oranges' | 'avocado' | 'rice' | 'corn' | null;

export type ToolType = 'hoe' | 'seed_bag' | 'watering_can' | 'water_sprinkler' | 'scythe';

export type TaskType = 'clear' | 'plant' | 'water' | 'harvest' | 'place_sprinkler' | 'place_mechanic' | 'place_well' | 'place_garage' | 'place_supercharger' | 'deposit';

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
  isConstructing?: boolean; // Whether this tile is currently under construction
  constructionTarget?: TileType; // What building type it will become
  constructionStartTime?: number; // Game time when construction started
  constructionDuration?: number; // How long construction takes (ms)
  lastWorkedTime?: number; // Game time when tile was last cleared/planted/harvested
  overgrowthTime?: number; // Game time when tile will overgrow (randomized 3-5 min)
  variant?: number; // Visual variant for rocks (1-3) and trees/forest (1-2)
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
    seedbots: number; // How many seed bots the player owns
    transportbots: number; // How many transport bots the player owns
    demolishbots: number; // How many demolish bots the player owns
    mechanicShop: number; // How many mechanic shops the player owns (max 1)
    mechanicShopPlaced: boolean; // Whether the mechanic shop has been placed
    well: number; // How many wells the player owns (max 1 per zone)
    wellPlaced: boolean; // Whether a well has been placed in current zone
    garage: number; // How many garages the player owns
    garagePlaced: boolean; // Whether a garage has been placed in current zone
    supercharger: number; // How many superchargers the player owns (max 1)
    superchargerPlaced: boolean; // Whether a supercharger has been placed
  };
  autoBuy: {
    carrot: boolean;
    wheat: boolean;
    tomato: boolean;
    pumpkin: boolean;
    watermelon: boolean;
    peppers: boolean;
    grapes: boolean;
    oranges: boolean;
    avocado: boolean;
    rice: boolean;
    corn: boolean;
  };
  farmerAuto: {
    autoPlant: boolean;
    autoPlantCrop: Exclude<CropType, null>; // Which crop to auto-plant
    autoWater: boolean;
    autoHarvest: boolean;
    autoSell: boolean;
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

export interface ZoneNPC {
  name: string; // NPC name (e.g., "Sally Surfer")
  description: string; // What they do
  image: string; // Path to NPC image
  shopType?: 'fishing' | 'mining' | 'dairy' | 'explorer'; // What kind of shop/service they offer
}

export interface ZoneFeature {
  name: string; // Feature name (e.g., "Fishing Robots")
  description: string; // What this feature does
  icon: string; // Emoji or icon
  unlocked: boolean; // Whether player has unlocked this feature
}

export interface Zone {
  x: number; // Zone coordinate (0,0 is starting zone)
  y: number;
  grid: Tile[][];
  owned: boolean; // Whether player owns this zone
  purchasePrice: number; // Cost to buy this zone
  theme: ZoneTheme; // Visual theme of the zone
  name: string; // Display name
  description: string; // Description shown when previewing
  npc?: ZoneNPC; // Zone-specific NPC (if any)
  features: ZoneFeature[]; // Zone-specific features/activities
  waterBots: WaterBot[];
  harvestBots: HarvestBot[];
  seedBots: SeedBot[];
  transportBots: TransportBot[];
  demolishBots: DemolishBot[];
  taskQueue: Task[]; // Queue of tasks for worker in this zone
  currentTask: Task | null; // Task currently being executed in this zone
}

export interface WaterBot {
  id: string; // Unique bot ID
  waterLevel: number; // Current water (0-10)
  status: 'idle' | 'watering' | 'refilling' | 'traveling' | 'garaged';
  targetX?: number; // Target tile X
  targetY?: number; // Target tile Y
  x?: number; // Current tile position X
  y?: number; // Current tile position Y
  visualX?: number; // Animated visual position X
  visualY?: number; // Animated visual position Y
  idleStartTime?: number; // Game time when bot became idle at garage (for despawning)
  actionStartTime?: number; // Game time when current action started
  actionDuration?: number; // How long the action takes (ms)
  supercharged?: boolean; // Whether bot has been supercharged (200% speed)
}

export interface HarvestBot {
  id: string; // Unique bot ID
  inventory: BasketItem[]; // Crops currently held (max 8)
  inventoryCapacity: number; // Max inventory size (8)
  status: 'idle' | 'harvesting' | 'depositing' | 'traveling' | 'garaged';
  targetX?: number; // Target tile X
  targetY?: number; // Target tile Y
  x?: number; // Current tile position X
  y?: number; // Current tile position Y
  visualX?: number; // Animated visual position X
  visualY?: number; // Animated visual position Y
  idleStartTime?: number; // Game time when bot became idle with inventory
  actionStartTime?: number; // Game time when current action started
  actionDuration?: number; // How long the action takes (ms)
  lastHarvestedIndex?: number; // Round-robin index for even crop distribution
  supercharged?: boolean; // Whether bot has been supercharged (200% speed)
}

export interface SeedBotJob {
  id: string; // Unique job ID
  cropType: Exclude<CropType, null>; // What crop to plant
  targetTiles: Array<{ x: number; y: number }>; // Tiles to plant (max 20)
  maxTiles: number; // Maximum tiles for this job (20)
}

export interface SeedBot {
  id: string; // Unique bot ID
  jobs: SeedBotJob[]; // Up to 3 jobs (60 total tiles)
  status: 'idle' | 'planting' | 'traveling' | 'garaged';
  currentJobId?: string; // Which job is currently being worked on
  targetX?: number; // Target tile X
  targetY?: number; // Target tile Y
  x?: number; // Current tile position X
  y?: number; // Current tile position Y
  visualX?: number; // Animated visual position X
  visualY?: number; // Animated visual position Y
  autoBuySeeds: boolean; // Whether to auto-buy seeds when low
  actionStartTime?: number; // Game time when current action started
  actionDuration?: number; // How long the action takes (ms)
  supercharged?: boolean; // Whether bot has been supercharged (200% speed)
}

export interface TransportBot {
  id: string; // Unique bot ID
  inventory: BasketItem[]; // Crops currently being transported (max 16)
  inventoryCapacity: number; // Max inventory size (16)
  status: 'idle' | 'loading' | 'transporting' | 'selling' | 'traveling' | 'garaged';
  targetX?: number; // Target tile X
  targetY?: number; // Target tile Y
  x?: number; // Current tile position X
  y?: number; // Current tile position Y
  visualX?: number; // Animated visual position X
  visualY?: number; // Animated visual position Y
  actionStartTime?: number; // Game time when current action started
  actionDuration?: number; // How long the action takes (ms)
  supercharged?: boolean; // Whether bot has been supercharged (200% speed)
}

export interface DemolishBot {
  id: string; // Unique bot ID
  status: 'idle' | 'clearing' | 'traveling' | 'garaged';
  targetX?: number; // Target tile X
  targetY?: number; // Target tile Y
  x?: number; // Current tile position X
  y?: number; // Current tile position Y
  visualX?: number; // Animated visual position X
  visualY?: number; // Animated visual position Y
  actionStartTime?: number; // Game time when current action started
  actionDuration?: number; // How long the action takes (ms)
  supercharged?: boolean; // Whether bot has been supercharged (200% speed)
}

export interface ZoneEarnings {
  zoneKey: string; // "x,y" identifier
  zoneName: string; // Display name
  totalEarnings: number; // All-time earnings from this zone
  earningsHistory: Array<{ timestamp: number; amount: number }>; // Last 20 sales
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface PriceSnapshot {
  timestamp: number; // Game time when price was recorded
  day: number; // Game day number
  prices: Record<Exclude<CropType, null>, number>; // Sell prices at this time
}

export interface MarketData {
  priceHistory: PriceSnapshot[]; // Historical price data (last 30 snapshots)
  priceForecast: PriceSnapshot[]; // Predicted future prices (10 cycles ahead)
  currentPrices: Record<Exclude<CropType, null>, number>; // Current market sell prices
  priceMultipliers: Record<Exclude<CropType, null>, number>; // Current price multiplier from base (0.7-1.5)
  lastUpdateDay: number; // Last day prices were updated
  lastForecastTime: number; // Game time when forecast was last generated
  currentSeason: Season; // Current season
  highDemandCrops: Array<Exclude<CropType, null>>; // Crops in high demand this season
  epicPriceCrop: Exclude<CropType, null> | null; // Crop currently experiencing epic 5x price event
  epicPriceEndTime: number; // Game time when epic price event ends
}

export interface SaleRecord {
  timestamp: number; // Game time when sale occurred
  day: number; // Game day number
  crop: Exclude<CropType, null>; // Crop type sold
  quantity: number; // How many sold
  pricePerUnit: number; // Price per unit at time of sale
  totalRevenue: number; // Total money earned
  zoneKey?: string; // Which zone the crop was from (if tracked)
}

export interface GameState {
  zones: Record<string, Zone>; // Key is "x,y"
  currentZone: { x: number; y: number }; // Which zone player is viewing
  player: Player;
  tools: Tool[];
  currentDay: number; // Day counter
  dayProgress: number; // 0-100, progress through current day
  gameTime: number;
  isPaused: boolean;
  warehouse: BasketItem[]; // Warehouse storage for deposited crops
  waterBots?: WaterBot[]; // Water bots in the game
  harvestBots?: HarvestBot[]; // Harvest bots in the game
  seedBots?: SeedBot[]; // Seed bots in the game
  transportBots?: TransportBot[]; // Transport bots in the game
  demolishBots?: DemolishBot[]; // Demolish bots in the game
  saveCode?: string; // Persistent save code for this game
  cropsSold: Record<Exclude<CropType, null>, number>; // Track how many of each crop has been sold for price progression
  zoneEarnings?: Record<string, ZoneEarnings>; // Track earnings by zone (key is "x,y")
  market?: MarketData; // Dynamic market pricing and seasonal demand
  salesHistory?: SaleRecord[]; // Detailed history of all sales (last 100 transactions)
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
}
