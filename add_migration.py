#!/usr/bin/env python3
import re

# Read the file
with open('src/components/Game.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the location after the bot migration (before delete parsed.seedBots)
migration_code = '''          // MIGRATION: Move global task queue to current zone
          if (parsed.taskQueue !== undefined || parsed.currentTask !== undefined) {
            const currentZoneKey = getZoneKey(parsed.currentZone?.x || 0, parsed.currentZone?.y || 0);
            if (parsed.zones && parsed.zones[currentZoneKey]) {
              parsed.zones[currentZoneKey].taskQueue = parsed.taskQueue || [];
              parsed.zones[currentZoneKey].currentTask = parsed.currentTask || null;
            }
            delete parsed.taskQueue;
            delete parsed.currentTask;
          }

'''

# Insert after the delete parsed.seedBots; line
pattern = r'(            delete parsed\.seedBots;\n          \})'
replacement = r'\1\n' + migration_code

content = re.sub(pattern, replacement, content)

# Also ensure all zones have taskQueue and currentTask initialized
zone_init_pattern = r'(              if \(!parsed\.zones\[zoneKey\]\.seedBots\) \{\n                parsed\.zones\[zoneKey\]\.seedBots = \[\];\n              \}\n)'
zone_init_replacement = r'''\1              if (!parsed.zones[zoneKey].taskQueue) {
                parsed.zones[zoneKey].taskQueue = [];
              }
              if (parsed.zones[zoneKey].currentTask === undefined) {
                parsed.zones[zoneKey].currentTask = null;
              }
'''

content = re.sub(zone_init_pattern, zone_init_replacement, content)

# Write back
with open('src/components/Game.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Migration logic added!")
