import fs from 'fs';

const content = fs.readFileSync('C:\\GitHub\\aaron-chelsea-farm\\src\\types\\game.ts', 'utf8');

// Find the position of 'export interface TransportBot {'
const searchStr = 'export interface TransportBot {';
const pos = content.indexOf(searchStr);

if (pos === -1) {
  console.error('Could not find TransportBot interface');
  process.exit(1);
}

// Insert the new interfaces before TransportBot
const newInterfaces = `export interface CropSellConfig {
  crop: Exclude<CropType, null>;
  enabled: boolean; // Whether to sell this crop at all
  minPriceMultiplier: number; // Minimum price as multiple of base (e.g., 1.2 = 120% of base)
  waitForHighDemand: boolean; // Only sell when in high demand
  waitForEpic: boolean; // Only sell when epic pricing
}

export interface TransportBotConfig {
  mode: 'simple' | 'advanced'; // Simple = global settings, Advanced = per-crop
  globalMinPriceMultiplier: number; // Default for all crops (e.g., 1.2)
  globalWaitForHighDemand: boolean; // Apply to all crops
  globalWaitForEpic: boolean; // Apply to all crops
  perCropSettings: CropSellConfig[]; // Individual crop overrides (used in advanced mode)
  sellWhenFull: boolean; // Override all settings when inventory is full
}

`;

const before = content.substring(0, pos);
const after = content.substring(pos);

// Find where to add the config field (before the closing brace)
const superchargedLinePos = after.indexOf("  supercharged?: boolean; // Whether bot has been supercharged (200% speed)");
if (superchargedLinePos === -1) {
  console.error('Could not find supercharged line');
  process.exit(1);
}

// Find the newline after supercharged
const newlineAfterSupercharged = after.indexOf('\n', superchargedLinePos);
const insertPos = newlineAfterSupercharged + 1;

const beforeInsert = after.substring(0, insertPos);
const afterInsert = after.substring(insertPos);

// Add config field to TransportBot
const configLine = '  config?: TransportBotConfig; // Sell trigger configuration\n';

// Combine everything
const newContent = before + newInterfaces + beforeInsert + configLine + afterInsert;

fs.writeFileSync('C:\\GitHub\\aaron-chelsea-farm\\src\\types\\game.ts', newContent, 'utf8');
console.log('Successfully updated game.ts with config interfaces');
