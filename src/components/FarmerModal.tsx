'use client';

import { GameState } from '@/types/game';
import NextImage from 'next/image';
import { useState } from 'react';

interface FarmerModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateFarmerSettings: (settings: Partial<GameState['player']['farmerAuto']>) => void;
  onUpdateFarmerName: (name: string) => void;
}

export default function FarmerModal({ gameState, onClose, onUpdateFarmerSettings, onUpdateFarmerName }: FarmerModalProps) {
  const { farmerAuto, farmerName } = gameState.player;
  const [editingName, setEditingName] = useState(farmerName);

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

  const handleNameChange = (newName: string) => {
    setEditingName(newName);
    onUpdateFarmerName(newName);
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-600 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 border-b-4 border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">Farmer Settings</div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-4xl font-bold transition-colors leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* Top Section - Photo, Name, and About */}
          <div className="bg-gray-800/50 border-2 border-gray-600 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-6">
              {/* Bigger Farmer Photo */}
              <div className="w-32 h-32 bg-gray-700 rounded-full border-4 border-gray-500 overflow-hidden flex items-center justify-center flex-shrink-0">
                <NextImage
                  src="/farmer.png"
                  alt="Farmer"
                  width={120}
                  height={120}
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                {/* Name next to photo */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 font-bold mb-2 block">Farmer Name</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-gray-700 border-2 border-gray-500 rounded-lg px-4 py-2 text-white text-xl font-bold focus:outline-none focus:border-gray-400"
                    maxLength={20}
                    placeholder="Enter farmer name"
                  />
                </div>

                {/* About section at top */}
                <div>
                  <div className="text-sm text-gray-400 font-bold mb-2">About {editingName || 'the Farmer'}</div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    A seasoned agriculturist with a passion for automation, {editingName || 'the Farmer'} has dedicated their life to building the most efficient farm in the land. With calloused hands and a keen eye for detail, they've mastered the art of balancing traditional farming wisdom with cutting-edge bot technology.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="space-y-4">
            <div className="text-sm text-gray-400 font-bold mb-3">Automation Settings</div>

            <div className="text-xs text-gray-500 mb-4 bg-gray-800/30 border border-gray-700 rounded px-3 py-2">
              ℹ️ Changes take effect immediately and clear the current task queue
            </div>

            {/* Auto Harvest, Water, Plant - Horizontal Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Auto Harvest */}
              <label className="flex items-center gap-2 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 border-2 border-gray-700 rounded-lg p-2 transition-all">
                <input
                  type="checkbox"
                  checked={farmerAuto.autoHarvest}
                  onChange={toggleAutoHarvest}
                  className="w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <NextImage
                  src="/harvest.png"
                  alt="Harvest"
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">Auto Harvest</div>
                  <div className="text-xs text-gray-400 truncate">Harvest grown crops</div>
                </div>
              </label>

              {/* Auto Water */}
              <label className="flex items-center gap-2 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 border-2 border-gray-700 rounded-lg p-2 transition-all">
                <input
                  type="checkbox"
                  checked={farmerAuto.autoWater}
                  onChange={toggleAutoWater}
                  className="w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <NextImage
                  src="/water bot.png"
                  alt="Water"
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">Auto Water</div>
                  <div className="text-xs text-gray-400 truncate">Water planted crops</div>
                </div>
              </label>
            </div>

            {/* Auto Plant - Full Width */}
            <div className="bg-gray-800/30 hover:bg-gray-800/50 border-2 border-gray-700 rounded-lg p-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={farmerAuto.autoPlant}
                  onChange={toggleAutoPlant}
                  className="w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <NextImage
                  src="/plant seeds.png"
                  alt="Plant"
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">Auto Plant</div>
                  <div className="text-xs text-gray-400">Plant seeds on cleared tiles</div>
                </div>
              </label>

              {/* Crop Selection Grid */}
              {farmerAuto.autoPlant && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 font-bold mb-2">Select Crops:</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {crops.map((crop) => {
                      const isSelected = farmerAuto.autoPlantCrops.includes(crop.value as any);
                      return (
                        <label
                          key={crop.value}
                          className={`flex items-center gap-1.5 p-2 rounded cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-gray-600/50 border-gray-400'
                              : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCropSelection(crop.value)}
                            className="w-3 h-3"
                          />
                          <NextImage
                            src={crop.image}
                            alt={crop.label}
                            width={20}
                            height={20}
                          />
                          <span className="text-xs text-white">{crop.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Harvest Destination - Horizontal */}
            <div className="bg-gray-800/30 border-2 border-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400 font-bold mb-2">Harvest Destination:</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg p-2 transition-all">
                  <input
                    type="radio"
                    name="depositDestination"
                    checked={farmerAuto.autoSell}
                    onChange={() => setDepositDestination(true)}
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-xl flex-shrink-0">🚢</span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white">Auto Sell</div>
                    <div className="text-xs text-gray-400 truncate">To export</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg p-2 transition-all">
                  <input
                    type="radio"
                    name="depositDestination"
                    checked={!farmerAuto.autoSell}
                    onChange={() => setDepositDestination(false)}
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-xl flex-shrink-0">🏭</span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white">Warehouse</div>
                    <div className="text-xs text-gray-400 truncate">Store harvests</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
