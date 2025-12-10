#!/usr/bin/env python3
import re

# Read the file
with open('src/lib/gameEngine.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update addTask function to use zone-specific taskQueue
add_task_pattern = r'(export function addTask\([^)]+\): GameState \{[^}]+?const hasExistingTask = )state\.taskQueue\.some\('
content = re.sub(add_task_pattern, r'\1currentZone.taskQueue.some(', content)

add_task_pattern2 = r'(const isCurrentTask = )state\.currentTask &&'
content = re.sub(add_task_pattern2, r'\1currentZone.currentTask &&', content)

add_task_pattern3 = r'(const isCurrentTask = currentZone\.currentTask &&\s+)state\.currentTask\.tileX'
content = re.sub(add_task_pattern3, r'\1currentZone.currentTask.tileX', content)

# Need to add currentZone variable at start of addTask
add_task_start = r'(export function addTask\([^)]+\): GameState \{\s+)(\s+// Check if)'
add_task_replacement = r'''\1const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
  const currentZone = state.zones[currentZoneKey];

\2'''
content = re.sub(add_task_start, add_task_replacement, content)

# Update the return statement in addTask
add_task_return = r'(duration: TASK_DURATIONS\[type\],\s+\};\s+)(return \{\s+\.\.\.state,\s+taskQueue: \[\.\.\.state\.taskQueue, task\],\s+\};)'
add_task_return_replacement = r'''\1return {
    ...state,
    zones: {
      ...state.zones,
      [currentZoneKey]: {
        ...currentZone,
        taskQueue: [...currentZone.taskQueue, task],
      },
    },
  };'''
content = re.sub(add_task_return, add_task_return_replacement, content, flags=re.DOTALL)

# Update removeTask function
remove_task_pattern = r'(export function removeTask\(state: GameState, taskId: string\): GameState \{\s+)(return \{\s+\.\.\.state,\s+taskQueue: state\.taskQueue\.filter\(t => t\.id !== taskId\),\s+\};)'
remove_task_replacement = r'''\1const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);
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
  };'''
content = re.sub(remove_task_pattern, remove_task_replacement, content, flags=re.DOTALL)

# Write back
with open('src/lib/gameEngine.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Task functions updated!")
