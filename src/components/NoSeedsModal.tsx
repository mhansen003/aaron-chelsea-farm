'use client';

import { CropType } from '@/types/game';

interface NoSeedsModalProps {
  cropType: Exclude<CropType, null>;
  onClose: () => void;
  onGoToShop: () => void;
}

const CROP_NAMES = {
  carrot: 'Carrot',
  wheat: 'Wheat',
  tomato: 'Tomato',
  pumpkin: 'Pumpkin',
  watermelon: 'Watermelon',
  peppers: 'Peppers',
  grapes: 'Grapes',
  oranges: 'Oranges',
  avocado: 'Avocado',
  rice: 'Rice',
  corn: 'Corn',
};

const CROP_EMOJIS = {
  carrot: '🥕',
  wheat: '🌾',
  tomato: '🍅',
  pumpkin: '🎃',
  watermelon: '🍉',
  peppers: '🌶️',
  grapes: '🍇',
  oranges: '🍊',
  avocado: '🥑',
  rice: '🍚',
  corn: '🌽',
};

export default function NoSeedsModal({ cropType, onClose, onGoToShop }: NoSeedsModalProps) {
  const cropName = CROP_NAMES[cropType];
  const cropEmoji = CROP_EMOJIS[cropType];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-red-900 to-red-950 text-white p-8 rounded-xl max-w-md w-full border-4 border-red-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-5xl">💸</span>
            Not Enough Money!
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="text-6xl mb-4">{cropEmoji}</div>
          <p className="text-xl mb-4">
            You can&apos;t afford <span className="font-bold text-yellow-300">{cropName}</span> seeds right now!
          </p>
          <p className="text-lg text-gray-300">
            Seeds are automatically purchased when you plant. Harvest and sell crops to earn money.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-lg transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
