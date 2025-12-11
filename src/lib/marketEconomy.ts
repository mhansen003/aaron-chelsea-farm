// Market Economy System for Aaron and Chelsea's Farm
import { GameState, MarketData, Season, PriceSnapshot, CropType } from '@/types/game';
import { CROP_INFO } from './gameEngine';

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
 * High demand adds +50-100% to sell price
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
  };

  // Generate initial 10-cycle forecast
  marketData.priceForecast = generatePriceForecast(marketData, gameState);

  return marketData;
}

/**
 * Generate price forecast for the next 10 cycles (10-minute periods)
 * Each cycle predicts prices 10 minutes into the future
 */
function generatePriceForecast(market: MarketData, gameState: GameState): PriceSnapshot[] {
  const CYCLE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  const NUM_CYCLES = 10;
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

    crops.forEach(crop => {
      const basePrice = CROP_INFO[crop].sellPrice;

      // Simulate cycle fluctuation: ±10% change per cycle
      const fluctuation = (Math.random() - 0.5) * 0.2; // -10% to +10%
      let newMultiplier = simulatedMultipliers[crop] + fluctuation;

      // Keep multipliers in reasonable range (0.7x to 1.5x base price)
      newMultiplier = Math.max(0.7, Math.min(1.5, newMultiplier));

      // Seasonal demand boost: +50-100% for high demand crops
      const isHighDemand = simulatedHighDemand.includes(crop);
      const seasonalBoost = isHighDemand ? 0.5 + (Math.random() * 0.5) : 0;

      simulatedMultipliers[crop] = newMultiplier;
      simulatedPrices[crop] = Math.round(basePrice * (newMultiplier + seasonalBoost));
    });

    forecast.push({
      timestamp: simulatedTime,
      day: Math.floor(simulatedTime / (24 * 60 * 60 * 1000)), // Approximate day for display
      prices: simulatedPrices,
    });
  }

  return forecast;
}

/**
 * Update market prices and forecasts
 * Updates once per day and regenerates forecasts every 10-minute cycle
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

  // Regenerate forecast every cycle (10 minutes)
  const timeSinceLastForecast = gameState.gameTime - market.lastForecastTime;
  if (timeSinceLastForecast >= CYCLE_DURATION) {
    market.priceForecast = generatePriceForecast(market, gameState);
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

  // Update each crop's price multiplier with daily fluctuation
  crops.forEach(crop => {
    const basePrice = CROP_INFO[crop].sellPrice;

    // Daily price fluctuation: ±15% change
    const fluctuation = (Math.random() - 0.5) * 0.3; // -15% to +15%
    let newMultiplier = market.priceMultipliers[crop] + fluctuation;

    // Keep multipliers in reasonable range (0.7x to 1.5x base price)
    newMultiplier = Math.max(0.7, Math.min(1.5, newMultiplier));

    // Seasonal demand boost: +50-100% for high demand crops
    const isHighDemand = market.highDemandCrops.includes(crop);
    const seasonalBoost = isHighDemand ? 0.5 + (Math.random() * 0.5) : 0; // +50-100%

    market.priceMultipliers[crop] = newMultiplier;
    market.currentPrices[crop] = Math.round(basePrice * (newMultiplier + seasonalBoost));
  });

  market.lastUpdateDay = gameState.currentDay;

  // Record price snapshot for history (keep last 30)
  const snapshot: PriceSnapshot = {
    timestamp: gameState.gameTime,
    day: gameState.currentDay,
    prices: { ...market.currentPrices },
  };

  market.priceHistory = [...market.priceHistory, snapshot].slice(-30);

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
