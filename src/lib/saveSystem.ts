import { GameState } from '@/types/game';

interface SaveCodeHistory {
  code: string;
  timestamp: number;
  farmName: string;
}

/**
 * Saves game state to the server and returns a 6-digit code
 * This code works across all devices!
 */
export async function generateSaveCode(gameState: GameState, existingCode?: string): Promise<string> {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState, code: existingCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save game');
    }

    const { code } = await response.json();

    // Save code to history for easy recovery
    saveCodeToHistory(code, gameState.player.farmName);

    return code;
  } catch (error) {
    console.error('Failed to save game:', error);
    throw new Error('Failed to save game. Please try again.');
  }
}

/**
 * Loads game state from a 6-digit save code
 * Works from any device!
 */
export async function loadFromSaveCode(code: string): Promise<GameState> {
  try {
    const response = await fetch('/api/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid save code');
    }

    const { gameState } = await response.json();
    return migrateGameState(gameState);
  } catch (error) {
    console.error('Failed to load save code:', error);
    throw new Error('Invalid or expired save code');
  }
}

/**
 * Saves game state to localStorage as autosave (browser only)
 */
export function saveToLocalStorage(gameState: GameState): void {
  try {
    const jsonString = JSON.stringify(gameState);
    localStorage.setItem('farm_autosave', jsonString);
    localStorage.setItem('farm_autosave_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Failed to autosave:', error);
  }
}

/**
 * Migrates old save data to ensure it has all required properties
 */
function migrateGameState(gameState: any): GameState {
  // Initialize cropsSold if it doesn't exist (backward compatibility)
  if (!gameState.cropsSold) {
    gameState.cropsSold = {
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
    };
  } else {
    // Add missing crops to existing cropsSold (for saves before new crops were added)
    if (gameState.cropsSold.peppers === undefined) gameState.cropsSold.peppers = 0;
    if (gameState.cropsSold.grapes === undefined) gameState.cropsSold.grapes = 0;
    if (gameState.cropsSold.oranges === undefined) gameState.cropsSold.oranges = 0;
    if (gameState.cropsSold.avocado === undefined) gameState.cropsSold.avocado = 0;
    if (gameState.cropsSold.rice === undefined) gameState.cropsSold.rice = 0;
    if (gameState.cropsSold.corn === undefined) gameState.cropsSold.corn = 0;
  }

  // Initialize or migrate player.inventory.seeds for new crops
  if (gameState.player?.inventory?.seeds) {
    if (gameState.player.inventory.seeds.peppers === undefined) gameState.player.inventory.seeds.peppers = 0;
    if (gameState.player.inventory.seeds.grapes === undefined) gameState.player.inventory.seeds.grapes = 0;
    if (gameState.player.inventory.seeds.oranges === undefined) gameState.player.inventory.seeds.oranges = 0;
    if (gameState.player.inventory.seeds.avocado === undefined) gameState.player.inventory.seeds.avocado = 0;
    if (gameState.player.inventory.seeds.rice === undefined) gameState.player.inventory.seeds.rice = 0;
    if (gameState.player.inventory.seeds.corn === undefined) gameState.player.inventory.seeds.corn = 0;
  }

  // Initialize or migrate player.inventory.seedQuality for new crops
  if (gameState.player?.inventory?.seedQuality) {
    const defaultQuality = { generation: 1, yield: 1.0, growthSpeed: 1.0 };
    if (gameState.player.inventory.seedQuality.peppers === undefined) gameState.player.inventory.seedQuality.peppers = defaultQuality;
    if (gameState.player.inventory.seedQuality.grapes === undefined) gameState.player.inventory.seedQuality.grapes = defaultQuality;
    if (gameState.player.inventory.seedQuality.oranges === undefined) gameState.player.inventory.seedQuality.oranges = defaultQuality;
    if (gameState.player.inventory.seedQuality.avocado === undefined) gameState.player.inventory.seedQuality.avocado = defaultQuality;
    if (gameState.player.inventory.seedQuality.rice === undefined) gameState.player.inventory.seedQuality.rice = defaultQuality;
    if (gameState.player.inventory.seedQuality.corn === undefined) gameState.player.inventory.seedQuality.corn = defaultQuality;
  }

  // Initialize autoBuy if it doesn't exist
  if (!gameState.player.autoBuy) {
    gameState.player.autoBuy = {
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
    };
  } else {
    // Add missing crops to existing autoBuy
    if (gameState.player.autoBuy.peppers === undefined) gameState.player.autoBuy.peppers = true;
    if (gameState.player.autoBuy.grapes === undefined) gameState.player.autoBuy.grapes = true;
    if (gameState.player.autoBuy.oranges === undefined) gameState.player.autoBuy.oranges = true;
    if (gameState.player.autoBuy.avocado === undefined) gameState.player.autoBuy.avocado = true;
    if (gameState.player.autoBuy.rice === undefined) gameState.player.autoBuy.rice = true;
    if (gameState.player.autoBuy.corn === undefined) gameState.player.autoBuy.corn = true;
  }

  // Initialize zoneEarnings if it doesn't exist (backward compatibility)
  if (!gameState.zoneEarnings) {
    gameState.zoneEarnings = {};
  }

  return gameState as GameState;
}

/**
 * Loads game state from localStorage autosave
 */
export function loadFromLocalStorage(): GameState | null {
  try {
    const saveData = localStorage.getItem('farm_autosave');
    if (!saveData) return null;

    const gameState = JSON.parse(saveData);
    return migrateGameState(gameState);
  } catch (error) {
    console.error('Failed to load autosave:', error);
    return null;
  }
}

/**
 * Checks if there's an autosave available
 */
export function hasAutosave(): boolean {
  try {
    return localStorage.getItem('farm_autosave') !== null;
  } catch {
    return false;
  }
}

/**
 * Gets the timestamp of the last autosave
 */
export function getAutosaveTimestamp(): number | null {
  try {
    const timestamp = localStorage.getItem('farm_autosave_timestamp');
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Clears the autosave from localStorage
 */
export function clearAutosave(): void {
  try {
    localStorage.removeItem('farm_autosave');
    localStorage.removeItem('farm_autosave_timestamp');
  } catch (error) {
    console.error('Failed to clear autosave:', error);
  }
}

/**
 * Saves a save code to history for easy recovery
 */
function saveCodeToHistory(code: string, farmName: string): void {
  try {
    const historyJson = localStorage.getItem('farm_save_codes');
    let history: SaveCodeHistory[] = historyJson ? JSON.parse(historyJson) : [];

    // Add new code to the beginning
    history.unshift({
      code,
      timestamp: Date.now(),
      farmName,
    });

    // Keep only the last 10 codes
    history = history.slice(0, 10);

    localStorage.setItem('farm_save_codes', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save code to history:', error);
  }
}

/**
 * Gets the list of recent save codes
 */
export function getRecentSaveCodes(): SaveCodeHistory[] {
  try {
    const historyJson = localStorage.getItem('farm_save_codes');
    if (!historyJson) return [];

    return JSON.parse(historyJson) as SaveCodeHistory[];
  } catch (error) {
    console.error('Failed to get recent save codes:', error);
    return [];
  }
}

/**
 * Clears all save code history
 */
export function clearSaveCodeHistory(): void {
  try {
    localStorage.removeItem('farm_save_codes');
  } catch (error) {
    console.error('Failed to clear save code history:', error);
  }
}
