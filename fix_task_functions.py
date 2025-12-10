#!/usr/bin/env python3
import re

# Read the file
with open('src/lib/gameEngine.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the addTask function and fix it
in_add_task = False
add_task_start_line = None
for i, line in enumerate(lines):
    if 'export function addTask(' in line:
        in_add_task = True
        add_task_start_line = i
        break

if add_task_start_line is not None:
    # Find the line with "): GameState {" and insert the variables after it
    for i in range(add_task_start_line, min(add_task_start_line + 10, len(lines))):
        if '): GameState {' in lines[i]:
            # Insert the variable declarations
            insert_lines = [
                '  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);\n',
                '  const currentZone = state.zones[currentZoneKey];\n',
                '\n'
            ]
            # Check if they're already there
            if 'const currentZoneKey' not in lines[i+1]:
                lines[i+1:i+1] = insert_lines
            break

# Now fix the hasExistingTask line
for i, line in enumerate(lines):
    if 'const hasExistingTask = state.taskQueue.some(' in line:
        lines[i] = line.replace('state.taskQueue.some(', 'currentZone.taskQueue.some(')

# Write back
with open('src/lib/gameEngine.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed task functions!")
