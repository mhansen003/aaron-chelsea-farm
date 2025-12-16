// Market Economy System for My Bot Farm
import { GameState, MarketData, Season, PriceSnapshot, CropType } from '@/types/game';
import { CROP_INFO } from './cropConstants';

/**
 * Get current season based on game time
 * Each season lasts 10 minutes (600,000ms)
 * Full cycle: 40 minutes (Spring -> Summer -> Fall -> Winter)
 */
export function getSeason(gameTime: number): Season {
  const SEASON_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  const totalSeasonTime = gameTime % (SEASON_DURATION * 4); // 4 seasons cycle
  const seasonIndex = Math.floor(totalSeasonTime / SEASON_DURATION);
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
  return seasons[seasonIndex];
}

/**
 * Get time remaining in current season (in milliseconds)
 */
export function getSeasonTimeRemaining(gameTime: number): number {
  const SEASON_DURATION = 10 * 60 * 1000; // 10 minutes
  const totalSeasonTime = gameTime % (SEASON_DURATION * 4);
  const seasonProgress = totalSeasonTime % SEASON_DURATION;
  return SEASON_DURATION - seasonProgress;
}

/**
 * Get crops that are in high demand for the current season
 * High demand adds +75% to sell price
 */
export function getSeasonalDemandCrops(season: Season): Array<Exclude<CropType, null>> {
  const demandMap: Record<Season, Array<Exclude<CropType, null>>> = {
    spring: ['carrot', 'wheat', 'tomato'], // Fresh spring vegetables
    summer: ['watermelon', 'tomato', 'peppers'], // Hot summer crops
    fall: ['pumpkin', 'grapes', 'corn'], // Harvest season crops
    winter: ['avocado', 'oranges', 'rice'], // Winter staples
  };
  return demandMap[season];
}

/**
 * Epic seasonal events occur every 5th season (every 50 minutes)
 * During epic seasons, specific crops sell for 3x normal price
 */
export function getEpicSeasonalEvent(gameTime: number): {
  isEpicSeason: boolean;
  epicCrops: Array<Exclude<CropType, null>>;
  seasonName: string;
} | null {
  const SEASON_DURATION = 10 * 60 * 1000; // 10 minutes
  const EPIC_CYCLE = SEASON_DURATION * 5; // Every 5 seasons (50 minutes)

  const cycleNumber = Math.floor(gameTime / EPIC_CYCLE);
  const timeInCycle = gameTime % EPIC_CYCLE;
  const isEpicSeason = timeInCycle < SEASON_DURATION; // First season of each 5-season cycle is epic

  if (!isEpicSeason) return null;

  // Rotate which crops are epic each cycle for variety
  const epicSeasonConfigs = [
    { name: 'Harvest Festival', crops: ['pumpkin', 'grapes', 'corn'] as Array<Exclude<CropType, null>> },
    { name: 'Summer Celebration', crops: ['watermelon', 'tomato', 'peppers'] as Array<Exclude<CropType, null>> },
    { name: 'Spring Bounty', crops: ['carrot', 'wheat', 'tomato'] as Array<Exclude<CropType, null>> },
    { name: 'Winter Market', crops: ['avocado', 'oranges', 'rice'] as Array<Exclude<CropType, null>> },
  ];

  const config = epicSeasonConfigs[cycleNumber % epicSeasonConfigs.length];

  return {
    isEpicSeason: true,
    epicCrops: config.crops,
    seasonName: config.name,
  };
}

/**
 * Initialize market system with base prices
 */
export function initializeMarket(gameState: GameState): MarketData {
  const crops: Array<Exclude<CropType, null>> = [
    'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
    'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
  ];

  const currentPrices: Record<Exclude<CropType, null>, number> = {} as any;
  const priceMultipliers: Record<Exclude<CropType, null>, number> = {} as any;

  crops.forEach(crop => {
    const basePrice = CROP_INFO[crop].sellPrice;
    currentPrices[crop] = basePrice;
    priceMultipliers[crop] = 1.0; // Start at 100% of base
  });

  const currentSeason = getSeason(gameState.gameTime);
  const highDemandCrops = getSeasonalDemandCrops(currentSeason);

  const marketData: MarketData = {
    priceHistory: [],
    priceForecast: [],
    currentPrices,
    priceMultipliers,
    lastUpdateDay: gameState.currentDay,
    lastForecastTime: gameState.gameTime,
    currentSeason,
    highDemandCrops,
    epicPriceCrop: null,
    epicPriceEndTime: 0,
  };

  // Generate initial 10-cycle forecast
  marketData.priceForecast = generatePriceForecast(marketData, gameState);

  return marketData;
}

/**
 * Seeded pseudo-random number generator for deterministic forecasts
 * Uses the time and crop name to generate consistent values
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate price forecast for the next 10 cycles
 * Each cycle is a price update (typically daily), forecasting ~10 days ahead
 * Uses deterministic seeding so forecasts are predictable and consistent
 */
function generatePriceForecast(market: MarketData, gameState: GameState): PriceSnapshot[] {
  const CYCLE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds (1 season)
  const NUM_CYCLES = 10; // Forecast 10 cycles ahead for balanced chart
  const forecast: PriceSnapshot[] = [];

  const crops: Array<Exclude<CropType, null>> = [
    'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
    'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
  ];

  // Start from current state
  let simulatedMultipliers = { ...market.priceMultipliers };
  let simulatedTime = gameState.gameTime;

  for (let cycle = 0; cycle < NUM_CYCLES; cycle++) {
    simulatedTime += CYCLE_DURATION;

    const simulatedSeason = getSeason(simulatedTime);
    const simulatedHighDemand = getSeasonalDemandCrops(simulatedSeason);
    const simulatedPrices: Record<Exclude<CropType, null>, number> = {} as any;

    // Check for epic seasonal event
    const epicEvent = getEpicSeasonalEvent(simulatedTime);

    crops.forEach((crop, cropIndex) => {
      const basePrice = CROP_INFO[crop].sellPrice;

      // Use deterministic seed based on cycle time and crop
      const seed = Math.floor(simulatedTime / CYCLE_DURATION) + cropIndex * 1000;
      const randomValue = seededRandom(seed);

      // Simulate cycle fluctuation: ±10% change per cycle (deterministic)
      const fluctuation = (randomValue - 0.5) * 0.2; // -10% to +10%
      let newMultiplier = simulatedMultipliers[crop] + fluctuation;

      // Keep multipliers in reasonable range (0.7x to 1.5x base price)
      newMultiplier = Math.max(0.7, Math.min(1.5, newMultiplier));

      // Seasonal demand boost: Fixed +75% for high demand crops (predictable)
      const isHighDemand = simulatedHighDemand.includes(crop);
      const seasonalBoost = isHighDemand ? 0.75 : 0;

      // Epic seasonal boost: 3x multiplier for epic crops
      const isEpicCrop = epicEvent && epicEvent.epicCrops.includes(crop);
      const epicBoost = isEpicCrop ? 2.0 : 0; // +200% (total 3x)

      simulatedMultipliers[crop] = newMultiplier;
      simulatedPrices[crop] = Math.round(basePrice * (newMultiplier + seasonalBoost + epicBoost));
    });

    forecast.push({
      timestamp: simulatedTime,
      day: gameState.currentDay + cycle + 1, // Current day + forecast cycles ahead
      prices: simulatedPrices,
    });
  }

  return forecast;
}

/**
 * Update market prices and forecasts
 * Updates once per day and shifts forecast forward, realizing predictions
 */
export function updateMarketPrices(gameState: GameState): GameState {
  if (!gameState.market) {
    // Initialize market if it doesn't exist
    return {
      ...gameState,
      market: initializeMarket(gameState),
    };
  }

  const market = { ...gameState.market };
  const CYCLE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Update season based on real-time
  market.currentSeason = getSeason(gameState.gameTime);
  market.highDemandCrops = getSeasonalDemandCrops(market.currentSeason);

  // Update forecast every cycle (10 minutes) - shift and add one new prediction
  const timeSinceLastForecast = gameState.gameTime - market.lastForecastTime;
  if (timeSinceLastForecast >= CYCLE_DURATION) {
    // Check if we have an existing forecast
    if (market.priceForecast && market.priceForecast.length > 0) {
      // Remove the first forecast (it's now the present)
      const updatedForecast = market.priceForecast.slice(1);

      // Generate ONE new forecast point for the far future
      const lastForecast = updatedForecast[updatedForecast.length - 1] || market.priceForecast[market.priceForecast.length - 1];
      const newTime = lastForecast.timestamp + CYCLE_DURATION;
      const newDay = lastForecast.day + 1;

      const crops: Array<Exclude<CropType, null>> = [
        'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
        'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
      ];

      const newSeason = getSeason(newTime);
      const newHighDemand = getSeasonalDemandCrops(newSeason);
      const epicEvent = getEpicSeasonalEvent(newTime);
      const newPrices: Record<Exclude<CropType, null>, number> = {} as any;

      crops.forEach((crop, cropIndex) => {
        const basePrice = CROP_INFO[crop].sellPrice;
        const seed = Math.floor(newTime / CYCLE_DURATION) + cropIndex * 1000;
        const randomValue = seededRandom(seed);

        // Get last multiplier from last forecast
        const lastPrice = lastForecast.prices[crop];
        const lastMultiplier = lastPrice / basePrice;

        const fluctuation = (randomValue - 0.5) * 0.2;
        let newMultiplier = lastMultiplier + fluctuation;
        newMultiplier = Math.max(0.7, Math.min(1.5, newMultiplier));

        const isHighDemand = newHighDemand.includes(crop);
        const seasonalBoost = isHighDemand ? 0.75 : 0;

        const isEpicCrop = epicEvent && epicEvent.epicCrops.includes(crop);
        const epicBoost = isEpicCrop ? 2.0 : 0;

        newPrices[crop] = Math.round(basePrice * (newMultiplier + seasonalBoost + epicBoost));
      });

      updatedForecast.push({
        timestamp: newTime,
        day: newDay,
        prices: newPrices,
      });

      market.priceForecast = updatedForecast;
    } else {
      // No existing forecast, generate full new forecast
      market.priceForecast = generatePriceForecast(market, gameState);
    }

    market.lastForecastTime = gameState.gameTime;
  }

  // Only update prices once per day
  if (gameState.market.lastUpdateDay === gameState.currentDay) {
    return {
      ...gameState,
      market,
    };
  }

  const crops: Array<Exclude<CropType, null>> = [
    'carrot', 'wheat', 'tomato', 'pumpkin', 'watermelon',
    'peppers', 'grapes', 'oranges', 'avocado', 'rice', 'corn'
  ];

  // Handle epic price events
  const EPIC_DURATION = 15 * 60 * 1000; // Epic prices last 15 minutes

  // Check if current epic price has ended
  if (market.epicPriceCrop && gameState.gameTime >= market.epicPriceEndTime) {
    market.epicPriceCrop = null;
    market.epicPriceEndTime = 0;
  }

  // Randomly trigger new epic price event (5% chance per day)
  if (!market.epicPriceCrop && Math.random() < 0.05) {
    market.epicPriceCrop = crops[Math.floor(Math.random() * crops.length)];
    market.epicPriceEndTime = gameState.gameTime + EPIC_DURATION;
  }

  // Check if we have a forecast for the current/next time - if so, use it!
  const nextForecast = market.priceForecast.length > 0 ? market.priceForecast[0] : null;

  // Check for epic seasonal event
  const currentEpicEvent = getEpicSeasonalEvent(gameState.gameTime);

  // Realize forecasted prices OR generate new prices if no forecast exists
  crops.forEach((crop, cropIndex) => {
    const basePrice = CROP_INFO[crop].sellPrice;

    // Check for high demand (seasonal boost)
    const isHighDemand = market.highDemandCrops.includes(crop);
    const seasonalBoost = isHighDemand ? 0.75 : 0;

    // Epic price boosts
    const isRandomEpicPrice = market.epicPriceCrop === crop; // Random epic event (5x)
    const isSeasonalEpicPrice = currentEpicEvent && currentEpicEvent.epicCrops.includes(crop); // Seasonal epic (3x)
    const epicBoost = isRandomEpicPrice ? 4.0 : isSeasonalEpicPrice ? 2.0 : 0;

    if (nextForecast && nextForecast.prices[crop]) {
      // Use the forecasted price! This makes forecasts come true
      const forecastedPrice = nextForecast.prices[crop];

      // Apply both seasonal boost AND epic boost to the forecasted price
      const totalMultiplier = (forecastedPrice / basePrice) + seasonalBoost + epicBoost;
      market.currentPrices[crop] = Math.round(basePrice * totalMultiplier);
      market.priceMultipliers[crop] = forecastedPrice / basePrice;
    } else {
      // No forecast available - generate price (fallback)
      const seed = gameState.currentDay + cropIndex * 1000;
      const randomValue = seededRandom(seed);

      const fluctuation = (randomValue - 0.5) * 0.3; // -15% to +15%
      let newMultiplier = market.priceMultipliers[crop] + fluctuation;
      newMultiplier = Math.max(0.7, Math.min(1.5, newMultiplier));

      market.priceMultipliers[crop] = newMultiplier;
      market.currentPrices[crop] = Math.round(basePrice * (newMultiplier + seasonalBoost + epicBoost));
    }
  });

  market.lastUpdateDay = gameState.currentDay;

  // Record price snapshot for history (keep last 10 for ~2 seasons)
  const snapshot: PriceSnapshot = {
    timestamp: gameState.gameTime,
    day: gameState.currentDay,
    prices: { ...market.currentPrices },
  };

  market.priceHistory = [...market.priceHistory, snapshot].slice(-10);

  return {
    ...gameState,
    market,
  };
}

/**
 * Get current market sell price for a crop
 * Includes progression multiplier + market dynamics
 */
export function getMarketPrice(
  cropType: Exclude<CropType, null>,
  gameState: GameState
): number {
  const basePrice = CROP_INFO[cropType].sellPrice;

  // Apply progression multiplier (from crops sold)
  const sold = gameState.cropsSold[cropType] || 0;
  const progressionMultiplier = 1 + (Math.floor(sold / 10) * 0.1);
  const progressionPrice = Math.round(basePrice * Math.min(progressionMultiplier, 3));

  // If market system is active, use market price
  if (gameState.market) {
    const marketPrice = gameState.market.currentPrices[cropType];
    // Combine progression bonus with market price
    // Market price is already modified from base, so apply progression on top
    return Math.round(marketPrice * Math.min(progressionMultiplier, 3));
  }

  return progressionPrice;
}

/**
 * Get price trend indicator for a crop (rising, falling, stable)
 */
export function getPriceTrend(
  cropType: Exclude<CropType, null>,
  market: MarketData
): 'rising' | 'falling' | 'stable' {
  if (market.priceHistory.length < 3) return 'stable';

  const recent = market.priceHistory.slice(-3);
  const prices = recent.map(s => s.prices[cropType]);

  const avgChange = (prices[2] - prices[0]) / 2;

  if (avgChange > 1) return 'rising';
  if (avgChange < -1) return 'falling';
  return 'stable';
}

/**
 * Get forecast for next season's high demand crops
 */
export function getNextSeasonForecast(gameTime: number): {
  season: Season;
  crops: Array<Exclude<CropType, null>>;
  minutesUntil: number;
} {
  const SEASON_DURATION = 10 * 60 * 1000; // 10 minutes
  const timeRemaining = getSeasonTimeRemaining(gameTime);
  const nextTime = gameTime + timeRemaining;
  const nextSeason = getSeason(nextTime);
  const nextCrops = getSeasonalDemandCrops(nextSeason);

  return {
    season: nextSeason,
    crops: nextCrops,
    minutesUntil: Math.ceil(timeRemaining / (60 * 1000)), // Convert ms to minutes
  };
}
