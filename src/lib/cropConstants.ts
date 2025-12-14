// Crop constants for My Bot Farm
import { CropType, CropGrowthInfo } from '@/types/game';

/**
 * Crop information: growth time (ms), sell price, seed cost
 * Base growth times increased by 50%, exotic crops (grapes, oranges, avocado) take 125% longer
 */
export const CROP_INFO: Record<Exclude<CropType, null>, CropGrowthInfo> & { null: CropGrowthInfo } = {
  carrot: { daysToGrow: 1, growTime: 72000, sellPrice: 5, seedCost: 0 }, // 72 seconds - FREE! (profit: 5)
  wheat: { daysToGrow: 1, growTime: 108000, sellPrice: 3, seedCost: 1 }, // 108 seconds (profit: 2)
  tomato: { daysToGrow: 2, growTime: 216000, sellPrice: 8, seedCost: 4 }, // 216 seconds (profit: 4)
  pumpkin: { daysToGrow: 2, growTime: 144000, sellPrice: 12, seedCost: 6 }, // 144 seconds (profit: 6)
  watermelon: { daysToGrow: 2, growTime: 180000, sellPrice: 15, seedCost: 8 }, // 180 seconds (profit: 7)
  peppers: { daysToGrow: 1, growTime: 90000, sellPrice: 6, seedCost: 3 }, // 90 seconds (profit: 3)
  grapes: { daysToGrow: 3, growTime: 243000, sellPrice: 14, seedCost: 5 }, // 243 seconds - EXOTIC (profit: 9)
  oranges: { daysToGrow: 4, growTime: 297000, sellPrice: 20, seedCost: 7 }, // 297 seconds - EXOTIC (profit: 13)
  avocado: { daysToGrow: 5, growTime: 351000, sellPrice: 26, seedCost: 10 }, // 351 seconds - EXOTIC (profit: 16)
  rice: { daysToGrow: 2, growTime: 126000, sellPrice: 7, seedCost: 3 }, // 126 seconds (profit: 4)
  corn: { daysToGrow: 2, growTime: 135000, sellPrice: 9, seedCost: 4 }, // 135 seconds (profit: 5)
  null: { daysToGrow: 0, growTime: 0, sellPrice: 0, seedCost: 0 },
};
