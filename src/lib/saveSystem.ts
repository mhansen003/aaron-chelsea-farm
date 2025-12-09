import { GameState } from '@/types/game';

/**
 * Saves game state to the server and returns a 6-digit code
 * This code works across all devices!
 */
export async function generateSaveCode(gameState: GameState): Promise<string> {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save game');
    }

    const { code } = await response.json();
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
    return gameState;
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
 * Loads game state from localStorage autosave
 */
export function loadFromLocalStorage(): GameState | null {
  try {
    const saveData = localStorage.getItem('farm_autosave');
    if (!saveData) return null;

    return JSON.parse(saveData) as GameState;
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
