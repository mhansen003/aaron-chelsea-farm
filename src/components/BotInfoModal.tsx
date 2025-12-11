import React from 'react';

type BotType = 'water' | 'harvest' | 'seed' | 'transport' | 'demolish';

interface BotInfo {
  name: string;
  icon: string;
  image: string;
  description: string;
  history: string;
  story: string;
  gradient: string;
  borderColor: string;
  textColor: string;
}

const botInfoData: Record<BotType, BotInfo> = {
  water: {
    name: 'Water Bot',
    icon: '💧',
    image: '/water-bot.png',
    description: 'Autonomous irrigation specialists that keep your crops hydrated',
    history: 'First deployed in Zone 0,0 during the Great Drought of Year 1, these tireless machines revolutionized farming by ensuring no plant ever thirsts.',
    story: `The first Water Bot, affectionately named "Droplet," was created when a farmer realized they couldn't keep up with watering their expanding fields. Working day and night, these bots carry 10 units of water and intelligently prioritize the driest crops. Legend has it that Droplet #001 is still running somewhere in the old farm zones, faithfully watering the same patch it started with all those years ago.`,
    gradient: 'from-cyan-900 via-blue-800 to-cyan-900',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-300'
  },
  harvest: {
    name: 'Harvest Bot',
    icon: '🌾',
    image: '/harvest-bot.png',
    description: 'Precision harvesting units designed for maximum efficiency',
    history: 'Born from the assembly line in the Great Barn, Harvest Bots were the second generation of farming automation, created after farmers struggled to collect ripened crops fast enough.',
    story: `These orange-plated workers are the backbone of any successful farm. With a capacity of 8 crops per run, they tirelessly scan fields for ripe produce, harvesting with mechanical precision. The most famous Harvest Bot, "Rusty," once collected 10,000 tomatoes in a single day during the Harvest Festival, earning a permanent place in the Farm Hall of Fame. They deposit their precious cargo at the barn before heading back out, their scissor-arms gleaming in the sun.`,
    gradient: 'from-orange-900 via-amber-800 to-orange-900',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-300'
  },
  seed: {
    name: 'Seed Bot',
    icon: '🌱',
    image: '/seed-bot.png',
    description: 'Intelligent planting systems that manage crop rotation and seeding operations',
    history: 'Developed by the Agricultural Innovation Lab, Seed Bots brought planning and strategy to planting. They were the first bots to use job-based AI, learning optimal planting patterns.',
    story: `Green and methodical, Seed Bots are the planners of the fleet. Unlike their reactive cousins, these bots think ahead, managing complex planting jobs with multiple target tiles. Farmers can program them with specific seeding patterns, and they'll execute perfectly every time. "Sprout," the prototype Seed Bot, accidentally created the famous spiral wheat field of Zone 2,3 when a glitch made it plant in a Fibonacci sequence. Farmers loved it so much, they made it a permanent pattern. Now Seed Bots can auto-buy seeds, making them truly autonomous farmers.`,
    gradient: 'from-green-900 via-lime-800 to-green-900',
    borderColor: 'border-green-400',
    textColor: 'text-green-300'
  },
  transport: {
    name: 'Transport Bot',
    icon: '🚚',
    image: '/transport-bot.png',
    description: 'Heavy-duty logistics bots that move goods to market and generate revenue',
    history: 'The Transport Bot program started when farmers realized they were rich in crops but poor in time to sell them. These purple haulers changed everything.',
    story: `With their massive 16-item cargo bays, Transport Bots are the money-makers of the operation. They lumber between the barn and market, their heavy treads leaving deep tracks in the soil. The most successful Transport Bot, "Big Purple," has transported over 1 million coins worth of goods in its lifetime. These bots are programmed with advanced market timing algorithms, though some farmers swear they've seen them take "joy rides" when markets are closed. Loading, transporting, selling - they handle the entire supply chain so you can focus on growing.`,
    gradient: 'from-purple-900 via-violet-800 to-purple-900',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-300'
  },
  demolish: {
    name: 'Demolish Bot',
    icon: '🚧',
    image: '/demolish-bot.png',
    description: 'Powerful clearing units that reclaim land and remove obstacles',
    history: 'When expansion became necessary, the Demolish Bots were commissioned. Built tough and relentless, they were designed to clear any obstacle - rocks, old structures, even stubborn tree stumps.',
    story: `Orange-armored and unstoppable, Demolish Bots are the wilderness tamers. Armed with hydraulic hammers and crushing tools, they turn impassable terrain into fertile farmland. The legendary "Boulder Basher" once cleared an entire mountain pass single-handedly, working for 72 hours straight without rest. These bots target specific coordinates and don't stop until the job is done. Some say on quiet nights you can still hear the distant "clang clang" of Demolish Bots working on the frontier zones, pushing back nature one obstacle at a time.`,
    gradient: 'from-orange-900 via-red-800 to-orange-900',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-300'
  }
};

interface BotInfoModalProps {
  botType: BotType;
  onClose: () => void;
}

export function BotInfoModal({ botType, onClose }: BotInfoModalProps) {
  const info = botInfoData[botType];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-gradient-to-br ${info.gradient} border-2 ${info.borderColor} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black/40 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{info.icon}</span>
            <div>
              <h2 className={`text-2xl font-bold ${info.textColor}`}>{info.name}</h2>
              <p className="text-sm text-gray-300">{info.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none px-3 py-1 hover:bg-white/10 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bot Image */}
          <div className="flex justify-center">
            <div className={`border-4 ${info.borderColor} rounded-lg overflow-hidden bg-black/40 p-4 shadow-xl`}>
              <img
                src={info.image}
                alt={info.name}
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          {/* History Section */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
              📜 Historical Record
            </h3>
            <p className="text-gray-200 leading-relaxed">
              {info.history}
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">
              📖 The Story
            </h3>
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">
              {info.story}
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className={`px-6 py-3 bg-gradient-to-r ${info.gradient} border-2 ${info.borderColor} rounded-lg font-bold ${info.textColor} hover:scale-105 transition-transform shadow-lg`}
            >
              Back to Fleet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
