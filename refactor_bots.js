// Refactoring script to make bots zone-specific
const fs = require('fs');
const path = require('path');

const gameEnginePath = path.join(__dirname, 'src', 'lib', 'gameEngine.ts');
let content = fs.readFileSync(gameEnginePath, 'utf8');

// Find where to insert the new harvest bot AI (after water bot section)
const waterBotEnd = content.indexOf('  });');
const insertPoint = waterBotEnd + 6; // After the closing });

// New Harvest Bot AI code (zone-specific)
const harvestBotAI = `
  // ========== HARVEST BOT AI (ALL ZONES) ==========
  Object.entries(newZones).forEach(([zoneKey, zone]) => {
    if (!zone.owned || !zone.harvestBots || zone.harvestBots.length === 0) return;

    const grid = zone.grid;
    let updatedGrid = grid;
    const updatedHarvestBots = zone.harvestBots.map(bot => {
      if (bot.x === undefined || bot.y === undefined) return bot;

      const botX = bot.x;
      const botY = bot.y;
      let visualX = bot.visualX ?? botX;
      let visualY = bot.visualY ?? botY;

      const dx = botX - visualX;
      const dy = botY - visualY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        visualX += dx * MOVE_SPEED;
        visualY += dy * MOVE_SPEED;
      } else {
        visualX = botX;
        visualY = botY;
      }

      const isInventoryFull = bot.inventory.length >= bot.inventoryCapacity;

      const grownCrops: Array<{ x: number; y: number }> = [];
      grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (tile.type === 'grown' && tile.crop) {
            grownCrops.push({ x, y });
          }
        });
      });

      const hasInventory = bot.inventory.length > 0;
      const noCropsAvailable = grownCrops.length === 0;
      const idleTimeout = 15000;

      if (hasInventory && noCropsAvailable && !isInventoryFull) {
        if (!bot.idleStartTime) {
          return { ...bot, idleStartTime: newState.gameTime, visualX, visualY };
        }
        if (newState.gameTime - bot.idleStartTime >= idleTimeout) {
          let warehousePos: { x: number; y: number } | null = null;
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              if (tile.type === 'warehouse') {
                warehousePos = { x, y };
              }
            });
          });

          if (warehousePos) {
            const warehouse: { x: number; y: number } = warehousePos;
            if (botX === warehouse.x && botY === warehouse.y) {
              newState = { ...newState, warehouse: [...newState.warehouse, ...bot.inventory] };
              return { ...bot, inventory: [], idleStartTime: undefined, status: 'depositing' as const, visualX, visualY };
            } else {
              let newX = botX, newY = botY;
              if (Math.random() < (deltaTime / 500)) {
                if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
                else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
              }
              return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
            }
          }
        }
      } else {
        if (bot.idleStartTime) {
          return { ...bot, idleStartTime: undefined, visualX, visualY };
        }
      }

      if (isInventoryFull) {
        let warehousePos: { x: number; y: number } | null = null;
        grid.forEach((row, y) => {
          row.forEach((tile, x) => {
            if (tile.type === 'warehouse') {
              warehousePos = { x, y };
            }
          });
        });

        if (warehousePos) {
          const warehouse: { x: number; y: number } = warehousePos;
          if (botX === warehouse.x && botY === warehouse.y) {
            newState = { ...newState, warehouse: [...newState.warehouse, ...bot.inventory] };
            return { ...bot, inventory: [], idleStartTime: undefined, status: 'depositing' as const, visualX, visualY };
          } else {
            let newX = botX, newY = botY;
            if (Math.random() < (deltaTime / 500)) {
              if (botX < warehouse.x) newX++; else if (botX > warehouse.x) newX--;
              else if (botY < warehouse.y) newY++; else if (botY > warehouse.y) newY--;
            }
            return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: warehouse.x, targetY: warehouse.y, visualX, visualY };
          }
        }
      }

      if (!isInventoryFull && grownCrops.length > 0) {
        let nearest = grownCrops[0];
        let minDist = Math.abs(botX - nearest.x) + Math.abs(botY - nearest.y);
        grownCrops.forEach(crop => {
          const dist = Math.abs(botX - crop.x) + Math.abs(botY - crop.y);
          if (dist < minDist) { minDist = dist; nearest = crop; }
        });

        const hasArrivedVisually = Math.abs(visualX - botX) < 0.1 && Math.abs(visualY - botY) < 0.1;
        if (botX === nearest.x && botY === nearest.y && hasArrivedVisually) {
          const tile = updatedGrid[nearest.y]?.[nearest.x];
          if (tile && tile.type === 'grown' && tile.crop) {
            const ACTION_DURATION = 1500;

            if (bot.actionStartTime !== undefined) {
              const elapsed = newState.gameTime - bot.actionStartTime;
              if (elapsed >= ACTION_DURATION) {
                const cropType = tile.crop;
                const quality = newState.player.inventory.seedQuality[cropType];

                updatedGrid = updatedGrid.map((row, rowY) =>
                  row.map((t, tileX) => {
                    if (tileX === nearest.x && rowY === nearest.y) {
                      return { ...t, type: 'dirt' as import('@/types/game').TileType, crop: null, growthStage: 0, plantedDay: undefined };
                    }
                    return t;
                  })
                );

                const improvedQuality = Math.random() < 0.1 ? { generation: quality.generation + 1, yield: Math.min(3.0, quality.yield + 0.1), growthSpeed: Math.min(2.0, quality.growthSpeed + 0.05) } : quality;

                newState = {
                  ...newState,
                  player: {
                    ...newState.player,
                    inventory: {
                      ...newState.player.inventory,
                      seeds: { ...newState.player.inventory.seeds, [cropType]: newState.player.inventory.seeds[cropType] + 1 },
                      seedQuality: { ...newState.player.inventory.seedQuality, [cropType]: improvedQuality },
                    },
                  },
                };

                return { ...bot, inventory: [...bot.inventory, { crop: cropType, quality: improvedQuality }], status: 'harvesting' as const, visualX, visualY, actionStartTime: undefined, actionDuration: undefined };
              } else {
                return { ...bot, status: 'harvesting' as const, visualX, visualY };
              }
            } else {
              return { ...bot, status: 'harvesting' as const, visualX, visualY, actionStartTime: newState.gameTime, actionDuration: ACTION_DURATION };
            }
          }
        } else {
          let newX = botX, newY = botY;
          if (Math.random() < (deltaTime / 500)) {
            if (botX < nearest.x) newX++; else if (botX > nearest.x) newX--;
            else if (botY < nearest.y) newY++; else if (botY > nearest.y) newY--;
          }
          return { ...bot, x: newX, y: newY, status: 'traveling' as const, targetX: nearest.x, targetY: nearest.y, visualX, visualY };
        }
      } else {
        if (Math.random() < (deltaTime / 2000)) {
          const walkableTiles: Array<{ x: number; y: number }> = [];
          grid.forEach((row, y) => {
            row.forEach((tile, x) => {
              const isWalkable = tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared) || tile.type === 'planted' || tile.type === 'grown' || tile.type === 'sand' || tile.type === 'seaweed' || tile.type === 'shells' || tile.type === 'cactus' || tile.type === 'rocks' || tile.type === 'cave' || tile.type === 'mountain';
              if (isWalkable && tile.type !== 'ocean') walkableTiles.push({ x, y });
            });
          });

          const nearbyTiles = walkableTiles.filter(t => {
            const dx = Math.abs(t.x - botX);
            const dy = Math.abs(t.y - botY);
            return dx <= 3 && dy <= 3 && (dx > 0 || dy > 0);
          });

          if (nearbyTiles.length > 0) {
            const randomTile = nearbyTiles[Math.floor(Math.random() * nearbyTiles.length)];
            return { ...bot, x: randomTile.x, y: randomTile.y, status: 'idle' as const, visualX, visualY };
          }
        }
      }

      return { ...bot, visualX, visualY };
    });

    newZones[zoneKey] = { ...zone, harvestBots: updatedHarvestBots, grid: updatedGrid };
  });
`;

// Insert the new code
content = content.slice(0, insertPoint) + harvestBotAI + content.slice(insertPoint);

// Write back
fs.writeFileSync(gameEnginePath, content, 'utf8');
console.log('Successfully refactored harvest bot AI to be zone-specific');
