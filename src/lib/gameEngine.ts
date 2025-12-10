// Game engine for Aaron and Chelsea's Farm
import { GameState, GameConfig, Tile, TileType, CropType, CropGrowthInfo, Zone, WaterBot, Task } from '@/types/game';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 16,
  gridHeight: 12,
  tileSize: 90, // Increased from 72 to fill header width (16 * 90 = 1440px)
};

// Crop information: growth time (ms), sell price, seed cost
export const CROP_INFO: Record<Exclude<CropType, null>, CropGrowthInfo> & { null: CropGrowthInfo } = {
  carrot: { daysToGrow: 1, growTime: 30000, sellPrice: 5, seedCost: 2 }, // 30 seconds
  wheat: { daysToGrow: 1, growTime: 45000, sellPrice: 3, seedCost: 1 }, // 45 seconds
  tomato: { daysToGrow: 2, growTime: 90000, sellPrice: 8, seedCost: 4 }, // 90 seconds
  null: { daysToGrow: 0, growTime: 0, sellPrice: 0, seedCost: 0 },
};

export const DAY_LENGTH = 60000; // 60 seconds = 1 day
export const SPRINKLER_COST = 100; // Cost to buy one sprinkler
export const SPRINKLER_RANGE = 3; // 7x7 area (3 tiles in each direction)
export const WATERBOT_COST = 150; // Cost to buy one water bot
export const WATERBOT_RANGE = 3; // 7x7 area (3 tiles in each direction)
export const WATERBOT_MAX_WATER = 10; // Maximum water a bot can hold
export const HARVESTBOT_COST = 200; // Cost to buy one harvest bot
export const SEEDBOT_COST = 250; // Cost to buy one seed bot
export const BAG_UPGRADE_COSTS = [150, 300, 500]; // Costs for basket upgrades (tier 1, 2, 3)
export const BAG_UPGRADE_CAPACITY = 4; // Capacity increase per upgrade
export const MAX_BAG_UPGRADES = 3; // Maximum number of upgrades
export const MECHANIC_SHOP_COST = 250; // Cost to buy the mechanic shop
export const WELL_COST = 100; // Cost to buy a well
export const BASE_ZONE_PRICE = 500; // Base price for first adjacent zone
export const ZONE_PRICE_MULTIPLIER = 1.5; // Each zone costs 50% more
export const MOVE_SPEED = 0.008; // Movement interpolation speed (0-1, higher = faster)

// Task durations in milliseconds
export const TASK_DURATIONS = {
  clear: 10000, // 10 seconds to clear rocks/trees
  plant: 2000, // 2 seconds to plant
  water: 1000, // 1 second to water
  harvest: 2000, // 2 seconds to harvest
  place_sprinkler: 3000, // 3 seconds to place sprinkler
  place_mechanic: 60000, // 1 minute to install mechanic shop
  place_well: 30000, // 30 seconds to dig/place well
  deposit: 3000, // 3 seconds to deposit crops at warehouse
};

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
        // Mountain: dirt/rocky terrain with caves and mountains
        type = 'dirt';
        const rand = Math.random();
        if (rand < 0.20) type = 'mountain'; // 20% mountain formations
        else if (rand < 0.35) type = 'cave'; // 15% caves
        else if (rand < 0.50) type = 'rocks'; // 15% rocks
      }
      // Shop building at top-left corner (2x2) of starting zone only
      else if (isStartingZone && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        type = 'shop';
      }
      // Export building at top-right corner (2x2) of starting zone only
      else if (isStartingZone && x >= GAME_CONFIG.gridWidth - 2 && x <= GAME_CONFIG.gridWidth - 1 && y >= 0 && y <= 1) {
        type = 'export';
      }
      // Warehouse building (2x2) to the left of export building
      else if (isStartingZone && x >= GAME_CONFIG.gridWidth - 4 && x <= GAME_CONFIG.gridWidth - 3 && y >= 0 && y <= 1) {
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
        if (rand < 0.30) type = 'rock'; // 30% rocks
        else if (rand < 0.50) type = 'tree'; // 20% trees
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
      });
    }
    grid.push(row);
  }

  return grid;
}

export function createZone(x: number, y: number, owned: boolean): Zone {
  const distanceFromStart = Math.abs(x) + Math.abs(y);
  const purchasePrice = Math.floor(BASE_ZONE_PRICE * Math.pow(ZONE_PRICE_MULTIPLIER, distanceFromStart - 1));

  // Determine theme based on position relative to starting zone
  let theme: import('@/types/game').ZoneTheme = 'farm';
  let name = "Aaron & Chelsea's Farm";
  let description = "Your home farm with rich soil perfect for growing crops.";

  if (x === 0 && y === 1) {
    // North - Beach
    theme = 'beach';
    name = "Sunny Beach";
    description = "A tropical paradise with sandy shores and palm trees. Perfect for fishing and relaxation!";
  } else if (x === -1 && y === 0) {
    // West - Barn
    theme = 'barn';
    name = "Animal Barn";
    description = "A cozy barn area where you can raise livestock and collect resources like milk, eggs, and wool.";
  } else if (x === 1 && y === 0) {
    // East - Mountain
    theme = 'mountain';
    name = "Mountain Range";
    description = "Rugged mountainous terrain rich with minerals and rare resources. Challenging but rewarding!";
  } else if (x === 0 && y === -1) {
    // South - Desert
    theme = 'desert';
    name = "Desert Oasis";
    description = "An arid desert landscape with unique cacti and valuable gems hidden beneath the sand.";
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
    waterBots: [],
    harvestBots: [],
    seedBots: [],
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
      bagUpgrades: 0, // No upgrades purchased yet
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
        seedbots: 0,
        mechanicShop: 0,
        mechanicShopPlaced: false,
        well: 0,
        wellPlaced: false,
      },
      autoBuy: {
        carrot: false,
        wheat: false,
        tomato: false,
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

    // If new day started, auto-water tiles with sprinklers and reset watered flags
    if (isNewDay) {
      newGrid = zone.grid.map((row, y) =>
        row.map((tile, x) => {
          // Check if any sprinkler is in range of this tile
          let wateredToday = false;
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

    // Update crop growth - time-based growth after watering
    newGrid = newGrid.map(row =>
      row.map(tile => {
        if (tile.type === 'planted' && tile.crop) {
          const cropInfo = CROP_INFO[tile.crop];

          // Start growth timer when first watered
          if (tile.wateredToday && !tile.wateredTimestamp) {
            return {
              ...tile,
              wateredTimestamp: newGameTime,
            };
          }

          // Calculate growth based on elapsed time since watering
          if (tile.wateredTimestamp !== undefined) {
            const timeSinceWatered = newGameTime - tile.wateredTimestamp;
            const quality = newState.player.inventory.seedQuality[tile.crop];
            const growthMultiplier = quality ? quality.growthSpeed : 1.0;
            const adjustedGrowTime = cropInfo.growTime / growthMultiplier;

            const growthPercentage = (timeSinceWatered / adjustedGrowTime) * 100;
            const newGrowthStage = Math.min(100, growthPercentage);

            // Once watered, crops continue growing without needing more water
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
          if (tile.type === 'planted' && tile.crop && !tile.wateredToday) {
            unwateredCrops.push({ x, y });
          }
        });
      });

      if (bot.waterLevel > 0 && unwateredCrops.length > 0) {
        let nearest = unwateredCrops[0];
        let minDist = Math.abs(botX - nearest.x) + Math.abs(botY - nearest.y);
        unwateredCrops.forEach(crop => {
          const dist = Math.abs(botX - crop.x) + Math.abs(botY - crop.y);
          if (dist < minDist) { minDist = dist; nearest = crop; }
        });

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const ACTION_DURATION = 1500;
          if (bot.actionStartTime !== undefined) {
            const elapsed = newGameTime - bot.actionStartTime;
            if (elapsed >= ACTION_DURATION) {
              updatedGrid = updatedGrid.map((row, rowY) =>
                row.map((tile, tileX) => {
                  if (tileX === nearest.x && rowY === nearest.y) {
                    return { ...tile, wateredToday: true, wateredTimestamp: tile.wateredTimestamp ?? newGameTime };
                  }
                  return tile;
                })
              );
              return { ...bot, waterLevel: bot.waterLevel - 1, status: 'watering' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
            } else {
              return { ...bot, status: 'watering' as const, visualX, visualY };
            }
          } else {
            return { ...bot, status: 'watering' as const, visualX, visualY, actionStartTime: newGameTime, actionDuration: ACTION_DURATION };
          }
        } else {
          let newX = botX, newY = botY;
          if (Math.random() < (deltaTime / 500)) {
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
          if (botX === well.x && botY === well.y) {
            return { ...bot, waterLevel: WATERBOT_MAX_WATER, status: 'refilling' as const, visualX, visualY };
          } else {
            let newX = botX, newY = botY;
            if (Math.random() < (deltaTime / 500)) {
              if (botX < well.x) newX++; else if (botX > well.x) newX--;
              else if (botY < well.y) newY++; else if (botY > well.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: well.x, targetY: well.y, visualX, visualY };
          }
        }
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

      const hasInventory = bot.inventory.length > 0;
      const noCropsAvailable = grownCrops.length === 0;
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
            if (botX === warehouse.x && botY === warehouse.y) {
              newState = { ...newState, warehouse: [...newState.warehouse, ...bot.inventory] };
              return { ...bot, inventory: [], idleStartTime: undefined, status: 'depositing' as const, visualX, visualY };
            } else {
              let newX = botX, newY = botY;
              if (Math.random() < (deltaTime / 500)) {
                if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
                else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
              }
              return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
            }
          }
        }
      } else {
        if (bot.idleStartTime) {
          return { ...bot, idleStartTime: undefined, visualX, visualY };
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
          if (botX === warehouse.x && botY === warehouse.y) {
            newState = { ...newState, warehouse: [...newState.warehouse, ...bot.inventory] };
            return { ...bot, inventory: [], idleStartTime: undefined, status: 'depositing' as const, visualX, visualY };
          } else {
            let newX = botX, newY = botY;
            if (Math.random() < (deltaTime / 500)) {
              if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
              else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
          }
        }
      }

      if (!isInventoryFull && grownCrops.length > 0) {
        let nearest = grownCrops[0];
        let minDist = Math.abs(botX - nearest.x) + Math.abs(botY - nearest.y);
        grownCrops.forEach(crop => {
          const dist = Math.abs(botX - crop.x) + Math.abs(botY - crop.y);
          if (dist < minDist) { minDist = dist; nearest = crop; }
        });

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const tile = updatedGrid[nearest.y]?.[nearest.x];
          if (tile && tile.type === 'grown' && tile.crop) {
            const ACTION_DURATION = 1500;

            if (bot.actionStartTime !== undefined) {
              const elapsed = newState.gameTime - bot.actionStartTime;
              if (elapsed >= ACTION_DURATION) {
                const cropType = tile.crop;
                const quality = newState.player.inventory.seedQuality[cropType];

                updatedGrid = updatedGrid.map((row, rowY) =>
                  row.map((t, tileX) => {
                    if (tileX === nearest.x && rowY === nearest.y) {
                      return { ...t, type: 'dirt' as import('@/types/game').TileType, crop: null, growthStage: 0, plantedDay: undefined };
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

                return { ...bot, inventory: [...bot.inventory, { crop: cropType, quality: improvedQuality }], status: 'harvesting' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
              } else {
                return { ...bot, status: 'harvesting' as const, visualX, visualY };
              }
            } else {
              return { ...bot, status: 'harvesting' as const, visualX, visualY, actionStartTime: newState.gameTime, actionDuration: ACTION_DURATION };
            }
          }
        } else {
          let newX = botX, newY = botY;
          if (Math.random() < (deltaTime / 500)) {
            if (botX < nearest.x) newX++; else if (botX > nearest.x) newX--;
            else if (botY < nearest.y) newY++; else if (botY > nearest.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: nearest.x, targetY: nearest.y, visualX, visualY };
        }
      } else {
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
        return tile && tile.type === 'dirt' && tile.cleared && !tile.crop && !tile.hasSprinkler;
      });

      if (plantableTiles.length === 0) {
        const currentJobIndex = bot.jobs.findIndex(j => j.id === currentJob?.id);
        const nextJobIndex = (currentJobIndex + 1) % bot.jobs.length;
        const nextJob = bot.jobs[nextJobIndex];

        const nextPlantableTiles = nextJob.targetTiles.filter(targetTile => {
          const tile = grid[targetTile.y]?.[targetTile.x];
          return tile && tile.type === 'dirt' && tile.cleared && !tile.crop && !tile.hasSprinkler;
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
        const seedCost = CROP_INFO[cropType].seedCost;
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
        return tile && tile.type === 'dirt' && tile.cleared && !tile.crop && !tile.hasSprinkler;
      });

      if (refreshedPlantableTiles.length > 0) {
        let nearest = refreshedPlantableTiles[0];
        let minDist = Math.abs(botX - nearest.x) + Math.abs(botY - nearest.y);
        refreshedPlantableTiles.forEach(tile => {
          const dist = Math.abs(botX - tile.x) + Math.abs(botY - tile.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = tile;
          }
        });

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const tile = updatedGrid[nearest.y]?.[nearest.x];
          if (tile && tile.type === 'dirt' && tile.cleared && !tile.crop) {
            const ACTION_DURATION = 1500;

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
          if (Math.random() < (deltaTime / 500)) {
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
          type: 'grass' as TileType,
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

export function checkAndAutoRefill(state: GameState): GameState {
  let newState = state;

  // Check each crop type
  const cropTypes: Array<Exclude<CropType, null>> = ['carrot', 'wheat', 'tomato'];

  for (const cropType of cropTypes) {
    // If auto-buy is enabled and seeds are at 0, buy 1 seed
    if (newState.player.autoBuy[cropType] && newState.player.inventory.seeds[cropType] === 0) {
      const cropInfo = CROP_INFO[cropType];
      const cost = cropInfo.seedCost;

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
  // Check current zone - limit to 1 water bot per zone
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];
  if (currentZone.waterBots.length >= 1) return state; // Already has a water bot in this zone

  const cost = WATERBOT_COST * amount;
  const MAX_WATERBOTS = 2;

  // Check if player can afford it
  if (state.player.money < cost) return state;

  // Check if player has reached max capacity
  if (state.player.inventory.waterbots >= MAX_WATERBOTS) return state;

  // Limit purchase to 1 bot per zone
  const actualAmount = 1;
  const actualCost = WATERBOT_COST * actualAmount;

  // Create actual WaterBot entities
  const newBots: WaterBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = `waterbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const spawnX = state.player.x + (i + 1);
    const spawnY = state.player.y;
    newBots.push({
      id: botId,
      waterLevel: WATERBOT_MAX_WATER, // Start with full water
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
  // Check current zone - limit to 1 harvest bot per zone
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];
  if (currentZone.harvestBots.length >= 1) return state; // Already has a harvest bot in this zone

  const cost = HARVESTBOT_COST * amount;

  // Check if player can afford it
  if (state.player.money < cost) return state;

  // Limit purchase to 1 bot per zone
  const actualAmount = 1;
  const actualCost = HARVESTBOT_COST * actualAmount;

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
  // Check current zone - limit to 1 seed bot per zone
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];
  if (currentZone.seedBots.length >= 1) return state; // Already has a seed bot in this zone

  const cost = SEEDBOT_COST * amount;

  // Check if player can afford it
  if (state.player.money < cost) return state;

  // Limit purchase to 1 bot per zone
  const actualAmount = 1;
  const actualCost = SEEDBOT_COST * actualAmount;

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
      autoBuySeeds: false, // Auto-buy seeds disabled by default
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
  const tile = grid[tileY]?.[tileX];

  // Can only place on cleared grass/dirt tiles (not rocks/trees), and must have one in inventory
  if (!tile || !tile.cleared || (tile.type !== 'grass' && tile.type !== 'dirt') || state.player.inventory.mechanicShop <= 0 || state.player.inventory.mechanicShopPlaced) {
    return state;
  }

  // Place mechanic shop instantly
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          type: 'mechanic' as const,
          isConstructing: false,
          constructionTarget: undefined,
          constructionStartTime: undefined,
          constructionDuration: undefined,
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

  return {
    ...state,
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        taskQueue: [...currentZone.taskQueue, task],
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

// Deposit all items from basket to warehouse
export function depositToWarehouse(state: GameState): GameState {
  return {
    ...state,
    warehouse: [...state.warehouse, ...state.player.basket],
    player: {
      ...state.player,
      basket: [], // Empty the basket
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
  const tile = grid[tileY]?.[tileX];

  // Can only place on cleared grass/dirt tiles (not rocks/trees), and must have one in inventory
  if (!tile || !tile.cleared || (tile.type !== 'grass' && tile.type !== 'dirt') || state.player.inventory.well <= 0 || state.player.inventory.wellPlaced) {
    return state;
  }

  // Place well instantly
  const newGrid = grid.map((row, y) =>
    row.map((t, x) => {
      if (x === tileX && y === tileY) {
        return {
          ...t,
          type: 'well' as const,
          isConstructing: false,
          constructionTarget: undefined,
          constructionStartTime: undefined,
          constructionDuration: undefined,
        };
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

// Handle place_well task in task execution
function handlePlaceWellTask(state: GameState, task: Task): GameState {
  return placeWell(state, task.tileX, task.tileY);
}
