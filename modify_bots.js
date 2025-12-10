const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/gameEngine.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Modification 1: buyWaterbots
const buyWaterbotsOld = `export function buyWaterbots(state: GameState, amount: number): GameState {
  const cost = WATERBOT_COST * amount;
  const MAX_WATERBOTS = 2;

  // Check if player can afford it
  if (state.player.money < cost) return state;

  // Check if player has reached max capacity
  if (state.player.inventory.waterbots >= MAX_WATERBOTS) return state;

  // Limit purchase to not exceed max capacity
  const actualAmount = Math.min(amount, MAX_WATERBOTS - state.player.inventory.waterbots);
  const actualCost = WATERBOT_COST * actualAmount;

  // Create actual WaterBot entities
  const newBots: WaterBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = \`waterbot-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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

  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];`;

const buyWaterbotsNew = `export function buyWaterbots(state: GameState, amount: number): GameState {
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
    const botId = \`waterbot-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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
  }`;

content = content.replace(buyWaterbotsOld, buyWaterbotsNew);

// Modification 2: buyHarvestbots
const buyHarvestbotsOld = `export function buyHarvestbots(state: GameState, amount: number): GameState {
  const cost = HARVESTBOT_COST * amount;

  // Check if player can afford it
  if (state.player.money < cost) return state;

  const actualAmount = amount;
  const actualCost = HARVESTBOT_COST * actualAmount;

  // Create actual HarvestBot entities
  const newBots: import('@/types/game').HarvestBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = \`harvestbot-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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

  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];`;

const buyHarvestbotsNew = `export function buyHarvestbots(state: GameState, amount: number): GameState {
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
    const botId = \`harvestbot-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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
  }`;

content = content.replace(buyHarvestbotsOld, buyHarvestbotsNew);

// Modification 3: buySeedbots
const buySeedbotsOld = `export function buySeedbots(state: GameState, amount: number): GameState {
  const cost = SEEDBOT_COST * amount;

  // Check if player can afford it
  if (state.player.money < cost) return state;

  const actualAmount = amount;
  const actualCost = SEEDBOT_COST * actualAmount;

  // Create actual SeedBot entities
  const newBots: import('@/types/game').SeedBot[] = [];
  for (let i = 0; i < actualAmount; i++) {
    const botId = \`seedbot-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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

  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];`;

const buySeedbotsNew = `export function buySeedbots(state: GameState, amount: number): GameState {
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
    const botId = \`seedbot-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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
  }`;

content = content.replace(buySeedbotsOld, buySeedbotsNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully modified all three bot purchase functions!');
