const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/gameEngine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Function to find function start line
function findFunctionLine(funcName) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`export function ${funcName}(`)) {
      return i;
    }
  }
  return -1;
}

// Fix buyWaterbots
let buyWaterbotsStart = findFunctionLine('buyWaterbots');
if (buyWaterbotsStart !== -1) {
  // Insert zone check after function declaration
  const newLines = [
    lines[buyWaterbotsStart],
    '  // Check current zone - limit to 1 water bot per zone',
    '  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);',
    '  const currentZone = state.zones[currentZoneKey];',
    '  if (currentZone.waterBots.length >= 1) return state; // Already has a water bot in this zone',
    ''
  ];

  // Find and replace actualAmount calculation
  for (let i = buyWaterbotsStart; i < buyWaterbotsStart + 50; i++) {
    if (lines[i].includes('const actualAmount = Math.min(amount, MAX_WATERBOTS')) {
      lines[i] = '  // Limit purchase to 1 bot per zone';
      lines.splice(i + 1, 0, '  const actualAmount = 1;');
      break;
    }
  }

  // Remove duplicate currentZoneKey and currentZone lines later in function
  for (let i = buyWaterbotsStart + 20; i < buyWaterbotsStart + 40; i++) {
    if (lines[i].includes('const currentZoneKey = getZoneKey')) {
      lines.splice(i, 2); // Remove currentZoneKey and currentZone lines
      break;
    }
  }

  // Insert the zone check lines after function declaration
  lines.splice(buyWaterbotsStart + 1, 0, ...newLines.slice(1));

  console.log('Fixed buyWaterbots');
}

// Fix buyHarvestbots
let buyHarvestbotsStart = findFunctionLine('buyHarvestbots');
if (buyHarvestbotsStart !== -1) {
  const newLines = [
    lines[buyHarvestbotsStart],
    '  // Check current zone - limit to 1 harvest bot per zone',
    '  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);',
    '  const currentZone = state.zones[currentZoneKey];',
    '  if (currentZone.harvestBots.length >= 1) return state; // Already has a harvest bot in this zone',
    ''
  ];

  // Find and replace actualAmount
  for (let i = buyHarvestbotsStart; i < buyHarvestbotsStart + 30; i++) {
    if (lines[i].includes('const actualAmount = amount;')) {
      lines[i] = '  // Limit purchase to 1 bot per zone';
      lines.splice(i + 1, 0, '  const actualAmount = 1;');
      break;
    }
  }

  // Remove duplicate currentZoneKey and currentZone lines
  for (let i = buyHarvestbotsStart + 20; i < buyHarvestbotsStart + 40; i++) {
    if (lines[i].includes('const currentZoneKey = getZoneKey')) {
      lines.splice(i, 2);
      break;
    }
  }

  lines.splice(buyHarvestbotsStart + 1, 0, ...newLines.slice(1));

  console.log('Fixed buyHarvestbots');
}

// Fix buySeedbots
let buySeedbotsStart = findFunctionLine('buySeedbots');
if (buySeedbotsStart !== -1) {
  const newLines = [
    lines[buySeedbotsStart],
    '  // Check current zone - limit to 1 seed bot per zone',
    '  const currentZoneKey = getZoneKey(state.currentZone.x, state.currentZone.y);',
    '  const currentZone = state.zones[currentZoneKey];',
    '  if (currentZone.seedBots.length >= 1) return state; // Already has a seed bot in this zone',
    ''
  ];

  // Find and replace actualAmount
  for (let i = buySeedbotsStart; i < buySeedbotsStart + 30; i++) {
    if (lines[i].includes('const actualAmount = amount;')) {
      lines[i] = '  // Limit purchase to 1 bot per zone';
      lines.splice(i + 1, 0, '  const actualAmount = 1;');
      break;
    }
  }

  // Remove duplicate currentZoneKey and currentZone lines
  for (let i = buySeedbotsStart + 20; i < buySeedbotsStart + 40; i++) {
    if (lines[i].includes('const currentZoneKey = getZoneKey')) {
      lines.splice(i, 2);
      break;
    }
  }

  lines.splice(buySeedbotsStart + 1, 0, ...newLines.slice(1));

  console.log('Fixed buySeedbots');
}

// Write the modified content back
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully modified all three bot purchase functions!');
