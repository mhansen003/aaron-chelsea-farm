// Pre-built list of 200 bot names for My Bot Farm
export const BOT_NAMES = [
  // Agriculture-themed names (50)
  'Sprout', 'Harvest', 'Tiller', 'Planter', 'Reaper', 'Sower', 'Grower', 'Cultivar', 'Farmhand', 'Rancher',
  'Meadow', 'Barley', 'Rye', 'Oats', 'Buckwheat', 'Flax', 'Clover', 'Alfalfa', 'Haystack', 'Barnaby',
  'Combine', 'Thresher', 'Harrow', 'Plow', 'Scythe', 'Hoe', 'Rake', 'Spade', 'Pitchfork', 'Trowel',
  'Furrow', 'Seedling', 'Blossom', 'Bloom', 'Petal', 'Root', 'Stem', 'Leaf', 'Branch', 'Twig',
  'Mulch', 'Compost', 'Humus', 'Loam', 'Clay', 'Silt', 'Topsoil', 'Bedrock', 'Farmstead', 'Acreage',

  // Tech/Robot-themed names (50)
  'Bolt', 'Chip', 'Circuit', 'Widget', 'Gadget', 'Servo', 'Rotor', 'Piston', 'Gear', 'Cog',
  'Binary', 'Pixel', 'Nano', 'Micro', 'Macro', 'Mega', 'Giga', 'Tera', 'Byte', 'Bit',
  'Chrome', 'Steel', 'Alloy', 'Titanium', 'Carbon', 'Silicon', 'Copper', 'Bronze', 'Platinum', 'Silver',
  'Spark', 'Volt', 'Amp', 'Watt', 'Ohm', 'Tesla', 'Farad', 'Hertz', 'Newton', 'Joule',
  'Patch', 'Debug', 'Cache', 'RAM', 'ROM', 'CPU', 'GPU', 'USB', 'LED', 'LCD',

  // Nature-themed names (50)
  'Willow', 'Oak', 'Maple', 'Pine', 'Cedar', 'Birch', 'Aspen', 'Elm', 'Ash', 'Poplar',
  'River', 'Creek', 'Brook', 'Stream', 'Lake', 'Pond', 'Marsh', 'Swamp', 'Delta', 'Bay',
  'Boulder', 'Pebble', 'Stone', 'Rock', 'Cliff', 'Canyon', 'Valley', 'Hill', 'Ridge', 'Peak',
  'Breeze', 'Gale', 'Storm', 'Thunder', 'Lightning', 'Rain', 'Snow', 'Frost', 'Dew', 'Mist',
  'Dawn', 'Dusk', 'Twilight', 'Sunset', 'Sunrise', 'Moon', 'Star', 'Comet', 'Nova', 'Solar',

  // Personality-themed names (50)
  'Buddy', 'Champ', 'Scout', 'Ace', 'Duke', 'Chief', 'Boss', 'Captain', 'Major', 'Colonel',
  'Lucky', 'Happy', 'Jolly', 'Merry', 'Sunny', 'Bright', 'Cheery', 'Peppy', 'Zippy', 'Snappy',
  'Rusty', 'Dusty', 'Sparky', 'Rocky', 'Sandy', 'Windy', 'Stormy', 'Misty', 'Foggy', 'Cloudy',
  'Max', 'Rex', 'Tex', 'Dex', 'Flex', 'Vex', 'Hex', 'Pax', 'Jax', 'Zax',
  'Otto', 'Hugo', 'Bruno', 'Leo', 'Theo', 'Milo', 'Arlo', 'Enzo', 'Nico', 'Kilo'
];

/**
 * Get 10 random bot names from the list
 */
export function getRandomBotNames(count: number = 10): string[] {
  const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get a single random bot name
 */
export function getRandomBotName(): string {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
}
