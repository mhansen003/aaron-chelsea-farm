#!/usr/bin/env python3
import re

# Read the file
with open('src/lib/gameEngine.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the updateGameState function and inject zone key logic at the start
update_game_state_pattern = r'(export function updateGameState\(state: GameState, deltaTime: number\): GameState \{\s+if \(state\.isPaused\) return state;)'
replacement = r'''\1

  // Get current zone for task queue management
  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  let currentZone = state.zones[currentZoneKey];'''

content = re.sub(update_game_state_pattern, replacement, content)

# Replace all newState.currentTask with currentZone.currentTask
content = content.replace('newState.currentTask', 'currentZone.currentTask')

# Replace all newState.taskQueue with currentZone.taskQueue
content = content.replace('newState.taskQueue', 'currentZone.taskQueue')

# Add zone update logic before the return statement in updateGameState
# Find the final return statement in updateGameState
return_pattern = r'(  return \{\s+\.\.\.newState,\s+zones: newZones,\s+currentDay: newDay,\s+dayProgress: newDayProgress,\s+gameTime: newGameTime,\s+\};)'
replacement_return = r'''  // Update current zone with modified task queue and current task
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

\1'''

content = re.sub(return_pattern, replacement_return, content)

# Write back
with open('src/lib/gameEngine.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Transformation complete!")
