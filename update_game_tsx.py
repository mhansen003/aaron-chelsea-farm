#!/usr/bin/env python3
import re

# Read the file
with open('src/components/Game.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace gameState.taskQueue with accessing current zone's taskQueue
# Need to be careful to add the current zone reference

# Replace gameState.taskQueue with code that gets the current zone first
content = re.sub(
    r'gameState\.taskQueue\.find',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.taskQueue; })().find',
    content
)

content = re.sub(
    r'gameState\.taskQueue\.some',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.taskQueue; })().some',
    content
)

content = re.sub(
    r'gameState\.taskQueue\.filter',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.taskQueue; })().filter',
    content
)

content = re.sub(
    r'gameState\.taskQueue\.map',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.taskQueue; })().map',
    content
)

content = re.sub(
    r'gameState\.taskQueue\.length',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.taskQueue.length; })()',
    content
)

# Replace standalone gameState.currentTask
content = re.sub(
    r'gameState\.currentTask([^.])',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.currentTask; })()\1',
    content
)

# Replace gameState.currentTask.property
content = re.sub(
    r'gameState\.currentTask\.',
    r'(() => { const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y); const currentZone = gameState.zones[currentZoneKey]; return currentZone.currentTask; })().',
    content
)

# Write back
with open('src/components/Game.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Game.tsx updated!")
