'use client';

import { GameState } from '@/types/game';
import NextImage from 'next/image';

interface FarmerModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateFarmerSettings: (settings: Partial<GameState['player']['farmerAuto']>) => void;
}

export default function FarmerModal({ gameState, onClose, onUpdateFarmerSettings }: FarmerModalProps) {
  const { farmerAuto } = gameState.player;

  const toggleAutoHarvest = () => {
    onUpdateFarmerSettings({ autoHarvest: !farmerAuto.autoHarvest });
  };

  const toggleAutoWater = () => {
    onUpdateFarmerSettings({ autoWater: !farmerAuto.autoWater });
  };

  const toggleAutoPlant = () => {
    onUpdateFarmerSettings({ autoPlant: !farmerAuto.autoPlant });
  };

  const toggleCropSelection = (cropValue: string) => {
    const isSelected = farmerAuto.autoPlantCrops.includes(cropValue as any);
    const newCrops = isSelected
      ? farmerAuto.autoPlantCrops.filter(c => c !== cropValue)
      : [...farmerAuto.autoPlantCrops, cropValue];
    onUpdateFarmerSettings({ autoPlantCrops: newCrops as any[] });
  };

  const setDepositDestination = (autoSell: boolean) => {
    onUpdateFarmerSettings({ autoSell });
  };

  const crops = [
    { value: 'carrot', label: 'Carrot', image: '/carrot.png' },
    { value: 'wheat', label: 'Wheat', image: '/wheat.png' },
    { value: 'tomato', label: 'Tomato', image: '/tomato.png' },
    { value: 'pumpkin', label: 'Pumpkin', image: '/pumpkin.png' },
    { value: 'watermelon', label: 'Watermelon', image: '/watermelon.png' },
    { value: 'peppers', label: 'Peppers', image: '/peppers.png' },
    { value: 'grapes', label: 'Grapes', image: '/grapes.png' },
    { value: 'oranges', label: 'Oranges', image: '/orange.png' },
    { value: 'avocado', label: 'Avocado', image: '/avacado.png' },
    { value: 'rice', label: 'Rice', image: '/rice.png' },
    { value: 'corn', label: 'Corn', image: '/corn.png' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900 to-green-950 border-4 border-green-500 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 border-b-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-green-800 rounded-full border-4 border-green-400 overflow-hidden flex items-center justify-center">
                <NextImage
                  src="/images/general/farmer.png"
                  alt="Farmer"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Farmer Settings</h2>
                <p className="text-green-200 text-sm">Configure automation preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-4xl font-bold transition-colors leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Priority Order Info */}
          <div className="bg-purple-900/30 border-2 border-purple-500 rounded-lg p-4 mb-6">
            <div className="text-sm text-purple-300 font-bold mb-2">⚡ Automation Priority</div>
            <div className="text-xs text-purple-200 mb-2">
              Harvest → Water → Plant (Fixed order for optimal farming)
            </div>
            <div className="text-xs text-green-300 bg-green-900/30 border border-green-500 rounded px-2 py-1 mt-2">
              ℹ️ Changes take effect immediately and clear the current task queue
            </div>
          </div>

          {/* Auto Harvest */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer bg-orange-900/30 hover:bg-orange-900/50 border-2 border-orange-600 rounded-lg p-4 transition-all">
              <input
                type="checkbox"
                checked={farmerAuto.autoHarvest}
                onChange={toggleAutoHarvest}
                className="w-6 h-6 cursor-pointer"
              />
              <div className="flex items-center gap-3 flex-1">
                <NextImage
                  src="/images/cursors/harvest.png"
                  alt="Harvest"
                  width={32}
                  height={32}
                />
                <div>
                  <div className="text-lg font-bold text-white">Auto Harvest</div>
                  <div className="text-xs text-orange-200">Automatically harvest grown crops</div>
                </div>
              </div>
            </label>
          </div>

          {/* Auto Water */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer bg-cyan-900/30 hover:bg-cyan-900/50 border-2 border-cyan-600 rounded-lg p-4 transition-all">
              <input
                type="checkbox"
                checked={farmerAuto.autoWater}
                onChange={toggleAutoWater}
                className="w-6 h-6 cursor-pointer"
              />
              <div className="flex items-center gap-3 flex-1">
                <NextImage
                  src="/images/bots/water bot.png"
                  alt="Water"
                  width={32}
                  height={32}
                />
                <div>
                  <div className="text-lg font-bold text-white">Auto Water</div>
                  <div className="text-xs text-cyan-200">Automatically water planted crops</div>
                </div>
              </div>
            </label>
          </div>

          {/* Auto Plant */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer bg-green-900/30 hover:bg-green-900/50 border-2 border-green-600 rounded-lg p-4 transition-all">
              <input
                type="checkbox"
                checked={farmerAuto.autoPlant}
                onChange={toggleAutoPlant}
                className="w-6 h-6 cursor-pointer"
              />
              <div className="flex items-center gap-3 flex-1">
                <NextImage
                  src="/images/bots/plant seeds.png"
                  alt="Plant"
                  width={32}
                  height={32}
                />
                <div>
                  <div className="text-lg font-bold text-white">Auto Plant</div>
                  <div className="text-xs text-green-200">Automatically plant seeds on cleared tiles</div>
                </div>
              </div>
            </label>

            {/* Crop Selection */}
            {farmerAuto.autoPlant && (
              <div className="mt-4 ml-6 bg-green-950/50 border-2 border-green-700 rounded-lg p-4">
                <div className="text-sm text-green-300 font-bold mb-3">Select Crops to Auto-Plant:</div>
                <div className="grid grid-cols-2 gap-2">
                  {crops.map((crop) => {
                    const isSelected = farmerAuto.autoPlantCrops.includes(crop.value as any);
                    return (
                      <label
                        key={crop.value}
                        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'bg-green-600/50 border-green-400'
                            : 'bg-green-900/30 border-green-700 hover:bg-green-900/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCropSelection(crop.value)}
                          className="w-4 h-4"
                        />
                        <NextImage
                          src={crop.image}
                          alt={crop.label}
                          width={24}
                          height={24}
                        />
                        <span className="text-sm text-white">{crop.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Harvest Destination */}
          <div className="bg-amber-900/30 border-2 border-amber-600 rounded-lg p-4">
            <div className="text-sm text-amber-300 font-bold mb-3">Harvest Destination:</div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer bg-amber-950/50 hover:bg-amber-950/70 border-2 border-amber-700 rounded-lg p-3 transition-all">
                <input
                  type="radio"
                  name="depositDestination"
                  checked={farmerAuto.autoSell}
                  onChange={() => setDepositDestination(true)}
                  className="w-5 h-5"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚢</span>
                  <div>
                    <div className="text-base font-bold text-white">Auto Sell</div>
                    <div className="text-xs text-amber-200">Deposit harvests directly to export</div>
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer bg-amber-950/50 hover:bg-amber-950/70 border-2 border-amber-700 rounded-lg p-3 transition-all">
                <input
                  type="radio"
                  name="depositDestination"
                  checked={!farmerAuto.autoSell}
                  onChange={() => setDepositDestination(false)}
                  className="w-5 h-5"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏭</span>
                  <div>
                    <div className="text-base font-bold text-white">To Warehouse</div>
                    <div className="text-xs text-amber-200">Store harvests in warehouse</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
