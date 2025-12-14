'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import NextImage from 'next/image';
import {
  createInitialState,
  updateGameState,
  clearTile,
  plantSeed,
  harvestCrop,
  waterTile,
  placeSprinkler,
  sellBasket,
  buySeeds,
  buyTool,
  buySprinklers,
  buyWaterbots,
  buyHarvestbots,
  buySeedbots,
  buyTransportbots,
  buyDemolishbots,
  buyHunterbots,
  buyFertilizerbot,
  buyFertilizerBuilding,
  placeFertilizerBuilding,
  relocateFertilizerBuilding,
  updateSeedBotJobs,
  updateBotName,
  sellBot,
  uprootCrop,
  upgradeBag,
  buyBotFactory,
  buyWell,
  buyGarage,
  buySupercharger,
  buyHopper,
  placeBotFactory,
  placeWell,
  placeGarage,
  placeSupercharger,
  placeHopper,
  superchargeBot,
  hopperUpgrade,
  relocateGarage,
  relocateWell,
  relocateBotFactory,
  relocateSupercharger,
  relocateHopper,
  toggleAutoBuy,
  addTask,
  removeTask,
  depositToWarehouse,
  getCurrentGrid,
  updateCurrentGrid,
  createZone,
  getZoneKey,
  recordZoneEarnings,
  findGaragePosition,
  isTileQueued,
  addToPlayerQueue,
  removeFromPlayerQueue,
  GAME_CONFIG,
  CROP_INFO,
  SEEDBOT_COST,
  HUNTERBOT_COST,
  FERTILIZERBOT_COST,
  FERTILIZER_MAX_CAPACITY,
  getCurrentSeedCost,
  getCurrentSellPrice,
} from '@/lib/gameEngine';
import { GameState, CropType, ToolType, Tile, Zone, SaleRecord, BasketItem } from '@/types/game';
import Shop from './Shop';
import SellShop from './SellShop';
import ExportShop from './ExportShop';
import BotFactory from './BotFactory';
import WarehouseModal from './WarehouseModal';
import GarageModal from './GarageModal';
import SuperchargerModal from './SuperchargerModal';
import HopperModal from './HopperModal';
import ZonePreviewModal from './ZonePreviewModal';
import ZoneEarningsModal from './ZoneEarningsModal';
import EconomyModal from './EconomyModal';
import IncomeModal from './IncomeModal';
import NoSeedsModal from './NoSeedsModal';
import SeedBotConfigModal from './SeedBotConfigModal';
import BotNameModal from './BotNameModal';
import { BotInfoModal } from './BotInfoModal';
import { WellModal } from './WellModal';
import { updateMarketPrices } from '@/lib/marketEconomy';
import SaveGameModal from './SaveGameModal';
import WelcomeSplash from './WelcomeSplash';
import QuickStartTutorial from './QuickStartTutorial';
import TutorialModal from './TutorialModal';
import {
  generateSaveCode,
  loadFromSaveCode,
  saveToLocalStorage,
  loadFromLocalStorage,
  hasAutosave,
  clearAutosave,
} from '@/lib/saveSystem';

const COLORS: Record<string, string> = {
  grass: '#7cb342',
  dirt: '#8d6e63',
  rock: '#616161',
  tree: '#2e7d32',
  planted: '#9c8f5e',
  grown: '#fdd835',
  player: '#2196f3',
  grid: '#ffffff20',
  shop: '#ff9800',
  export: '#9c27b0',
  warehouse: '#795548',
  waterbot: '#00bcd4',
  arch: '#9e9e9e',
  archActive: '#4caf50',
  botFactory: '#ff5722',
  well: '#03a9f4',
  garage: '#424242',
  fertilizer: '#8bc34a',
  supercharger: '#ff6f00',
  hopper: '#795548',
  ocean: '#1976d2',
  sand: '#f4a460',
  seaweed: '#2e7d32',
  shells: '#faf0e6',
  cactus: '#228b22',
  rocks: '#808080',
  cave: '#2f4f4f',
  mountain: '#a9a9a9',
};

const TOOL_ICONS: Record<ToolType, string> = {
  hoe: '⛏️',
  seed_bag: '🌱',
  scythe: '🌾',
  watering_can: '💧',
  water_sprinkler: '💦',
  uproot: '🪓',
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Always start fresh - no auto-loading from localStorage
  // User must use save codes to load previous games
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [showShop, setShowShop] = useState(false);
  const [showSellShop, setShowSellShop] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showFarmNameEditor, setShowFarmNameEditor] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseZoneKey, setPurchaseZoneKey] = useState<string>('');
  const [sellMessage, setSellMessage] = useState<string>('');
  const [showSeedDropdown, setShowSeedDropdown] = useState(false);
  const [showBotFactory, setShowBotFactory] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [showSuperchargerModal, setShowSuperchargerModal] = useState(false);
  const [showHopperModal, setShowHopperModal] = useState(false);
  const [showZonePreview, setShowZonePreview] = useState(false);
  const [previewZone, setPreviewZone] = useState<Zone | null>(null);
  const [showNoSeedsModal, setShowNoSeedsModal] = useState(false);
  const [noSeedsCropType, setNoSeedsCropType] = useState<Exclude<CropType, null> | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [cursorType, setCursorType] = useState<string>('default');
  const [isMounted, setIsMounted] = useState(false);
  const [placementMode, setPlacementMode] = useState<'sprinkler' | 'botFactory' | 'well' | 'garage' | 'supercharger' | 'fertilizer' | 'hopper' | null>(null);
  const [showSeedBotConfig, setShowSeedBotConfig] = useState(false);
  const [selectedSeedBot, setSelectedSeedBot] = useState<string | null>(null);
  const [tileSelectionMode, setTileSelectionMode] = useState<{
    active: boolean;
    jobId: string;
    cropType: Exclude<CropType, null>;
    selectedTiles: Array<{ x: number; y: number }>;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartRow, setDragStartRow] = useState<number | null>(null);
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showEconomyModal, setShowEconomyModal] = useState(false);
  const [showBotInfoModal, setShowBotInfoModal] = useState<'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'hunter' | 'fertilizer' | null>(null);
  const [renamingBot, setRenamingBot] = useState<{ id: string; type: 'water' | 'harvest' | 'seed' | 'transport' | 'demolish' | 'hunter' | 'fertilizer'; currentName: string } | null>(null);
  const [showWellModal, setShowWellModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showBuildingPurchaseTip, setShowBuildingPurchaseTip] = useState(false);
  const [currentSaveCode, setCurrentSaveCode] = useState<string>('');
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [showMusicDropdown, setShowMusicDropdown] = useState(false);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [showFarmMusicSection, setShowFarmMusicSection] = useState(true);
  const [showFarmRapSection, setShowFarmRapSection] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isMusicPaused, setIsMusicPaused] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5); // Default 50% volume
  const [enabledSongs, setEnabledSongs] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5])); // Default: all regular farm songs enabled
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicVolumeRef = useRef<number>(0.5); // Track current volume for audio creation
  const waterSplashRef = useRef<HTMLAudioElement | null>(null);
  const grassImageRef = useRef<HTMLImageElement | null>(null);
  const grassImageRef2 = useRef<HTMLImageElement | null>(null);
  const grassImageRef3 = useRef<HTMLImageElement | null>(null);
  const farmerImageRef = useRef<HTMLImageElement | null>(null);
  const surferImageRef = useRef<HTMLImageElement | null>(null);
  const treeImageRef = useRef<HTMLImageElement | null>(null);
  const treeImageRef2 = useRef<HTMLImageElement | null>(null);
  const plantedCropImageRef = useRef<HTMLImageElement | null>(null);
  const carrotsImageRef = useRef<HTMLImageElement | null>(null);
  const wheatImageRef = useRef<HTMLImageElement | null>(null);
  const tomatoImageRef = useRef<HTMLImageElement | null>(null);
  const pumpkinImageRef = useRef<HTMLImageElement | null>(null);
  const watermelonImageRef = useRef<HTMLImageElement | null>(null);
  const peppersImageRef = useRef<HTMLImageElement | null>(null);
  const grapesImageRef = useRef<HTMLImageElement | null>(null);
  const orangesImageRef = useRef<HTMLImageElement | null>(null);
  const avocadoImageRef = useRef<HTMLImageElement | null>(null);
  const riceImageRef = useRef<HTMLImageElement | null>(null);
  const cornImageRef = useRef<HTMLImageElement | null>(null);
  const rockImageRef = useRef<HTMLImageElement | null>(null);
  const rockImageRef2 = useRef<HTMLImageElement | null>(null);
  const rockImageRef3 = useRef<HTMLImageElement | null>(null);
  const rockImageRef4 = useRef<HTMLImageElement | null>(null);
  const dirtImageRef = useRef<HTMLImageElement | null>(null);
  const shopImageRef = useRef<HTMLImageElement | null>(null);
  const exportImageRef = useRef<HTMLImageElement | null>(null);
  const warehouseImageRef = useRef<HTMLImageElement | null>(null);
  const warehouseFullImageRef = useRef<HTMLImageElement | null>(null);
  const sprinklerImageRef = useRef<HTMLImageElement | null>(null);
  const waterBotImageRef = useRef<HTMLImageElement | null>(null);
  const harvestBotImageRef = useRef<HTMLImageElement | null>(null);
  const seedBotImageRef = useRef<HTMLImageElement | null>(null);
  const transportBotImageRef = useRef<HTMLImageElement | null>(null);
  const demolishBotImageRef = useRef<HTMLImageElement | null>(null);
  const hunterBotImageRef = useRef<HTMLImageElement | null>(null);
  const rabbitImageRef = useRef<HTMLImageElement | null>(null);
  const chargedImageRef = useRef<HTMLImageElement | null>(null);
  const archFarmImageRef = useRef<HTMLImageElement | null>(null);
  const archBeachImageRef = useRef<HTMLImageElement | null>(null);
  const archBarnImageRef = useRef<HTMLImageElement | null>(null);
  const archMountainImageRef = useRef<HTMLImageElement | null>(null);
  const archDesertImageRef = useRef<HTMLImageElement | null>(null);
  const workingImageRef = useRef<HTMLImageElement | null>(null);
  const coinImageRef = useRef<HTMLImageElement | null>(null);
  const clearToolImageRef = useRef<HTMLImageElement | null>(null);
  const waterdropletImageRef = useRef<HTMLImageElement | null>(null);
  const harvestImageRef = useRef<HTMLImageElement | null>(null);
  const botFactoryImageRef = useRef<HTMLImageElement | null>(null);
  const wellImageRef = useRef<HTMLImageElement | null>(null);
  const garageImageRef = useRef<HTMLImageElement | null>(null);
  const superchargerImageRef = useRef<HTMLImageElement | null>(null);
  const fertilizerBuildingImageRef = useRef<HTMLImageElement | null>(null);
  const fertilizerBotImageRef = useRef<HTMLImageElement | null>(null);
  const hopperImageRef = useRef<HTMLImageElement | null>(null);
  const oceanImageRef = useRef<HTMLImageElement | null>(null);
  const sandImageRef = useRef<HTMLImageElement | null>(null);
  const seaweedImageRef = useRef<HTMLImageElement | null>(null);
  const shellsImageRef = useRef<HTMLImageElement | null>(null);
  const cactusImageRef = useRef<HTMLImageElement | null>(null);
  const rocksImageRef = useRef<HTMLImageElement | null>(null);
  const caveImageRef = useRef<HTMLImageElement | null>(null);
  const mountainImageRef = useRef<HTMLImageElement | null>(null);

  // No auto-loading from localStorage - user must use save codes
  // This prevents corrupted saves from causing crashes

  // Load all non-themed textures (themed tiles loaded separately based on zone)
  useEffect(() => {
    const farmerImg = new Image();
    farmerImg.src = '/farmer.png';
    farmerImg.onload = () => {
      farmerImageRef.current = farmerImg;
    };

    const plantedImg = new Image();
    plantedImg.src = '/planted crop.png';
    plantedImg.onload = () => {
      plantedCropImageRef.current = plantedImg;
    };

    const carrotsImg = new Image();
    carrotsImg.src = '/carrots.png';
    carrotsImg.onload = () => {
      carrotsImageRef.current = carrotsImg;
    };

    const wheatImg = new Image();
    wheatImg.src = '/wheat.png';
    wheatImg.onload = () => {
      wheatImageRef.current = wheatImg;
    };

    const tomatoImg = new Image();
    tomatoImg.src = '/tomato.png';
    tomatoImg.onload = () => {
      tomatoImageRef.current = tomatoImg;
    };

    const pumpkinImg = new Image();
    pumpkinImg.src = '/pumpkin.png';
    pumpkinImg.onload = () => {
      pumpkinImageRef.current = pumpkinImg;
    };

    const watermelonImg = new Image();
    watermelonImg.src = '/watermelon.png';
    watermelonImg.onload = () => {
      watermelonImageRef.current = watermelonImg;
    };

    const peppersImg = new Image();
    peppersImg.src = '/peppers.png';
    peppersImg.onload = () => {
      peppersImageRef.current = peppersImg;
    };

    const grapesImg = new Image();
    grapesImg.src = '/grapes.png';
    grapesImg.onload = () => {
      grapesImageRef.current = grapesImg;
    };

    const orangesImg = new Image();
    orangesImg.src = '/oranges.png';
    orangesImg.onload = () => {
      orangesImageRef.current = orangesImg;
    };

    const avocadoImg = new Image();
    avocadoImg.src = '/avocado.png';
    avocadoImg.onload = () => {
      avocadoImageRef.current = avocadoImg;
    };

    const riceImg = new Image();
    riceImg.src = '/rice.png';
    riceImg.onload = () => {
      riceImageRef.current = riceImg;
    };

    const cornImg = new Image();
    cornImg.src = '/corn.png';
    cornImg.onload = () => {
      cornImageRef.current = cornImg;
    };

    const shopImg = new Image();
    shopImg.src = '/shop.png';
    shopImg.onload = () => {
      shopImageRef.current = shopImg;
    };

    const exportImg = new Image();
    exportImg.src = '/export.png';
    exportImg.onload = () => {
      exportImageRef.current = exportImg;
    };

    const warehouseImg = new Image();
    warehouseImg.src = '/warehouse.png';
    warehouseImg.onload = () => {
      warehouseImageRef.current = warehouseImg;
    };

    const warehouseFullImg = new Image();
    warehouseFullImg.src = '/warehouse-full.png';
    warehouseFullImg.onload = () => {
      warehouseFullImageRef.current = warehouseFullImg;
    };

    const sprinklerImg = new Image();
    sprinklerImg.src = '/sprinklers.png';
    sprinklerImg.onload = () => {
      sprinklerImageRef.current = sprinklerImg;
    };

    const waterBotImg = new Image();
    waterBotImg.src = '/water-bot.png';
    waterBotImg.onload = () => {
      waterBotImageRef.current = waterBotImg;
    };

    const harvestBotImg = new Image();
    harvestBotImg.src = '/harvest-bot.png';
    harvestBotImg.onload = () => {
      harvestBotImageRef.current = harvestBotImg;
    };

    const seedBotImg = new Image();
    seedBotImg.src = '/seed-bot.png';
    seedBotImg.onload = () => {
      seedBotImageRef.current = seedBotImg;
    };

    const transportBotImg = new Image();
    transportBotImg.src = '/transport bot.png';
    transportBotImg.onload = () => {
      transportBotImageRef.current = transportBotImg;
    };

    const demolishBotImg = new Image();
    demolishBotImg.src = '/demolish-bot.png';
    demolishBotImg.onload = () => {
      demolishBotImageRef.current = demolishBotImg;
    };

    const hunterBotImg = new Image();
    hunterBotImg.src = '/hunter.png';
    hunterBotImg.onload = () => {
      hunterBotImageRef.current = hunterBotImg;
    };

    const rabbitImg = new Image();
    rabbitImg.src = '/rabbit.png';
    rabbitImg.onload = () => {
      rabbitImageRef.current = rabbitImg;
    };

    const fertilizerBuildingImg = new Image();
    fertilizerBuildingImg.src = '/fertilizer-building.png';
    fertilizerBuildingImg.onload = () => {
      fertilizerBuildingImageRef.current = fertilizerBuildingImg;
    };

    const fertilizerBotImg = new Image();
    fertilizerBotImg.src = '/fertilizer-bot.png';
    fertilizerBotImg.onload = () => {
      fertilizerBotImageRef.current = fertilizerBotImg;
    };

    const chargedImg = new Image();
    chargedImg.src = '/charged.png';
    chargedImg.onload = () => {
      chargedImageRef.current = chargedImg;
    };

    const archFarmImg = new Image();
    archFarmImg.src = '/arch-farm.png';
    archFarmImg.onload = () => {
      archFarmImageRef.current = archFarmImg;
    };

    const archBeachImg = new Image();
    archBeachImg.src = '/arch-beach.png';
    archBeachImg.onload = () => {
      archBeachImageRef.current = archBeachImg;
    };

    const archBarnImg = new Image();
    archBarnImg.src = '/arch-barn.png';
    archBarnImg.onload = () => {
      archBarnImageRef.current = archBarnImg;
    };

    const archMountainImg = new Image();
    archMountainImg.src = '/arch-mountain.png';
    archMountainImg.onload = () => {
      archMountainImageRef.current = archMountainImg;
    };

    const archDesertImg = new Image();
    archDesertImg.src = '/arch-desert.png';
    archDesertImg.onload = () => {
      archDesertImageRef.current = archDesertImg;
    };

    const workingImg = new Image();
    workingImg.src = '/working.png';
    workingImg.onload = () => {
      workingImageRef.current = workingImg;
    };

    const coinImg = new Image();
    coinImg.src = '/coin.png';
    coinImg.onload = () => {
      coinImageRef.current = coinImg;
    };

    const clearToolImg = new Image();
    clearToolImg.src = '/clear tool.png';
    clearToolImg.onload = () => {
      clearToolImageRef.current = clearToolImg;
    };

    const waterdropletImg = new Image();
    waterdropletImg.src = '/waterdroplet.png';
    waterdropletImg.onload = () => {
      waterdropletImageRef.current = waterdropletImg;
    };

    const harvestImg = new Image();
    harvestImg.src = '/harvest.png';
    harvestImg.onload = () => {
      harvestImageRef.current = harvestImg;
    };

    const botFactoryImg = new Image();
    botFactoryImg.src = '/mechanic.png';
    botFactoryImg.onload = () => {
      botFactoryImageRef.current = botFactoryImg;
    };

    const wellImg = new Image();
    wellImg.src = '/well.png';
    wellImg.onload = () => {
      wellImageRef.current = wellImg;
    };

    const garageImg = new Image();
    garageImg.src = '/garage.png';
    garageImg.onload = () => {
      garageImageRef.current = garageImg;
    };

    // Load supercharger image
    const superchargerImg = new Image();
    superchargerImg.src = '/supercharge.png';
    superchargerImg.onload = () => {
      superchargerImageRef.current = superchargerImg;
    };


    // Load hopper image
    const hopperImg = new Image();
    hopperImg.src = '/hopper.png';
    hopperImg.onload = () => {
      hopperImageRef.current = hopperImg;
    };
  }, []);

  // Load themed tile images based on current zone
  useEffect(() => {
    const currentZone = gameState.zones[getZoneKey(gameState.currentZone.x, gameState.currentZone.y)];
    const theme = currentZone?.theme || 'farm';

    // Load grass (variant 1 - most common)
    const grassImg = new Image();
    grassImg.src = `/${theme}-grass.jpg`;
    grassImg.onerror = () => {
      // Fallback to farm theme if themed image doesn't exist
      grassImg.src = '/farm-grass.jpg';
    };
    grassImg.onload = () => {
      grassImageRef.current = grassImg;
    };

    // Load grass variant 2
    const grassImg2 = new Image();
    grassImg2.src = '/grass2.png';
    grassImg2.onload = () => {
      grassImageRef2.current = grassImg2;
    };

    // Load grass variant 3
    const grassImg3 = new Image();
    grassImg3.src = '/grass3.png';
    grassImg3.onload = () => {
      grassImageRef3.current = grassImg3;
    };

    // Load dirt
    const dirtImg = new Image();
    dirtImg.src = `/${theme}-dirt.png`;
    dirtImg.onerror = () => {
      dirtImg.src = '/farm-dirt.png';
    };
    dirtImg.onload = () => {
      dirtImageRef.current = dirtImg;
    };

    // Load rocks (variant 1)
    const rockImg = new Image();
    rockImg.src = `/${theme}-rocks.png`;
    rockImg.onerror = () => {
      rockImg.src = '/farm-rocks.png';
    };
    rockImg.onload = () => {
      rockImageRef.current = rockImg;
    };

    // Load rocks variant 2
    const rockImg2 = new Image();
    rockImg2.src = `/${theme}-rocks2.png`;
    rockImg2.onerror = () => {
      rockImg2.src = '/farm-rocks2.png';
    };
    rockImg2.onload = () => {
      rockImageRef2.current = rockImg2;
    };

    // Load rocks variant 3
    const rockImg3 = new Image();
    rockImg3.src = `/${theme}-rocks3.png`;
    rockImg3.onerror = () => {
      rockImg3.src = '/farm-rocks3.png';
    };
    rockImg3.onload = () => {
      rockImageRef3.current = rockImg3;
    };

    // Load rocks variant 4
    const rockImg4 = new Image();
    rockImg4.src = `/${theme}-rocks4.png`;
    rockImg4.onerror = () => {
      rockImg4.src = '/farm-rocks4.png';
    };
    rockImg4.onload = () => {
      rockImageRef4.current = rockImg4;
    };

    // Load forest/trees (variant 1)
    const treeImg = new Image();
    treeImg.src = `/${theme}-forest.png`;
    treeImg.onerror = () => {
      treeImg.src = '/farm-forest.png';
    };
    treeImg.onload = () => {
      treeImageRef.current = treeImg;
    };

    // Load forest/trees variant 2
    const treeImg2 = new Image();
    treeImg2.src = `/${theme}-forest2.png`;
    treeImg2.onerror = () => {
      treeImg2.src = '/farm-forest2.png';
    };
    treeImg2.onload = () => {
      treeImageRef2.current = treeImg2;
    };

    // Load themed tiles (beach, desert, mountain)
    if (theme === 'beach') {
      const oceanImg = new Image();
      oceanImg.src = '/ocean.png';
      oceanImg.onload = () => {
        oceanImageRef.current = oceanImg;
      };

      const sandImg = new Image();
      sandImg.src = '/sand.png';
      sandImg.onload = () => {
        sandImageRef.current = sandImg;
      };

      const seaweedImg = new Image();
      seaweedImg.src = '/seaweed.png';
      seaweedImg.onload = () => {
        seaweedImageRef.current = seaweedImg;
      };

      const shellsImg = new Image();
      shellsImg.src = '/shells.png';
      shellsImg.onload = () => {
        shellsImageRef.current = shellsImg;
      };

      // Load surfer farmer for beach theme
      const surferImg = new Image();
      surferImg.src = '/surfer.png';
      surferImg.onload = () => {
        surferImageRef.current = surferImg;
      };
    } else if (theme === 'desert') {
      const sandImg = new Image();
      sandImg.src = '/sand.png';
      sandImg.onload = () => {
        sandImageRef.current = sandImg;
      };

      const cactusImg = new Image();
      cactusImg.src = '/cactus.png';
      cactusImg.onload = () => {
        cactusImageRef.current = cactusImg;
      };

      const rocksImg = new Image();
      rocksImg.src = '/rocks.png';
      rocksImg.onload = () => {
        rocksImageRef.current = rocksImg;
      };
    } else if (theme === 'mountain') {
      const mountainImg = new Image();
      mountainImg.src = '/mountain.png';
      mountainImg.onload = () => {
        mountainImageRef.current = mountainImg;
      };

      const caveImg = new Image();
      caveImg.src = '/cave-entrance.png';
      caveImg.onload = () => {
        caveImageRef.current = caveImg;
      };

      const rocksImg = new Image();
      rocksImg.src = '/rocks.png';
      rocksImg.onload = () => {
        rocksImageRef.current = rocksImg;
      };
    }
  }, [gameState.currentZone.x, gameState.currentZone.y, gameState.zones]);

  // Save game state to localStorage whenever it changes
  // BUT: Don't save while welcome screen is showing (to preserve existing autosave)
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted && !showWelcome) {
      saveToLocalStorage(gameState);
    }
  }, [gameState, isMounted, showWelcome]);

  // Set mounted state to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Removed auto-open shop effect - shop now opens only on click or 'B' key

  // Background music and sound effects
  useEffect(() => {
    // Water splash sound effect (one-time setup)
    waterSplashRef.current = new Audio('/water splash.mp3');
    waterSplashRef.current.volume = 0.4;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (waterSplashRef.current) {
        waterSplashRef.current = null;
      }
    };
  }, []);

  // Music configuration - farm zone has multiple songs, other zones have single tracks
  const farmSongs = [
    { name: 'Morning Meadow', file: '/farm.mp3' },
    { name: 'Peaceful Pastures', file: '/farm1.mp3' },
    { name: 'Gentle Harvest', file: '/farm2.mp3' },
    { name: 'Quiet Fields', file: '/farm3.mp3' },
    { name: 'Sunset Valley', file: '/farm4.mp3' },
    { name: 'Tranquil Garden', file: '/farm5.mp3' },
  ];

  const farmRapSongs = [
    { name: 'Row Talk', file: '/rap-row_talk.mp3' },
    { name: 'Yeah', file: '/rap-yeah.mp3' },
    { name: 'Service Mode', file: '/rap-servcie_mode.mp3' },
  ];

  // Use only calm farm songs for music rotation (rap songs are manual-select only)
  const allFarmSongs = useMemo(() => farmSongs, []);

  // Get a random enabled song index (excluding current song)
  const getRandomEnabledSong = useCallback((currentIndex: number) => {
    const enabledIndices = Array.from(enabledSongs).filter(i => i !== currentIndex);
    if (enabledIndices.length === 0) {
      // If no other songs enabled, pick any song except current
      const allIndices = Array.from({ length: allFarmSongs.length }, (_, i) => i).filter(i => i !== currentIndex);
      return allIndices[Math.floor(Math.random() * allIndices.length)] || 0;
    }
    return enabledIndices[Math.floor(Math.random() * enabledIndices.length)];
  }, [enabledSongs, allFarmSongs.length]);

  const singleZoneMusic: Record<string, string> = {
    beach: '/beach.mp3',
    barn: '/barn.mp3',
    mountain: '/mountains.mp3',
    desert: '/desert.mp3',
  };

  // Check if current zone is farm
  const isInFarmZone = useCallback(() => {
    const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
    const currentZone = gameState.zones[currentZoneKey];
    return currentZone?.theme === 'farm';
  }, [gameState.currentZone.x, gameState.currentZone.y, gameState.zones]);

  // Get random song index (excluding current)
  const getRandomSongIndex = useCallback((currentIndex: number, maxIndex: number) => {
    if (maxIndex <= 1) return 0;
    let newIndex = Math.floor(Math.random() * maxIndex);
    while (newIndex === currentIndex && maxIndex > 1) {
      newIndex = Math.floor(Math.random() * maxIndex);
    }
    return newIndex;
  }, []);

  // Album art loading removed for instant performance - music streams on-demand without downloads

  // Zone-specific music switching - farm has playlist, others loop single track
  useEffect(() => {
    const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
    const currentZone = gameState.zones[currentZoneKey];
    const zonetheme = currentZone?.theme || 'farm';
    const isFarm = zonetheme === 'farm';

    let musicFile: string;

    // Pause and cleanup old audio
    if (audioRef.current) {
      audioRef.current.pause();
      // Remove all event listeners by setting src to empty
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (isFarm) {
      // Farm zone: Pick a random enabled song from the playlist
      const randomIndex = getRandomEnabledSong(-1);
      setCurrentSongIndex(randomIndex);
      musicFile = allFarmSongs[randomIndex].file;

      // Create new audio for farm zone
      audioRef.current = new Audio(musicFile);
      audioRef.current.loop = false; // We'll handle song advancement manually
      audioRef.current.volume = musicVolumeRef.current;

      // When song ends, play next random enabled song
      const handleSongEnd = () => {
        setCurrentSongIndex(prevIndex => {
          const nextIndex = getRandomEnabledSong(prevIndex);

          if (audioRef.current && !isMusicMuted) {
            audioRef.current.src = allFarmSongs[nextIndex].file;
            audioRef.current.play().catch(() => {});
          }

          return nextIndex;
        });
      };
      audioRef.current.addEventListener('ended', handleSongEnd);
    } else {
      // Other zones: Play single looping track
      musicFile = singleZoneMusic[zonetheme] || '/farm.mp3';
      audioRef.current = new Audio(musicFile);
      audioRef.current.loop = true; // Loop continuously for non-farm zones
      audioRef.current.volume = musicVolumeRef.current;
    }

    // Try to play music (only if not muted)
    if (!isMusicMuted) {
      audioRef.current.play().catch(() => {
        // If autoplay fails, try again on first user interaction
        const startAudio = () => {
          if (!isMusicMuted) {
            audioRef.current?.play();
          }
          document.removeEventListener('click', startAudio);
          document.removeEventListener('keydown', startAudio);
        };
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
      });
    }
  }, [gameState.currentZone.x, gameState.currentZone.y, getRandomEnabledSong, isMusicMuted, allFarmSongs]);

  // Handle manual song selection (farm zone only)
  const handleSongSelect = useCallback((index: number) => {
    if (isInFarmZone() && index >= 0 && index < allFarmSongs.length) {
      setCurrentSongIndex(index);
      setShowMusicDropdown(false);

      // Selecting a song should unmute if currently muted
      if (isMusicMuted) {
        setIsMusicMuted(false);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = allFarmSongs[index].file;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isInFarmZone, isMusicMuted, allFarmSongs]);

  // Handle manual rap song selection (manual only, not part of auto-rotation)
  const handleRapSongSelect = useCallback((rapIndex: number) => {
    if (isInFarmZone() && rapIndex >= 0 && rapIndex < farmRapSongs.length) {
      setShowMusicDropdown(false);

      // Selecting a song should unmute if currently muted
      if (isMusicMuted) {
        setIsMusicMuted(false);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = farmRapSongs[rapIndex].file;
        // Set to not loop - when rap song ends, go back to farm music rotation
        audioRef.current.loop = false;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isInFarmZone, isMusicMuted]);

  // Handle music mute/unmute
  const toggleMusicMute = useCallback(() => {
    setIsMusicMuted(prev => {
      const newMutedState = !prev;
      if (audioRef.current) {
        if (newMutedState) {
          // Muting
          audioRef.current.pause();
        } else {
          // Unmuting
          audioRef.current.play().catch(() => {});
        }
      }
      return newMutedState;
    });
    setShowMusicDropdown(false);
  }, []);

  // Skip to next song
  const nextSong = useCallback(() => {
    if (isInFarmZone()) {
      const nextIndex = getRandomEnabledSong(currentSongIndex);
      handleSongSelect(nextIndex);
    }
  }, [isInFarmZone, currentSongIndex, getRandomEnabledSong, handleSongSelect]);

  // Toggle pause/play
  const togglePausePlay = useCallback(() => {
    if (audioRef.current) {
      if (isMusicPaused) {
        audioRef.current.play().catch(() => {});
        setIsMusicPaused(false);
      } else {
        audioRef.current.pause();
        setIsMusicPaused(true);
      }
    }
  }, [isMusicPaused]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    musicVolumeRef.current = newVolume; // Update ref for zone changes
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Toggle song enabled for auto-rotation
  const toggleSongEnabled = useCallback((index: number) => {
    setEnabledSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Close music dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showMusicDropdown && !target.closest('.relative')) {
        setShowMusicDropdown(false);
      }
    };

    if (showMusicDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMusicDropdown]);

  // Close crop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showCropDropdown && !target.closest('.crop-dropdown-container')) {
        setShowCropDropdown(false);
      }
    };

    if (showCropDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCropDropdown]);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime < 1000) {
        setGameState(prev => {
          const updated = updateGameState(prev, deltaTime);
          // TEMPORARY: Market price updates disabled due to module bundling issue
          // TODO: Move updateMarketPrices to gameEngine.ts
          return updated; // updateMarketPrices(updated);
        });
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // NOTE: Cursor is now handled dynamically in handleCanvasMouseMove based on hovered tile

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get current zone and its bots
    const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
    const currentZone = gameState.zones[currentZoneKey];
    const waterBots = currentZone?.waterBots || [];
    const harvestBots = currentZone?.harvestBots || [];
    const seedBots = currentZone?.seedBots || [];
    const transportBots = currentZone?.transportBots || [];
    const demolishBots = currentZone?.demolishBots || [];

    // Clear canvas with green farm background
    ctx.fillStyle = '#7cb342'; // Green grass color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    const currentGrid = getCurrentGrid(gameState);
    const gridRef = currentGrid; // Reference for closure capture

    // Find garage position for bot despawn/respawn logic
    const garagePos = findGaragePosition(currentGrid);

    currentGrid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const px = x * GAME_CONFIG.tileSize;
        const py = y * GAME_CONFIG.tileSize;

        // Tile background
        if (tile.type === 'grass') {
          // Select the appropriate grass variant image
          let grassImage = grassImageRef.current;
          if (tile.variant === 2 && grassImageRef2.current) {
            grassImage = grassImageRef2.current;
          } else if (tile.variant === 3 && grassImageRef3.current) {
            grassImage = grassImageRef3.current;
          }
          // Draw grass texture
          if (grassImage) {
            ctx.drawImage(grassImage, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
        } else if (tile.type === 'tree') {
          // Draw grass background first, then tree sprite
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          // Select the appropriate tree variant image
          const treeImage = tile.variant === 2 && treeImageRef2.current
            ? treeImageRef2.current
            : treeImageRef.current;
          if (treeImage) {
            ctx.drawImage(treeImage, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
        } else if (tile.type === 'rock') {
          // Draw grass background first, then rock sprite
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          // Select the appropriate rock variant image
          let rockImage = rockImageRef.current;
          if (tile.variant === 2 && rockImageRef2.current) {
            rockImage = rockImageRef2.current;
          } else if (tile.variant === 3 && rockImageRef3.current) {
            rockImage = rockImageRef3.current;
          } else if (tile.variant === 4 && rockImageRef4.current) {
            rockImage = rockImageRef4.current;
          }
          if (rockImage) {
            ctx.drawImage(rockImage, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
        } else if (tile.type === 'dirt' && dirtImageRef.current) {
          // Draw grass background first, then dirt sprite on top
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'shop' && shopImageRef.current) {
          // Draw grass background
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          // Shop building uses 1024x1024 sprite sheet with 4 quadrants (512x512 each)
          // Determine which quadrant to draw based on position
          const offsetX = (x - 0) * 512; // x can be 0 or 1
          const offsetY = (y - 0) * 512; // y can be 0 or 1
          ctx.drawImage(
            shopImageRef.current,
            offsetX, offsetY, 512, 512, // Source: extract quadrant from sprite
            px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize // Dest: draw at tile position
          );
        } else if (tile.type === 'export' && exportImageRef.current) {
          // Draw grass background
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          // Export building uses 1024x1024 sprite sheet with 4 quadrants (512x512 each)
          const offsetX = (x - 14) * 512; // x can be 14 or 15
          const offsetY = (y - 0) * 512; // y can be 0 or 1 (top of grid)
          ctx.drawImage(
            exportImageRef.current,
            offsetX, offsetY, 512, 512,
            px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
          );
        } else if (tile.type === 'warehouse') {
          // Draw grass background
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Select warehouse image based on inventory
          const hasInventory = gameState.warehouse.length > 0;
          const warehouseImg = (hasInventory && warehouseFullImageRef.current)
            ? warehouseFullImageRef.current
            : warehouseImageRef.current;

          // Warehouse building uses 1024x1024 sprite sheet with 4 quadrants (512x512 each)
          if (warehouseImg) {
            const offsetX = (x - 14) * 512; // x can be 14 or 15
            const offsetY = (y - 10) * 512; // y can be 10 or 11 (bottom of grid)
            ctx.drawImage(
              warehouseImg,
              offsetX, offsetY, 512, 512,
              px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
            );
          }
        } else if (tile.isConstructing && workingImageRef.current) {
          // Draw grass background for construction site
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Check if this is a 2x2 building construction (bot factory, well, garage, supercharger)
          const is2x2Building = tile.constructionTarget === 'botFactory' ||
                                tile.constructionTarget === 'well' ||
                                tile.constructionTarget === 'garage' ||
                                tile.constructionTarget === 'supercharger';

          // For 2x2 buildings, only draw working icon on top-left tile
          const isTopLeft = is2x2Building &&
                           x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
                           gridRef[y]?.[x + 1]?.isConstructing &&
                           gridRef[y + 1]?.[x]?.isConstructing &&
                           gridRef[y + 1]?.[x + 1]?.isConstructing;

          // Draw working icon (on all tiles for 1x1, only top-left for 2x2)
          if (!is2x2Building || isTopLeft) {
            // For 2x2, draw larger working icon across the area
            const iconSize = is2x2Building ? GAME_CONFIG.tileSize * 2 : GAME_CONFIG.tileSize;
            ctx.drawImage(
              workingImageRef.current,
              px, py, iconSize, iconSize
            );
          }

          // Draw construction progress bar (only on top-left for 2x2)
          if ((!is2x2Building || isTopLeft) && tile.constructionStartTime !== undefined && tile.constructionDuration !== undefined) {
            const elapsedTime = gameState.gameTime - tile.constructionStartTime;
            const progress = Math.min(100, (elapsedTime / tile.constructionDuration) * 100);

            const barHeight = 12;
            const barWidth = is2x2Building ? (GAME_CONFIG.tileSize * 2 - 16) : (GAME_CONFIG.tileSize - 8);
            const barY = py + (is2x2Building ? GAME_CONFIG.tileSize * 2 : GAME_CONFIG.tileSize) - barHeight - 8;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(px + 8, barY, barWidth, barHeight);

            // Progress
            const progressWidth = (barWidth * progress) / 100;
            ctx.fillStyle = '#ff9800'; // Orange for construction
            ctx.fillRect(px + 8, barY, progressWidth, barHeight);

            // Border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 8, barY, barWidth, barHeight);

            // Progress text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(progress)}%`, px + 8 + barWidth / 2, barY + barHeight / 2 + 4);
          }
        } else if (tile.type === 'botFactory' && botFactoryImageRef.current) {
          // Draw grass background (on all 4 tiles)
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Find which position this tile is in the 2x2 building
          let offsetX = 0;
          let offsetY = 0;

          // Check if this is top-left
          if (x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
              gridRef[y]?.[x + 1]?.type === 'botFactory' &&
              gridRef[y + 1]?.[x]?.type === 'botFactory' &&
              gridRef[y + 1]?.[x + 1]?.type === 'botFactory') {
            offsetX = 0;
            offsetY = 0;
          }
          // Check if this is top-right
          else if (x > 0 && y + 1 < GAME_CONFIG.gridHeight &&
                   gridRef[y]?.[x - 1]?.type === 'botFactory' &&
                   gridRef[y + 1]?.[x]?.type === 'botFactory' &&
                   gridRef[y + 1]?.[x - 1]?.type === 'botFactory') {
            offsetX = 512;
            offsetY = 0;
          }
          // Check if this is bottom-left
          else if (x + 1 < GAME_CONFIG.gridWidth && y > 0 &&
                   gridRef[y]?.[x + 1]?.type === 'botFactory' &&
                   gridRef[y - 1]?.[x]?.type === 'botFactory' &&
                   gridRef[y - 1]?.[x + 1]?.type === 'botFactory') {
            offsetX = 0;
            offsetY = 512;
          }
          // Check if this is bottom-right
          else if (x > 0 && y > 0 &&
                   gridRef[y]?.[x - 1]?.type === 'botFactory' &&
                   gridRef[y - 1]?.[x]?.type === 'botFactory' &&
                   gridRef[y - 1]?.[x - 1]?.type === 'botFactory') {
            offsetX = 512;
            offsetY = 512;
          }

          // Draw the appropriate quadrant
          ctx.drawImage(
            botFactoryImageRef.current,
            offsetX, offsetY, 512, 512,
            px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
          );
        } else if (tile.type === 'well' && wellImageRef.current) {
          // Draw grass background (on all 4 tiles)
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Find which position this tile is in the 2x2 building
          let offsetX = 0;
          let offsetY = 0;

          // Check if this is top-left
          if (x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
              gridRef[y]?.[x + 1]?.type === 'well' &&
              gridRef[y + 1]?.[x]?.type === 'well' &&
              gridRef[y + 1]?.[x + 1]?.type === 'well') {
            offsetX = 0;
            offsetY = 0;
          }
          // Check if this is top-right
          else if (x > 0 && y + 1 < GAME_CONFIG.gridHeight &&
                   gridRef[y]?.[x - 1]?.type === 'well' &&
                   gridRef[y + 1]?.[x]?.type === 'well' &&
                   gridRef[y + 1]?.[x - 1]?.type === 'well') {
            offsetX = 512;
            offsetY = 0;
          }
          // Check if this is bottom-left
          else if (x + 1 < GAME_CONFIG.gridWidth && y > 0 &&
                   gridRef[y]?.[x + 1]?.type === 'well' &&
                   gridRef[y - 1]?.[x]?.type === 'well' &&
                   gridRef[y - 1]?.[x + 1]?.type === 'well') {
            offsetX = 0;
            offsetY = 512;
          }
          // Check if this is bottom-right
          else if (x > 0 && y > 0 &&
                   gridRef[y]?.[x - 1]?.type === 'well' &&
                   gridRef[y - 1]?.[x]?.type === 'well' &&
                   gridRef[y - 1]?.[x - 1]?.type === 'well') {
            offsetX = 512;
            offsetY = 512;
          }

          // Draw the appropriate quadrant
          ctx.drawImage(
            wellImageRef.current,
            offsetX, offsetY, 512, 512,
            px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
          );
        } else if (tile.type === 'garage' && garageImageRef.current) {
          // Draw grass background (on all 4 tiles)
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Find which position this tile is in the 2x2 building
          // Check all 4 possible positions: top-left, top-right, bottom-left, bottom-right
          let offsetX = 0;
          let offsetY = 0;

          // Check if this is top-left (has neighbors to right and bottom)
          if (x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
              gridRef[y]?.[x + 1]?.type === 'garage' &&
              gridRef[y + 1]?.[x]?.type === 'garage' &&
              gridRef[y + 1]?.[x + 1]?.type === 'garage') {
            offsetX = 0;
            offsetY = 0;
          }
          // Check if this is top-right (has neighbor to left and bottom)
          else if (x > 0 && y + 1 < GAME_CONFIG.gridHeight &&
                   gridRef[y]?.[x - 1]?.type === 'garage' &&
                   gridRef[y + 1]?.[x]?.type === 'garage' &&
                   gridRef[y + 1]?.[x - 1]?.type === 'garage') {
            offsetX = 512;
            offsetY = 0;
          }
          // Check if this is bottom-left (has neighbors to right and top)
          else if (x + 1 < GAME_CONFIG.gridWidth && y > 0 &&
                   gridRef[y]?.[x + 1]?.type === 'garage' &&
                   gridRef[y - 1]?.[x]?.type === 'garage' &&
                   gridRef[y - 1]?.[x + 1]?.type === 'garage') {
            offsetX = 0;
            offsetY = 512;
          }
          // Check if this is bottom-right (has neighbors to left and top)
          else if (x > 0 && y > 0 &&
                   gridRef[y]?.[x - 1]?.type === 'garage' &&
                   gridRef[y - 1]?.[x]?.type === 'garage' &&
                   gridRef[y - 1]?.[x - 1]?.type === 'garage') {
            offsetX = 512;
            offsetY = 512;
          }

          // Draw the appropriate quadrant from the 1024x1024 sprite sheet
          ctx.drawImage(
            garageImageRef.current,
            offsetX, offsetY, 512, 512,  // Source: extract quadrant from sprite
            px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize  // Dest: draw at tile position
          );
        } else if (tile.type === 'supercharger') {
          // ═══════════════════════════════════════════════════════════════════════════
          // STANDARD 2x2 BUILDING RENDERING PATTERN
          // All 2x2 buildings should follow this approach for consistent rendering:
          // 1. Draw grass background on all 4 tiles
          // 2. Determine which quadrant position this tile occupies
          // 3. Extract the corresponding 512x512 quadrant from 1024x1024 sprite
          // 4. Draw at single tile size (32px)
          // ═══════════════════════════════════════════════════════════════════════════

          // Draw grass background (on all 4 tiles)
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          if (superchargerImageRef.current) {
            // Find which position this tile is in the 2x2 building
            let offsetX = 0;
            let offsetY = 0;

            // Check if this is top-left
            if (x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
                gridRef[y]?.[x + 1]?.type === 'supercharger' &&
                gridRef[y + 1]?.[x]?.type === 'supercharger' &&
                gridRef[y + 1]?.[x + 1]?.type === 'supercharger') {
              offsetX = 0;
              offsetY = 0;
            }
            // Check if this is top-right
            else if (x > 0 && y + 1 < GAME_CONFIG.gridHeight &&
                     gridRef[y]?.[x - 1]?.type === 'supercharger' &&
                     gridRef[y + 1]?.[x]?.type === 'supercharger' &&
                     gridRef[y + 1]?.[x - 1]?.type === 'supercharger') {
              offsetX = 512;
              offsetY = 0;
            }
            // Check if this is bottom-left
            else if (x + 1 < GAME_CONFIG.gridWidth && y > 0 &&
                     gridRef[y]?.[x + 1]?.type === 'supercharger' &&
                     gridRef[y - 1]?.[x]?.type === 'supercharger' &&
                     gridRef[y - 1]?.[x + 1]?.type === 'supercharger') {
              offsetX = 0;
              offsetY = 512;
            }
            // Check if this is bottom-right
            else if (x > 0 && y > 0 &&
                     gridRef[y]?.[x - 1]?.type === 'supercharger' &&
                     gridRef[y - 1]?.[x]?.type === 'supercharger' &&
                     gridRef[y - 1]?.[x - 1]?.type === 'supercharger') {
              offsetX = 512;
              offsetY = 512;
            }

            // Draw the appropriate quadrant
            ctx.drawImage(
              superchargerImageRef.current,
              offsetX, offsetY, 512, 512,
              px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
            );
          } else {
            // Fallback if image not loaded - draw simple purple gradient
            const gradient = ctx.createRadialGradient(
              px + GAME_CONFIG.tileSize / 2,
              py + GAME_CONFIG.tileSize / 2,
              0,
              px + GAME_CONFIG.tileSize / 2,
              py + GAME_CONFIG.tileSize / 2,
              GAME_CONFIG.tileSize / 2
            );
            gradient.addColorStop(0, '#a855f7');
            gradient.addColorStop(1, '#7c3aed');
            ctx.fillStyle = gradient;
            ctx.fillRect(px + 2, py + 2, GAME_CONFIG.tileSize - 4, GAME_CONFIG.tileSize - 4);
            ctx.font = `${GAME_CONFIG.tileSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', px + GAME_CONFIG.tileSize / 2, py + GAME_CONFIG.tileSize / 2);
          }
        } else if (tile.type === 'fertilizer') {
          // Fertilizer building - 2x2 building
          // Draw grass background
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          if (fertilizerBuildingImageRef.current) {
            // Find which position this tile is in the 2x2 building
            let offsetX = 0;
            let offsetY = 0;

            // Check if this is top-left
            if (x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
                gridRef[y]?.[x + 1]?.type === 'fertilizer' &&
                gridRef[y + 1]?.[x]?.type === 'fertilizer' &&
                gridRef[y + 1]?.[x + 1]?.type === 'fertilizer') {
              offsetX = 0;
              offsetY = 0;
            }
            // Check if this is top-right
            else if (x > 0 && y + 1 < GAME_CONFIG.gridHeight &&
                     gridRef[y]?.[x - 1]?.type === 'fertilizer' &&
                     gridRef[y + 1]?.[x]?.type === 'fertilizer' &&
                     gridRef[y + 1]?.[x - 1]?.type === 'fertilizer') {
              offsetX = 512;
              offsetY = 0;
            }
            // Check if this is bottom-left
            else if (x + 1 < GAME_CONFIG.gridWidth && y > 0 &&
                     gridRef[y]?.[x + 1]?.type === 'fertilizer' &&
                     gridRef[y - 1]?.[x]?.type === 'fertilizer' &&
                     gridRef[y - 1]?.[x + 1]?.type === 'fertilizer') {
              offsetX = 0;
              offsetY = 512;
            }
            // Check if this is bottom-right
            else if (x > 0 && y > 0 &&
                     gridRef[y]?.[x - 1]?.type === 'fertilizer' &&
                     gridRef[y - 1]?.[x]?.type === 'fertilizer' &&
                     gridRef[y - 1]?.[x - 1]?.type === 'fertilizer') {
              offsetX = 512;
              offsetY = 512;
            }

            // Draw the appropriate quadrant
            ctx.drawImage(
              fertilizerBuildingImageRef.current,
              offsetX, offsetY, 512, 512,
              px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
            );
          } else {
            // Fallback if image not loaded - draw green circle
            const gradient = ctx.createRadialGradient(
              px + GAME_CONFIG.tileSize / 2,
              py + GAME_CONFIG.tileSize / 2,
              0,
              px + GAME_CONFIG.tileSize / 2,
              py + GAME_CONFIG.tileSize / 2,
              GAME_CONFIG.tileSize / 2
            );
            gradient.addColorStop(0, '#84cc16');
            gradient.addColorStop(1, '#65a30d');
            ctx.fillStyle = gradient;
            ctx.fillRect(px + 2, py + 2, GAME_CONFIG.tileSize - 4, GAME_CONFIG.tileSize - 4);
            ctx.font = `${GAME_CONFIG.tileSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌱', px + GAME_CONFIG.tileSize / 2, py + GAME_CONFIG.tileSize / 2);
          }
        } else if (tile.type === 'hopper') {
          // Hopper building - 2x2 building
          // Draw grass background
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          if (hopperImageRef.current) {
            // Find which position this tile is in the 2x2 building
            let offsetX = 0;
            let offsetY = 0;

            // Check if this is top-left
            if (x + 1 < GAME_CONFIG.gridWidth && y + 1 < GAME_CONFIG.gridHeight &&
                gridRef[y]?.[x + 1]?.type === 'hopper' &&
                gridRef[y + 1]?.[x]?.type === 'hopper' &&
                gridRef[y + 1]?.[x + 1]?.type === 'hopper') {
              offsetX = 0;
              offsetY = 0;
            }
            // Check if this is top-right
            else if (x > 0 && y + 1 < GAME_CONFIG.gridHeight &&
                     gridRef[y]?.[x - 1]?.type === 'hopper' &&
                     gridRef[y + 1]?.[x]?.type === 'hopper' &&
                     gridRef[y + 1]?.[x - 1]?.type === 'hopper') {
              offsetX = 512;
              offsetY = 0;
            }
            // Check if this is bottom-left
            else if (x + 1 < GAME_CONFIG.gridWidth && y > 0 &&
                     gridRef[y]?.[x + 1]?.type === 'hopper' &&
                     gridRef[y - 1]?.[x]?.type === 'hopper' &&
                     gridRef[y - 1]?.[x + 1]?.type === 'hopper') {
              offsetX = 0;
              offsetY = 512;
            }
            // Check if this is bottom-right
            else if (x > 0 && y > 0 &&
                     gridRef[y]?.[x - 1]?.type === 'hopper' &&
                     gridRef[y - 1]?.[x]?.type === 'hopper' &&
                     gridRef[y - 1]?.[x - 1]?.type === 'hopper') {
              offsetX = 512;
              offsetY = 512;
            }

            // Draw the appropriate quadrant
            ctx.drawImage(
              hopperImageRef.current,
              offsetX, offsetY, 512, 512,
              px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize
            );
          } else {
            // Fallback if image not loaded - draw cyan square
            const gradient = ctx.createRadialGradient(
              px + GAME_CONFIG.tileSize / 2,
              py + GAME_CONFIG.tileSize / 2,
              0,
              px + GAME_CONFIG.tileSize / 2,
              py + GAME_CONFIG.tileSize / 2,
              GAME_CONFIG.tileSize / 2
            );
            gradient.addColorStop(0, '#22d3ee');
            gradient.addColorStop(1, '#0891b2');
            ctx.fillStyle = gradient;
            ctx.fillRect(px + 2, py + 2, GAME_CONFIG.tileSize - 4, GAME_CONFIG.tileSize - 4);
            ctx.font = `${GAME_CONFIG.tileSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🎒', px + GAME_CONFIG.tileSize / 2, py + GAME_CONFIG.tileSize / 2);
          }
        } else if (tile.type === 'waterbot' && waterBotImageRef.current) {
          // Draw water bot sprite
          ctx.drawImage(waterBotImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'arch' && tile.archTargetZone) {
          // Draw arch - select themed arch based on target zone
          const zoneKey = `${tile.archTargetZone.x},${tile.archTargetZone.y}`;
          const targetZone = gameState.zones[zoneKey];
          const isActive = targetZone?.owned || false;

          // Draw grass background first
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Select the appropriate themed arch image based on target zone theme
          let selectedArchImage = archFarmImageRef.current; // Fallback to default arch
          if (targetZone) {
            switch (targetZone.theme) {
              case 'desert':
                selectedArchImage = archDesertImageRef.current || archFarmImageRef.current;
                break;
              case 'beach':
                selectedArchImage = archBeachImageRef.current || archFarmImageRef.current;
                break;
              case 'barn':
                selectedArchImage = archBarnImageRef.current || archFarmImageRef.current;
                break;
              case 'mountain':
                selectedArchImage = archMountainImageRef.current || archFarmImageRef.current;
                break;
              default:
                selectedArchImage = archFarmImageRef.current;
            }
          }

          // Draw the themed arch sprite
          if (selectedArchImage) {
            ctx.drawImage(selectedArchImage, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }

          // Draw spinning coin in center if not owned (purchasable)
          if (!isActive && coinImageRef.current) {
            const iconSize = GAME_CONFIG.tileSize * 0.5; // 50% of tile size
            const centerX = px + GAME_CONFIG.tileSize / 2;
            const centerY = py + GAME_CONFIG.tileSize / 2;

            // Calculate spin animation (0 to 1, repeats every 4 seconds - slower spin)
            const spinTime = (Date.now() % 4000) / 4000;
            // Create a sine wave for smooth spinning: 0 -> 1 -> 0 -> -1 -> 0
            const spinScale = Math.sin(spinTime * Math.PI * 2);

            ctx.save();
            ctx.translate(centerX, centerY);
            // Scale horizontally to create spinning effect (keeps vertical size)
            ctx.scale(Math.abs(spinScale), 1);
            ctx.drawImage(
              coinImageRef.current,
              -iconSize / 2, -iconSize / 2,
              iconSize, iconSize
            );
            ctx.restore();
          }
        } else if (tile.type === 'ocean' && oceanImageRef.current) {
          // Beach theme: ocean water
          ctx.drawImage(oceanImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'sand' && sandImageRef.current) {
          // Beach/Desert theme: sand
          ctx.drawImage(sandImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'seaweed' && seaweedImageRef.current) {
          // Beach theme: seaweed on sand
          if (sandImageRef.current) {
            ctx.drawImage(sandImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.sand;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(seaweedImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'shells' && shellsImageRef.current) {
          // Beach theme: shells on sand
          if (sandImageRef.current) {
            ctx.drawImage(sandImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.sand;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(shellsImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'cactus' && cactusImageRef.current) {
          // Desert theme: cactus on sand
          if (sandImageRef.current) {
            ctx.drawImage(sandImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.sand;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(cactusImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'rocks' && rocksImageRef.current) {
          // Desert/Mountain theme: rocks on sand or dirt
          if (sandImageRef.current) {
            ctx.drawImage(sandImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(rocksImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'cave' && caveImageRef.current) {
          // Mountain theme: cave on dirt
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(caveImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'mountain' && mountainImageRef.current) {
          // Mountain theme: mountain formation on dirt
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.dirt;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(mountainImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'planted' && plantedCropImageRef.current) {
          // Draw grass background first, then dirt, then planted crop sprite on top
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(plantedCropImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

          // Draw small crop icon in bottom-right corner to show what's growing
          if (tile.crop) {
            const iconSize = GAME_CONFIG.tileSize * 0.30; // 30% of tile size
            const iconX = px + GAME_CONFIG.tileSize - iconSize - 4; // 4px padding from right
            const iconY = py + GAME_CONFIG.tileSize - iconSize - 4; // 4px padding from bottom

            // Draw semi-transparent background circle for icon
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw the crop icon
            const cropIconImg = new Image();
            cropIconImg.src = `/${tile.crop}.png`;
            if (cropIconImg.complete) {
              ctx.drawImage(cropIconImg, iconX, iconY, iconSize, iconSize);
            } else {
              cropIconImg.onload = () => {
                ctx.drawImage(cropIconImg, iconX, iconY, iconSize, iconSize);
              };
            }
          }
        } else if (tile.type === 'grown' && tile.crop === 'carrot' && carrotsImageRef.current) {
          // Draw grass background first, then grown carrots sprite on top
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(carrotsImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'wheat' && wheatImageRef.current) {
          // Draw grass background first, then grown wheat sprite on top
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(wheatImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'tomato' && tomatoImageRef.current) {
          // Draw grass background first, then grown tomato sprite on top
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(tomatoImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'pumpkin' && pumpkinImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(pumpkinImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'watermelon' && watermelonImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(watermelonImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'peppers' && peppersImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(peppersImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'grapes' && grapesImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(grapesImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'oranges' && orangesImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(orangesImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'avocado' && avocadoImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(avocadoImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'rice' && riceImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(riceImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown' && tile.crop === 'corn' && cornImageRef.current) {
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.drawImage(cornImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else if (tile.type === 'grown') {
          // Draw grass background first, then dirt + generic grown crop (golden)
          if (grassImageRef.current) {
            ctx.drawImage(grassImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else {
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          if (dirtImageRef.current) {
            ctx.drawImage(dirtImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
          ctx.fillStyle = COLORS.grown;
          ctx.fillRect(
            px + GAME_CONFIG.tileSize / 4,
            py + GAME_CONFIG.tileSize / 4,
            GAME_CONFIG.tileSize / 2,
            GAME_CONFIG.tileSize / 2
          );
        } else {
          // Draw solid color for other tiles
          ctx.fillStyle = COLORS[tile.type] || COLORS.grass;
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        }

        // Draw sprinkler coverage indicator (light blue tint for tiles in range)
        const currentGrid = getCurrentGrid(gameState);
        let isInSprinklerRange = false;
        for (let sy = 0; sy < currentGrid.length; sy++) {
          for (let sx = 0; sx < currentGrid[sy].length; sx++) {
            const otherTile = currentGrid[sy][sx];
            if (otherTile.hasSprinkler) {
              const dx = Math.abs(x - sx);
              const dy = Math.abs(y - sy);
              if (dx <= 3 && dy <= 3) { // 7x7 area (3 tiles in each direction)
                isInSprinklerRange = true;
                break;
              }
            }
          }
          if (isInSprinklerRange) break;
        }

        if (isInSprinklerRange) {
          ctx.fillStyle = 'rgba(100, 200, 255, 0.15)'; // Light blue tint
          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        }

        // Draw sprinkler if placed on this tile
        if (tile.hasSprinkler && sprinklerImageRef.current) {
          ctx.drawImage(sprinklerImageRef.current, px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        }

        // Draw growth progress bar for planted crops
        if (tile.type === 'planted' && tile.crop) {
          const barHeight = 4;
          const barY = py + GAME_CONFIG.tileSize - barHeight - 2;
          const barWidth = GAME_CONFIG.tileSize - 4;

          // Background
          ctx.fillStyle = '#00000088';
          ctx.fillRect(px + 2, barY, barWidth, barHeight);

          // Progress
          const progressWidth = (barWidth * tile.growthStage) / 100;
          ctx.fillStyle = tile.growthStage < 50 ? '#ff9800' : '#4caf50';
          ctx.fillRect(px + 2, barY, progressWidth, barHeight);
        }

        // Draw blinking water droplet for crops that need water
        if (tile.type === 'planted' && !tile.wateredToday && waterdropletImageRef.current) {
          const blink = Math.floor(Date.now() / 500) % 2 === 0; // Blink every 500ms
          if (blink) {
            const dropletSize = GAME_CONFIG.tileSize * 0.25; // 25% of tile size
            const dropletX = px + GAME_CONFIG.tileSize / 2 - dropletSize / 2;
            const dropletY = py + 8; // Top of the tile with small padding

            // Draw semi-transparent white background circle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(dropletX + dropletSize / 2, dropletY + dropletSize / 2, dropletSize / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw water droplet icon
            ctx.drawImage(waterdropletImageRef.current, dropletX, dropletY, dropletSize, dropletSize);
          }
        }

        // Draw blinking task-specific icon for queued tasks in the current zone
        let taskForThisTile = currentZone.taskQueue.find(task =>
          task.tileX === x && task.tileY === y &&
          task.zoneX === gameState.currentZone.x &&
          task.zoneY === gameState.currentZone.y
        );

        // Note: We removed currentTask from GameState as tasks are now zone-specific
        if (!taskForThisTile && currentZone.currentTask) {
          // Only show the current task icon on the specific tile being worked on
          if (currentZone.currentTask.tileX === x &&
              currentZone.currentTask.tileY === y &&
              currentZone.currentTask.zoneX === gameState.currentZone.x &&
              currentZone.currentTask.zoneY === gameState.currentZone.y) {

            const visualX = gameState.player.visualX ?? gameState.player.x;
            const visualY = gameState.player.visualY ?? gameState.player.y;
            const hasReachedTile = Math.abs(visualX - x) < 0.1 && Math.abs(visualY - y) < 0.1;

            // Only show icon if farmer hasn't reached yet
            if (!hasReachedTile) {
              taskForThisTile = currentZone.currentTask;
            }
          }
        }

        if (taskForThisTile) {
          const blink = Math.floor(Date.now() / 500) % 2; // Blink every 500ms
          if (blink === 0) {
            // Determine which icon to show based on task type
            let taskIcon: HTMLImageElement | null = null;
            switch (taskForThisTile.type) {
              case 'clear':
                taskIcon = clearToolImageRef.current;
                break;
              case 'water':
                taskIcon = waterdropletImageRef.current;
                break;
              case 'harvest':
                taskIcon = harvestImageRef.current;
                break;
              case 'plant':
                // Show the specific crop icon being planted
                if (taskForThisTile.cropType === 'carrot') {
                  taskIcon = carrotsImageRef.current;
                } else if (taskForThisTile.cropType === 'wheat') {
                  taskIcon = wheatImageRef.current;
                } else if (taskForThisTile.cropType === 'tomato') {
                  taskIcon = tomatoImageRef.current;
                } else if (taskForThisTile.cropType === 'pumpkin') {
                  taskIcon = pumpkinImageRef.current;
                } else if (taskForThisTile.cropType === 'watermelon') {
                  taskIcon = watermelonImageRef.current;
                } else if (taskForThisTile.cropType === 'peppers') {
                  taskIcon = peppersImageRef.current;
                } else if (taskForThisTile.cropType === 'grapes') {
                  taskIcon = grapesImageRef.current;
                } else if (taskForThisTile.cropType === 'oranges') {
                  taskIcon = orangesImageRef.current;
                } else if (taskForThisTile.cropType === 'avocado') {
                  taskIcon = avocadoImageRef.current;
                } else if (taskForThisTile.cropType === 'rice') {
                  taskIcon = riceImageRef.current;
                } else if (taskForThisTile.cropType === 'corn') {
                  taskIcon = cornImageRef.current;
                } else {
                  taskIcon = plantedCropImageRef.current; // Fallback
                }
                break;
              case 'place_sprinkler':
                taskIcon = workingImageRef.current; // Fallback to working icon
                break;
            }

            // Draw task icon in bottom-right corner if available
            if (taskIcon) {
              const iconSize = GAME_CONFIG.tileSize * 0.70; // 70% of tile size (doubled from 35%)
              const iconX = px + GAME_CONFIG.tileSize - iconSize - 4; // 4px padding from right
              const iconY = py + GAME_CONFIG.tileSize - iconSize - 4; // 4px padding from bottom
              ctx.drawImage(taskIcon, iconX, iconY, iconSize, iconSize);
            }
          }
        }

        // Draw task progress bar if farmer is working on this tile
        // Only show when farmer has reached the tile (not while traveling)
        if (currentZone.currentTask &&
            currentZone.currentTask.tileX === x &&
            currentZone.currentTask.tileY === y) {
          const visualX = gameState.player.visualX ?? gameState.player.x;
          const visualY = gameState.player.visualY ?? gameState.player.y;

          // Check if farmer has reached the tile (within 0.1 tiles)
          const hasReachedTile = Math.abs(visualX - x) < 0.1 && Math.abs(visualY - y) < 0.1;

          if (hasReachedTile) {
            const barHeight = 8;
            const barY = py + GAME_CONFIG.tileSize - barHeight - 4; // Position at bottom
            const barWidth = GAME_CONFIG.tileSize - 8;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(px + 4, barY, barWidth, barHeight);

            // Progress
            const progressWidth = (barWidth * currentZone.currentTask.progress) / 100;
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(px + 4, barY, progressWidth, barHeight);

            // Border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 4, barY, barWidth, barHeight);
          }
        }

        // Grid lines
        ctx.strokeStyle = COLORS.grid;
        ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
      });
    });

    // Draw sprinkler coverage preview when in placement mode
    if (placementMode === 'sprinkler' && hoveredTile) {
      const currentGrid = getCurrentGrid(gameState);
      const hoveredTileData = currentGrid[hoveredTile.y]?.[hoveredTile.x];

      // Only show preview if hovering over a valid placement tile
      if (hoveredTileData && !hoveredTileData.hasSprinkler) {
        for (let y = 0; y < currentGrid.length; y++) {
          for (let x = 0; x < currentGrid[y].length; x++) {
            const dx = Math.abs(x - hoveredTile.x);
            const dy = Math.abs(y - hoveredTile.y);

            // Highlight tiles in 7x7 coverage area
            if (dx <= 3 && dy <= 3) {
              const px = x * GAME_CONFIG.tileSize;
              const py = y * GAME_CONFIG.tileSize;

              // Draw bright cyan overlay for coverage preview
              ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
              ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

              // Draw border around coverage area
              if (dx === 3 || dy === 3) {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
              }
            }
          }
        }
      }
    }

    // Draw 2x2 building placement preview (bot factory, well, garage, supercharger)
    if ((placementMode === 'botFactory' || placementMode === 'well' || placementMode === 'garage' || placementMode === 'supercharger' || placementMode === 'fertilizer' || placementMode === 'hopper') && hoveredTile) {
      const currentGrid = getCurrentGrid(gameState);
      const tileX = hoveredTile.x;
      const tileY = hoveredTile.y;

      // Check if all 4 tiles are available for 2x2 placement
      const canPlace =
        tileX + 1 < GAME_CONFIG.gridWidth &&
        tileY + 1 < GAME_CONFIG.gridHeight &&
        currentGrid[tileY]?.[tileX]?.cleared && (currentGrid[tileY][tileX].type === 'grass' || currentGrid[tileY][tileX].type === 'dirt') &&
        currentGrid[tileY]?.[tileX + 1]?.cleared && (currentGrid[tileY][tileX + 1].type === 'grass' || currentGrid[tileY][tileX + 1].type === 'dirt') &&
        currentGrid[tileY + 1]?.[tileX]?.cleared && (currentGrid[tileY + 1][tileX].type === 'grass' || currentGrid[tileY + 1][tileX].type === 'dirt') &&
        currentGrid[tileY + 1]?.[tileX + 1]?.cleared && (currentGrid[tileY + 1][tileX + 1].type === 'grass' || currentGrid[tileY + 1][tileX + 1].type === 'dirt');

      // Draw preview for all 4 tiles
      for (let dy = 0; dy < 2 && tileY + dy < GAME_CONFIG.gridHeight; dy++) {
        for (let dx = 0; dx < 2 && tileX + dx < GAME_CONFIG.gridWidth; dx++) {
          const px = (tileX + dx) * GAME_CONFIG.tileSize;
          const py = (tileY + dy) * GAME_CONFIG.tileSize;

          // Green if all tiles valid, red if any tile invalid
          if (canPlace) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.4)'; // Green overlay
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
          } else {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Red overlay
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
          }

          ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          ctx.lineWidth = 3;
          ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        }
      }

      // Draw text in the center of the 2x2 area
      const centerX = (tileX + 0.5) * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2;
      const centerY = (tileY + 0.5) * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2;

      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (canPlace) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = 'rgba(0, 128, 0, 1)';
        ctx.lineWidth = 3;
        ctx.strokeText('✓ Click to Place', centerX, centerY);
        ctx.fillText('✓ Click to Place', centerX, centerY);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = 'rgba(128, 0, 0, 1)';
        ctx.lineWidth = 3;
        ctx.strokeText('✗ Invalid Location', centerX, centerY);
        ctx.fillText('✗ Invalid Location', centerX, centerY);
      }
    }

    // Draw tile selection highlights when in tile selection mode
    if (tileSelectionMode && tileSelectionMode.active) {
      // First, draw tiles from OTHER jobs (not the current one being edited)
      const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
      const currentZone = gameState.zones[currentZoneKey];
      const seedBots = currentZone?.seedBots || [];

      seedBots.forEach(bot => {
        bot.jobs.forEach(job => {
          // Skip the job currently being edited
          if (job.id === tileSelectionMode.jobId) return;

          job.targetTiles.forEach(targetTile => {
            const px = targetTile.x * GAME_CONFIG.tileSize;
            const py = targetTile.y * GAME_CONFIG.tileSize;

            // Draw blue/gray highlight for tiles from other jobs
            ctx.fillStyle = 'rgba(100, 116, 139, 0.3)'; // Slate gray
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

            // Draw subtle border
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

            // Draw small lock icon to indicate it's assigned to another job
            ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', px + GAME_CONFIG.tileSize / 2, py + GAME_CONFIG.tileSize / 2);
          });
        });
      });

      // Now draw the current job's selected tiles (in green with checkmarks)
      tileSelectionMode.selectedTiles.forEach(selectedTile => {
        const px = selectedTile.x * GAME_CONFIG.tileSize;
        const py = selectedTile.y * GAME_CONFIG.tileSize;

        // Draw green highlight for selected tiles
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

        // Draw thick green border
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.lineWidth = 3;
        ctx.strokeRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

        // Draw checkmark
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', px + GAME_CONFIG.tileSize / 2, py + GAME_CONFIG.tileSize / 2);
      });

      // Highlight hovered tile if it's plantable
      if (hoveredTile) {
        const currentGrid = getCurrentGrid(gameState);
        const hoveredTileData = currentGrid[hoveredTile.y]?.[hoveredTile.x];
        const isAlreadySelected = tileSelectionMode.selectedTiles.some(
          t => t.x === hoveredTile.x && t.y === hoveredTile.y
        );

        if (hoveredTileData && hoveredTileData.type === 'dirt' && hoveredTileData.cleared && !hoveredTileData.crop && !hoveredTileData.hasSprinkler) {
          const px = hoveredTile.x * GAME_CONFIG.tileSize;
          const py = hoveredTile.y * GAME_CONFIG.tileSize;

          if (isAlreadySelected) {
            // Show red overlay for deselection
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          } else if (tileSelectionMode.selectedTiles.length < 20) {
            // Show green overlay for selection
            ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
          }
        }
      }
    }

    // Draw light overlay for tiles that are part of seed bot jobs (only when NOT in selection mode)
    if (!tileSelectionMode?.active) {
      const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
      const currentZone = gameState.zones[currentZoneKey];
      const seedBots = currentZone?.seedBots || [];

      seedBots.forEach(bot => {
        bot.jobs.forEach(job => {
          job.targetTiles.forEach(targetTile => {
            const px = targetTile.x * GAME_CONFIG.tileSize;
            const py = targetTile.y * GAME_CONFIG.tileSize;

            // Draw subtle yellow/gold overlay to indicate this tile is part of a job
            ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; // Light amber overlay
            ctx.fillRect(px, py, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);

            // Draw subtle border
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)'; // Amber border
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, GAME_CONFIG.tileSize - 2, GAME_CONFIG.tileSize - 2);

            // Draw crop icon in bottom-right corner to show what will be planted
            const iconSize = GAME_CONFIG.tileSize * 0.30; // 30% of tile size
            const iconX = px + GAME_CONFIG.tileSize - iconSize - 4; // 4px padding from right
            const iconY = py + GAME_CONFIG.tileSize - iconSize - 4; // 4px padding from bottom

            // Draw semi-transparent background circle for icon
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw the crop icon
            const cropIconImg = new Image();
            cropIconImg.src = `/${job.cropType}.png`;
            if (cropIconImg.complete) {
              ctx.drawImage(cropIconImg, iconX, iconY, iconSize, iconSize);
            } else {
              cropIconImg.onload = () => {
                ctx.drawImage(cropIconImg, iconX, iconY, iconSize, iconSize);
              };
            }
          });
        });
      });
    }

    // Draw progress bars for bot actions
    // Water bots
    waterBots?.forEach(bot => {
      if (bot.actionStartTime !== undefined && bot.actionDuration && bot.x !== undefined && bot.y !== undefined) {
        const elapsed = gameState.gameTime - bot.actionStartTime;
        const progress = Math.min(1, elapsed / bot.actionDuration);
        const px = bot.x * GAME_CONFIG.tileSize;
        const py = bot.y * GAME_CONFIG.tileSize;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);

        // Progress fill
        ctx.fillStyle = '#3b82f6'; // Blue for watering
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, (GAME_CONFIG.tileSize - 10) * progress, 10);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);
      }
    });

    // Harvest bots
    harvestBots?.forEach(bot => {
      if (bot.actionStartTime !== undefined && bot.actionDuration && bot.x !== undefined && bot.y !== undefined) {
        const elapsed = gameState.gameTime - bot.actionStartTime;
        const progress = Math.min(1, elapsed / bot.actionDuration);
        const px = bot.x * GAME_CONFIG.tileSize;
        const py = bot.y * GAME_CONFIG.tileSize;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);

        // Progress fill
        ctx.fillStyle = '#eab308'; // Yellow for harvesting
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, (GAME_CONFIG.tileSize - 10) * progress, 10);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);
      }
    });

    // Seed bots
    seedBots?.forEach(bot => {
      if (bot.actionStartTime !== undefined && bot.actionDuration && bot.x !== undefined && bot.y !== undefined) {
        const elapsed = gameState.gameTime - bot.actionStartTime;
        const progress = Math.min(1, elapsed / bot.actionDuration);
        const px = bot.x * GAME_CONFIG.tileSize;
        const py = bot.y * GAME_CONFIG.tileSize;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);

        // Progress fill
        ctx.fillStyle = '#22c55e'; // Green for planting
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, (GAME_CONFIG.tileSize - 10) * progress, 10);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);
      }
    });

    // Demolish bots
    demolishBots?.forEach(bot => {
      if (bot.actionStartTime !== undefined && bot.actionDuration && bot.x !== undefined && bot.y !== undefined) {
        const elapsed = gameState.gameTime - bot.actionStartTime;
        const progress = Math.min(1, elapsed / bot.actionDuration);
        const px = bot.x * GAME_CONFIG.tileSize;
        const py = bot.y * GAME_CONFIG.tileSize;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);

        // Progress fill
        ctx.fillStyle = '#f97316'; // Orange for demolishing
        ctx.fillRect(px + 5, py + GAME_CONFIG.tileSize - 15, (GAME_CONFIG.tileSize - 10) * progress, 10);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 5, py + GAME_CONFIG.tileSize - 15, GAME_CONFIG.tileSize - 10, 10);
      }
    });

    // Draw player using visual position for smooth movement
    const visualX = gameState.player.visualX ?? gameState.player.x;
    const visualY = gameState.player.visualY ?? gameState.player.y;
    const playerPx = visualX * GAME_CONFIG.tileSize;
    const playerPy = visualY * GAME_CONFIG.tileSize;

    // Use themed farmer sprite based on current zone
    const isBeachZone = currentZone?.theme === 'beach';
    const farmerSprite = (isBeachZone && surferImageRef.current) ? surferImageRef.current : farmerImageRef.current;

    if (farmerSprite) {
      // Draw farmer sprite (surfer in beach, regular farmer elsewhere)
      ctx.drawImage(farmerSprite, playerPx, playerPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
    } else {
      // Fallback to blue circle
      const centerX = playerPx + GAME_CONFIG.tileSize / 2;
      const centerY = playerPy + GAME_CONFIG.tileSize / 2;
      ctx.fillStyle = COLORS.player;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw water bots using visual position for smooth movement
    waterBots?.forEach(bot => {
      if (bot.x !== undefined && bot.y !== undefined) {
        // Skip rendering if bot is parked in garage (despawned)
        const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
        if (isParked) return; // Bot is hidden inside garage

        const visualX = bot.visualX ?? bot.x;
        const visualY = bot.visualY ?? bot.y;
        const botPx = visualX * GAME_CONFIG.tileSize;
        const botPy = visualY * GAME_CONFIG.tileSize;

        if (waterBotImageRef.current) {
          ctx.drawImage(waterBotImageRef.current, botPx, botPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else {
          // Fallback to cyan circle
          const centerX = botPx + GAME_CONFIG.tileSize / 2;
          const centerY = botPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#00bcd4';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw charged indicator on bot if supercharged (2 bolts side by side, centered)
        if (bot.supercharged && chargedImageRef.current) {
          const chargedSize = GAME_CONFIG.tileSize * 0.35;
          const gap = 2; // Gap between the two bolts
          const totalWidth = chargedSize * 2 + gap;
          const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

          // Left bolt
          const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
          ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

          // Right bolt
          const rightX = leftX + chargedSize + gap;
          ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
        }

        // Draw glowing red indicator on right side if out of water
        if (bot.waterLevel === 0) {
          const indicatorX = botPx + GAME_CONFIG.tileSize - 15;
          const indicatorY = botPy + GAME_CONFIG.tileSize / 2;

          // Pulsing glow effect
          const pulseTime = Date.now() % 1000;
          const pulseIntensity = 0.5 + 0.5 * Math.sin((pulseTime / 1000) * Math.PI * 2);

          // Outer glow
          const gradient = ctx.createRadialGradient(indicatorX, indicatorY, 0, indicatorX, indicatorY, 12);
          gradient.addColorStop(0, `rgba(239, 68, 68, ${0.8 * pulseIntensity})`);
          gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.4 * pulseIntensity})`);
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 12, 0, Math.PI * 2);
          ctx.fill();

          // Solid red circle
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2);
          ctx.fill();

          // White exclamation mark
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', indicatorX, indicatorY);
        }
      }
    });

    // Draw harvest bots using visual position for smooth movement
    harvestBots?.forEach(bot => {
      if (bot.x !== undefined && bot.y !== undefined) {
        const visualX = bot.visualX ?? bot.x;
        const visualY = bot.visualY ?? bot.y;
        const botPx = visualX * GAME_CONFIG.tileSize;
        const botPy = visualY * GAME_CONFIG.tileSize;

        if (harvestBotImageRef.current) {
          ctx.drawImage(harvestBotImageRef.current, botPx, botPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else {
          // Fallback to orange circle
          const centerX = botPx + GAME_CONFIG.tileSize / 2;
          const centerY = botPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#ff9800';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw charged indicator on bot if supercharged (2 bolts side by side, centered)
        if (bot.supercharged && chargedImageRef.current) {
          const chargedSize = GAME_CONFIG.tileSize * 0.35;
          const gap = 2; // Gap between the two bolts
          const totalWidth = chargedSize * 2 + gap;
          const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

          // Left bolt
          const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
          ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

          // Right bolt
          const rightX = leftX + chargedSize + gap;
          ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
        }

        // Draw crop icon indicator if carrying crops
        if (bot.inventory.length > 0) {
          // Get the first crop type from inventory
          const cropType = bot.inventory[0].crop;
          let cropImage: HTMLImageElement | null = null;

          // Map crop type to image ref
          switch (cropType) {
            case 'carrot': cropImage = carrotsImageRef.current; break;
            case 'wheat': cropImage = wheatImageRef.current; break;
            case 'tomato': cropImage = tomatoImageRef.current; break;
            case 'pumpkin': cropImage = pumpkinImageRef.current; break;
            case 'watermelon': cropImage = watermelonImageRef.current; break;
            case 'peppers': cropImage = peppersImageRef.current; break;
            case 'grapes': cropImage = grapesImageRef.current; break;
            case 'oranges': cropImage = orangesImageRef.current; break;
            case 'avocado': cropImage = avocadoImageRef.current; break;
            case 'rice': cropImage = riceImageRef.current; break;
            case 'corn': cropImage = cornImageRef.current; break;
          }

          // Draw crop icon next to the bot (top-right corner)
          const iconSize = 16;
          const iconX = botPx + GAME_CONFIG.tileSize - iconSize - 2;
          const iconY = botPy + 2;

          if (cropImage) {
            // White background circle for visibility
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw crop icon
            ctx.drawImage(cropImage, iconX, iconY, iconSize, iconSize);
          }

          // Draw inventory count badge (bottom-right)
          if (bot.inventory.length > 1) {
            const badgeX = botPx + GAME_CONFIG.tileSize - 10;
            const badgeY = botPy + GAME_CONFIG.tileSize - 10;

            // Badge background
            ctx.fillStyle = '#4caf50';
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
            ctx.fill();

            // Badge number
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(bot.inventory.length.toString(), badgeX, badgeY);
          }
        }
      }
    });

    // Draw seed bots using visual position for smooth movement
    seedBots?.forEach(bot => {
      if (bot.x !== undefined && bot.y !== undefined) {
        const visualX = bot.visualX ?? bot.x;
        const visualY = bot.visualY ?? bot.y;
        const botPx = visualX * GAME_CONFIG.tileSize;
        const botPy = visualY * GAME_CONFIG.tileSize;

        if (seedBotImageRef.current) {
          ctx.drawImage(seedBotImageRef.current, botPx, botPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else {
          // Fallback to green circle
          const centerX = botPx + GAME_CONFIG.tileSize / 2;
          const centerY = botPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#8bc34a';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw charged indicator on bot if supercharged (2 bolts side by side, centered)
        if (bot.supercharged && chargedImageRef.current) {
          const chargedSize = GAME_CONFIG.tileSize * 0.35;
          const gap = 2; // Gap between the two bolts
          const totalWidth = chargedSize * 2 + gap;
          const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

          // Left bolt
          const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
          ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

          // Right bolt
          const rightX = leftX + chargedSize + gap;
          ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
        }

        // Draw job indicator if bot has jobs configured
        if (bot.jobs.length > 0) {
          ctx.fillStyle = '#66bb6a';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bot.jobs.length.toString(), botPx + GAME_CONFIG.tileSize / 2, botPy + GAME_CONFIG.tileSize - 8);
        }
      }
    });

    // Draw transport bots using visual position for smooth movement
    transportBots?.forEach(bot => {
      if (bot.x !== undefined && bot.y !== undefined) {
        const visualX = bot.visualX ?? bot.x;
        const visualY = bot.visualY ?? bot.y;
        const botPx = visualX * GAME_CONFIG.tileSize;
        const botPy = visualY * GAME_CONFIG.tileSize;

        if (transportBotImageRef.current) {
          ctx.drawImage(transportBotImageRef.current, botPx, botPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else {
          // Fallback to purple circle
          const centerX = botPx + GAME_CONFIG.tileSize / 2;
          const centerY = botPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#9c27b0';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw charged indicator on bot if supercharged (2 bolts side by side, centered)
        if (bot.supercharged && chargedImageRef.current) {
          const chargedSize = GAME_CONFIG.tileSize * 0.35;
          const gap = 2; // Gap between the two bolts
          const totalWidth = chargedSize * 2 + gap;
          const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

          // Left bolt
          const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
          ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

          // Right bolt
          const rightX = leftX + chargedSize + gap;
          ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
        }

        // Draw inventory indicator if bot has items
        if (bot.inventory.length > 0) {
          ctx.fillStyle = '#ab47bc';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bot.inventory.length.toString(), botPx + GAME_CONFIG.tileSize / 2, botPy + GAME_CONFIG.tileSize - 8);
        }
      }
    });

    // Draw demolish bots using visual position for smooth movement
    demolishBots?.forEach(bot => {
      if (bot.x !== undefined && bot.y !== undefined) {
        const visualX = bot.visualX ?? bot.x;
        const visualY = bot.visualY ?? bot.y;
        const botPx = visualX * GAME_CONFIG.tileSize;
        const botPy = visualY * GAME_CONFIG.tileSize;

        if (demolishBotImageRef.current) {
          // Scale demolish bot up by 15% to match other bots
          const scaledSize = GAME_CONFIG.tileSize * 1.15;
          const offset = (scaledSize - GAME_CONFIG.tileSize) / 2;
          ctx.drawImage(demolishBotImageRef.current, botPx - offset, botPy - offset, scaledSize, scaledSize);
        } else {
          // Fallback to orange circle
          const centerX = botPx + GAME_CONFIG.tileSize / 2;
          const centerY = botPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#ff6600';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw charged indicator on bot if supercharged (2 bolts side by side, centered)
        if (bot.supercharged && chargedImageRef.current) {
          const chargedSize = GAME_CONFIG.tileSize * 0.35;
          const gap = 2; // Gap between the two bolts
          const totalWidth = chargedSize * 2 + gap;
          const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

          // Left bolt
          const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
          ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

          // Right bolt
          const rightX = leftX + chargedSize + gap;
          ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
        }
      }
    });

    // Draw rabbits using visual position for smooth movement
    const rabbitZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
    const rabbitZone = gameState.zones[rabbitZoneKey];
    rabbitZone.rabbits?.forEach(rabbit => {
      if (rabbit.status !== 'captured') {
        const visualX = rabbit.visualX;
        const visualY = rabbit.visualY;
        const rabbitPx = visualX * GAME_CONFIG.tileSize;
        const rabbitPy = visualY * GAME_CONFIG.tileSize;

        if (rabbitImageRef.current) {
          ctx.drawImage(rabbitImageRef.current, rabbitPx, rabbitPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else {
          // Fallback to white circle
          const centerX = rabbitPx + GAME_CONFIG.tileSize / 2;
          const centerY = rabbitPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw status indicator
        if (rabbit.status === 'eating') {
          // Draw eating emoji
          ctx.fillStyle = '#ff0000';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍴', rabbitPx + GAME_CONFIG.tileSize / 2, rabbitPy - 8);

          // Draw progress bar
          if (rabbit.eatingStartTime !== undefined && rabbit.eatingDuration !== undefined) {
            const eatingProgress = Math.min(1, (gameState.gameTime - rabbit.eatingStartTime) / rabbit.eatingDuration);
            const barWidth = GAME_CONFIG.tileSize - 4;
            const barHeight = 6;
            const barX = rabbitPx + 2;
            const barY = rabbitPy + GAME_CONFIG.tileSize + 2;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Progress
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(barX, barY, barWidth * eatingProgress, barHeight);
          }
        }
      }
    });

    // Draw hunter bots using visual position for smooth movement
    rabbitZone.hunterBots?.forEach(bot => {
      if (bot.status !== 'garaged') {
        const visualX = bot.visualX ?? bot.x ?? 0;
        const visualY = bot.visualY ?? bot.y ?? 0;
        const botPx = visualX * GAME_CONFIG.tileSize;
        const botPy = visualY * GAME_CONFIG.tileSize;

        if (hunterBotImageRef.current) {
          ctx.drawImage(hunterBotImageRef.current, botPx, botPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
        } else {
          // Fallback to amber circle
          const centerX = botPx + GAME_CONFIG.tileSize / 2;
          const centerY = botPy + GAME_CONFIG.tileSize / 2;
          ctx.fillStyle = '#ffbf00';
          ctx.beginPath();
          ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw charged indicator on bot if supercharged (2 bolts side by side, centered)
        if (bot.supercharged && chargedImageRef.current) {
          const chargedSize = GAME_CONFIG.tileSize * 0.35;
          const gap = 2; // Gap between the two bolts
          const totalWidth = chargedSize * 2 + gap;
          const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

          // Left bolt
          const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
          ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

          // Right bolt
          const rightX = leftX + chargedSize + gap;
          ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
        }

        // Draw status indicator
        if (bot.status === 'chasing' && bot.targetRabbitId) {
          ctx.fillStyle = '#ff0000';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎯', botPx + GAME_CONFIG.tileSize / 2, botPy - 8);
        }
      }
    });

    // Draw fertilizer bot using visual position for smooth movement
    if (rabbitZone.fertilizerBot && rabbitZone.fertilizerBot.status !== 'garaged') {
      const bot = rabbitZone.fertilizerBot;
      const visualX = bot.visualX ?? bot.x ?? 0;
      const visualY = bot.visualY ?? bot.y ?? 0;
      const botPx = visualX * GAME_CONFIG.tileSize;
      const botPy = visualY * GAME_CONFIG.tileSize;

      if (fertilizerBotImageRef.current) {
        ctx.drawImage(fertilizerBotImageRef.current, botPx, botPy, GAME_CONFIG.tileSize, GAME_CONFIG.tileSize);
      } else {
        // Fallback to lime circle
        const centerX = botPx + GAME_CONFIG.tileSize / 2;
        const centerY = botPy + GAME_CONFIG.tileSize / 2;
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(centerX, centerY, GAME_CONFIG.tileSize / 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw charged indicator on bot if supercharged
      if (bot.supercharged && chargedImageRef.current) {
        const chargedSize = GAME_CONFIG.tileSize * 0.35;
        const gap = 2;
        const totalWidth = chargedSize * 2 + gap;
        const chargedY = botPy + (GAME_CONFIG.tileSize - chargedSize) / 2;

        // Left bolt
        const leftX = botPx + (GAME_CONFIG.tileSize - totalWidth) / 2;
        ctx.drawImage(chargedImageRef.current, leftX, chargedY, chargedSize, chargedSize);

        // Right bolt
        const rightX = leftX + chargedSize + gap;
        ctx.drawImage(chargedImageRef.current, rightX, chargedY, chargedSize, chargedSize);
      }

      // Draw hopper indicator if bot has hopper upgrade
      if (bot.hopperUpgrade) {
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎒', botPx + GAME_CONFIG.tileSize / 2, botPy - 8);
      }

      // Draw status indicator
      if (bot.status === 'fertilizing') {
        ctx.fillStyle = '#84cc16';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌱', botPx + GAME_CONFIG.tileSize / 2, botPy + GAME_CONFIG.tileSize + 8);
      }
    }

  }, [gameState, hoveredTile, placementMode]);

  // Play water splash sound effect
  const playWaterSplash = useCallback(() => {
    if (waterSplashRef.current) {
      waterSplashRef.current.currentTime = 0; // Reset to start
      waterSplashRef.current.play().catch(() => {
        // Ignore errors if audio hasn't been initialized yet
      });
    }
  }, []);

  // Determine what action should be taken for a tile based on context
  const getActionForTile = useCallback((tile: Tile, selectedCrop: CropType | null) => {
    // PRIORITY: Uproot tool selected - can uproot planted or grown crops
    if (gameState.player.selectedTool === 'uproot' && (tile.type === 'planted' || tile.type === 'grown')) {
      return { action: 'uproot' as const, cursor: 'crosshair' };
    }

    // Rocks and trees can be cleared - show crosshair + pickaxe cursor
    if (!tile.cleared && (tile.type === 'rock' || tile.type === 'tree')) {
      return { action: 'clear' as const, cursor: 'crosshair' };
    }

    // Grown crops can be harvested - show grab cursor
    if (tile.type === 'grown') {
      return { action: 'harvest' as const, cursor: 'grab' };
    }

    // Planted crops that need water - show cell cursor
    if (tile.type === 'planted' && !tile.wateredToday) {
      return { action: 'water' as const, cursor: 'cell' };
    }

    // Planted crops already watered - show progress cursor
    if (tile.type === 'planted' && tile.wateredToday) {
      return { action: null, cursor: 'progress' };
    }

    // Grass/cleared dirt can be planted if we have a seed selected and no sprinkler
    if ((tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) && !tile.crop && !tile.hasSprinkler && selectedCrop) {
      return { action: 'plant' as const, cursor: 'copy' };
    }

    // Shop tile - show pointer to indicate clickable
    if (tile.type === 'shop') {
      return { action: 'shop' as const, cursor: 'pointer' };
    }

    // Export tile - show pointer
    if (tile.type === 'export') {
      return { action: 'export' as const, cursor: 'pointer' };
    }

    // Warehouse tile - show pointer
    if (tile.type === 'warehouse') {
      return { action: 'warehouse' as const, cursor: 'pointer' };
    }

    // Bot Factory tile - show pointer
    if (tile.type === 'botFactory') {
      return { action: 'botFactory' as const, cursor: 'pointer' };
    }

    // Well tile - show pointer
    if (tile.type === 'well') {
      return { action: 'well' as const, cursor: 'pointer' };
    }

    // Garage tile - show pointer
    if (tile.type === 'garage') {
      return { action: 'garage' as const, cursor: 'pointer' };
    }

    // Supercharger tile - show pointer
    if (tile.type === 'supercharger') {
      return { action: 'supercharger' as const, cursor: 'pointer' };
    }

    // Fertilizer building - show pointer
    if (tile.type === 'fertilizer') {
      return { action: 'fertilizer' as const, cursor: 'pointer' };
    }

    // Hopper building - show pointer
    if (tile.type === 'hopper') {
      return { action: 'hopper' as const, cursor: 'pointer' };
    }

    // Arch tile - show pointer
    if (tile.type === 'arch') {
      return { action: 'arch' as const, cursor: 'pointer' };
    }

    // Cleared grass/dirt with no seed selected - show not-allowed (need to select seed)
    if ((tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) && !tile.crop && !tile.hasSprinkler && !selectedCrop) {
      return { action: null, cursor: 'not-allowed' };
    }

    // Default - no action
    return { action: null, cursor: 'default' };
  }, [gameState.player.selectedTool]);

  // Handle canvas mouse move for hover effects and cursor changes
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Account for object-fit: contain - the canvas may be centered with letterboxing
    const canvasAspectRatio = canvas.width / canvas.height;
    const rectAspectRatio = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (rectAspectRatio > canvasAspectRatio) {
      // Letterboxing on left/right
      renderWidth = rect.height * canvasAspectRatio;
      offsetX = (rect.width - renderWidth) / 2;
    } else {
      // Letterboxing on top/bottom
      renderHeight = rect.width / canvasAspectRatio;
      offsetY = (rect.height - renderHeight) / 2;
    }

    const scaleX = canvas.width / renderWidth;
    const scaleY = canvas.height / renderHeight;

    const mouseX = (e.clientX - rect.left - offsetX) * scaleX;
    const mouseY = (e.clientY - rect.top - offsetY) * scaleY;

    const tileX = Math.floor(mouseX / GAME_CONFIG.tileSize);
    const tileY = Math.floor(mouseY / GAME_CONFIG.tileSize);

    const currentGrid = getCurrentGrid(gameState);
    const tile = currentGrid[tileY]?.[tileX];

    // Check drag threshold - only start dragging if mouse moved > 5 pixels
    if (mouseDownPos && !isDragging && tileSelectionMode && tileSelectionMode.active) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        // Mouse moved enough to be considered a drag
        setIsDragging(true);
      }
    }

    // Handle drag-to-draw in tile selection mode
    if (isDragging && tileSelectionMode && tileSelectionMode.active && dragStartRow !== null) {
      // Only allow dragging on the same row
      if (tileY === dragStartRow) {
        // Get all tiles in the row between start and current position
        const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
        const currentZone = gameState.zones[currentZoneKey];
        const seedBots = currentZone?.seedBots || [];
        const seedBot = seedBots.find(b => b.id === selectedSeedBot);

        if (seedBot) {
          // Find the job being edited
          const currentJob = seedBot.jobs.find(j => j.id === tileSelectionMode.jobId);
          if (!currentJob) return;

          // Calculate the range of X coordinates
          const startX = Math.min(tileX, ...tileSelectionMode.selectedTiles.filter(t => t.y === tileY).map(t => t.x), tileX);
          const endX = Math.max(tileX, ...tileSelectionMode.selectedTiles.filter(t => t.y === tileY).map(t => t.x), tileX);

          // Collect all valid tiles in the row
          const newTiles: Array<{ x: number; y: number }> = [];
          for (let x = startX; x <= endX; x++) {
            const rowTile = currentGrid[tileY]?.[x];
            if (rowTile && (rowTile.type === 'grass' || (rowTile.type === 'dirt' && rowTile.cleared)) && !rowTile.crop && !rowTile.hasSprinkler) {
              newTiles.push({ x, y: tileY });
            }
          }

          // Merge with existing tiles from other rows
          const tilesFromOtherRows = tileSelectionMode.selectedTiles.filter(t => t.y !== tileY);
          const allNewTiles = [...tilesFromOtherRows, ...newTiles].slice(0, 10); // Max 10 tiles per job

          // Update tile selection mode state only (don't update bot jobs until saved)
          // This prevents bots from starting to plant during the selection process
          setTileSelectionMode({
            ...tileSelectionMode,
            selectedTiles: allNewTiles,
          });
        }
      }
      return;
    }

    // Set cursor based on mode and tile
    if (placementMode) {
      // Show crosshair cursor when in placement mode and set hovered tile for preview
      setHoveredTile({ x: tileX, y: tileY });
      setCursorType('crosshair');
    } else if (tileSelectionMode && tileSelectionMode.active) {
      // Show pointer cursor when in tile selection mode
      setCursorType('pointer');
    } else if (tile) {
      setHoveredTile({ x: tileX, y: tileY });

      // Helper to create emoji cursor
      const createEmojiCursor = (emoji: string) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 32;
        tempCanvas.height = 32;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return 'default';
        tempCtx.font = '28px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(emoji, 16, 16);
        return `url(${tempCanvas.toDataURL()}) 16 16, pointer`;
      };

      // Get crop emoji map
      const cropEmojis: Record<string, string> = {
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
        corn: '🌽'
      };

      // Show crop cursor when hovering over plantable tiles
      if ((tile.type === 'grass' || tile.type === 'dirt') && !tile.crop && gameState.player.selectedCrop) {
        const cropEmoji = cropEmojis[gameState.player.selectedCrop];
        if (cropEmoji) {
          setCursorType(createEmojiCursor(cropEmoji));
          return;
        }
      }

      // Show watering can when hovering over crops that need water
      if (tile.crop && !tile.wateredToday) {
        setCursorType(createEmojiCursor('💧'));
        return;
      }

      // Show harvest tool when hovering over grown crops
      if (tile.crop && tile.growthStage === CROP_INFO[tile.crop].daysToGrow) {
        const cropEmoji = cropEmojis[tile.crop];
        if (cropEmoji) {
          setCursorType(createEmojiCursor(cropEmoji));
          return;
        }
      }

      // Show pickaxe when hovering over rocks or trees that need clearing
      if (tile.type === 'rock' || tile.type === 'tree') {
        setCursorType(createEmojiCursor('⛏️'));
        return;
      }

      // Show shop icon when hovering over shop
      if (tile.type === 'shop') {
        setCursorType(createEmojiCursor('🏪'));
        return;
      }

      // Show export icon when hovering over export building
      if (tile.type === 'export') {
        setCursorType(createEmojiCursor('🚢'));
        return;
      }

      // Show warehouse icon when hovering over warehouse
      if (tile.type === 'warehouse') {
        setCursorType(createEmojiCursor('🏭'));
        return;
      }

      // Show factory icon when hovering over bot factory
      if (tile.type === 'botFactory') {
        setCursorType(createEmojiCursor('⚙️'));
        return;
      }

      // Show well icon when hovering over well
      if (tile.type === 'well') {
        setCursorType(createEmojiCursor('🪣'));
        return;
      }

      // Show garage icon when hovering over garage
      if (tile.type === 'garage') {
        setCursorType(createEmojiCursor('🚗'));
        return;
      }

      // Show sprinkler icon when hovering over sprinkler
      if (tile.hasSprinkler) {
        setCursorType(createEmojiCursor('💦'));
        return;
      }

      // Default cursor based on tile action
      const { cursor } = getActionForTile(tile, gameState.player.selectedCrop);
      setCursorType(cursor);
    } else {
      setHoveredTile(null);
      setCursorType('default');
    }
  }, [gameState, getActionForTile, isDragging, tileSelectionMode, dragStartRow, selectedSeedBot, mouseDownPos, placementMode]);

  // Handle canvas click to queue tasks
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Account for object-fit: contain - the canvas may be centered with letterboxing
    const canvasAspectRatio = canvas.width / canvas.height;
    const rectAspectRatio = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (rectAspectRatio > canvasAspectRatio) {
      // Letterboxing on left/right
      renderWidth = rect.height * canvasAspectRatio;
      offsetX = (rect.width - renderWidth) / 2;
    } else {
      // Letterboxing on top/bottom
      renderHeight = rect.width / canvasAspectRatio;
      offsetY = (rect.height - renderHeight) / 2;
    }

    const scaleX = canvas.width / renderWidth;
    const scaleY = canvas.height / renderHeight;

    const clickX = (e.clientX - rect.left - offsetX) * scaleX;
    const clickY = (e.clientY - rect.top - offsetY) * scaleY;

    const tileX = Math.floor(clickX / GAME_CONFIG.tileSize);
    const tileY = Math.floor(clickY / GAME_CONFIG.tileSize);

    const currentGrid = getCurrentGrid(gameState);
    const tile = currentGrid[tileY]?.[tileX];
    console.log('[handleCanvasClick] Clicked tile:', { tileX, tileY, tileType: tile?.type, cleared: tile?.cleared });
    if (!tile) return;

    // Check if this tile has a queued task - if yes, cancel it
    const queuedTask = currentZone.taskQueue.find(task =>
      task.tileX === tileX && task.tileY === tileY &&
      task.zoneX === gameState.currentZone.x && task.zoneY === gameState.currentZone.y
    );

    if (queuedTask) {
      // Cancel the queued task
      setGameState(prev => removeTask(prev, queuedTask.id));
      return; // Don't continue with other click actions
    }

    // Handle tile selection mode for seed bot job configuration
    if (tileSelectionMode && tileSelectionMode.active) {
      // Allow selecting grass or cleared dirt tiles that are plantable
      if ((tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) && !tile.crop && !tile.hasSprinkler) {
        const tileCoord = { x: tileX, y: tileY };
        const existingIndex = tileSelectionMode.selectedTiles.findIndex(
          t => t.x === tileX && t.y === tileY
        );

        let newSelectedTiles;
        if (existingIndex >= 0) {
          // Remove tile if already selected
          newSelectedTiles = tileSelectionMode.selectedTiles.filter((_, i) => i !== existingIndex);
        } else if (tileSelectionMode.selectedTiles.length < 20) {
          // Add tile if under limit (20 per job)
          newSelectedTiles = [...tileSelectionMode.selectedTiles, tileCoord];
        } else {
          // Already at max, don't add
          return;
        }

        // Update tile selection mode state only (don't update bot jobs until saved)
        // This prevents bots from starting to plant during the selection process
        setTileSelectionMode({
          ...tileSelectionMode,
          selectedTiles: newSelectedTiles,
        });
      }
      return;
    }

    // Handle placement mode (sprinklers, bot factory, etc.) - instant placement
    if (placementMode === 'sprinkler') {
      setGameState(prev => placeSprinkler(prev, tileX, tileY));
      setPlacementMode(null); // Clear placement mode after placing
      return;
    }

    if (placementMode === 'botFactory') {
      console.log('Bot Factory placement clicked:', { tileX, tileY, tileType: tile.type, cleared: tile.cleared });
      // Allow placing bot factory on grass or cleared dirt tiles (2x2)
      if (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) {
        console.log('Attempting to place bot factory...');
        setGameState(prev => {
          const result = placeBotFactory(prev, tileX, tileY);
          console.log('Bot Factory placement result:', result === prev ? 'FAILED (no change)' : 'SUCCESS');
          return result;
        });
        setPlacementMode(null); // Clear placement mode after placing
      } else {
        console.log('Invalid tile for bot factory placement');
      }
      return;
    }

    if (placementMode === 'well') {
      // Allow placing well on grass or cleared dirt tiles
      if (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) {
        setGameState(prev => placeWell(prev, tileX, tileY));
        setPlacementMode(null); // Clear placement mode after placing
      }
      return;
    }

    if (placementMode === 'garage') {
      // Allow placing garage on grass or cleared dirt tiles
      if (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) {
        setGameState(prev => placeGarage(prev, tileX, tileY));
        setPlacementMode(null); // Clear placement mode after placing
      }
      return;
    }

    if (placementMode === 'supercharger') {
      // Allow placing supercharger on grass or cleared dirt tiles
      if (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) {
        setGameState(prev => placeSupercharger(prev, tileX, tileY));
        setPlacementMode(null); // Clear placement mode after placing
      }
      return;
    }

    if (placementMode === 'fertilizer') {
      // Allow placing fertilizer building on grass or cleared dirt tiles
      if (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) {
        setGameState(prev => placeFertilizerBuilding(prev, tileX, tileY));
        setPlacementMode(null); // Clear placement mode after placing
      }
      return;
    }

    if (placementMode === 'hopper') {
      // Allow placing hopper on grass or cleared dirt tiles
      if (tile.type === 'grass' || (tile.type === 'dirt' && tile.cleared)) {
        setGameState(prev => placeHopper(prev, tileX, tileY));
        setPlacementMode(null); // Clear placement mode after placing
      }
      return;
    }

    // Handle arch clicks for zone purchase/travel
    if (tile.type === 'arch' && tile.archTargetZone) {
      const zoneKey = `${tile.archTargetZone.x},${tile.archTargetZone.y}`;
      let targetZone = gameState.zones[zoneKey];

      // Create zone if it doesn't exist
      if (!targetZone) {
        targetZone = createZone(tile.archTargetZone.x, tile.archTargetZone.y, false);
        setGameState(prev => ({
          ...prev,
          zones: {
            ...prev.zones,
            [zoneKey]: targetZone,
          },
        }));
      }

      // If zone is already owned, travel directly without showing preview
      if (targetZone.owned) {
        setGameState(prev => ({
          ...prev,
          currentZone: { x: tile.archTargetZone!.x, y: tile.archTargetZone!.y },
        }));
      } else {
        // Show zone preview modal for unpurchased zones
        setPreviewZone(targetZone);
        setPurchaseZoneKey(zoneKey);
        setShowZonePreview(true);
      }
      return;
    }

    // Handle shop tile clicks
    if (tile.type === 'shop') {
      setShowShop(true);
      return;
    }

    // Handle export tile clicks
    if (tile.type === 'export') {
      setShowExportModal(true);
      return;
    }

    // Handle warehouse tile clicks
    if (tile.type === 'warehouse') {
      // Open warehouse modal
      setShowWarehouseModal(true);
      return;
    }

    // Handle bot factory tile clicks
    if (tile.type === 'botFactory') {
      setShowBotFactory(true);
      return;
    }

    // Handle garage tile clicks
    if (tile.type === 'garage') {
      setShowGarageModal(true);
      return;
    }

    // Handle supercharger tile clicks
    if (tile.type === 'supercharger') {
      setShowSuperchargerModal(true);
      return;
    }

    // Handle fertilizer building clicks
    if (tile.type === 'fertilizer') {
      // For now, just show a message - could add a modal later
      console.log('Fertilizer building clicked - refills fertilizer bot');
      return;
    }

    // Handle hopper building clicks
    if (tile.type === 'hopper') {
      setShowHopperModal(true);
      return;
    }

    // Handle well tile clicks
    if (tile.type === 'well') {
      setShowWellModal(true);
      return;
    }

    // Get context-aware action for this tile
    const { action } = getActionForTile(tile, gameState.player.selectedCrop);

    // Perform the appropriate action
    switch (action) {
      case 'clear':
        setGameState(prev => addTask(prev, 'clear', tileX, tileY));
        break;

      case 'water':
        setGameState(prev => addTask(prev, 'water', tileX, tileY));
        playWaterSplash();
        break;

      case 'harvest':
        setGameState(prev => addTask(prev, 'harvest', tileX, tileY));
        break;

      case 'uproot':
        setGameState(prev => addTask(prev, 'uproot', tileX, tileY));
        break;

      case 'plant':
        if (gameState.player.selectedCrop) {
          const crop = gameState.player.selectedCrop;
          // Check if player has enough money to buy seed
          const seedCost = getCurrentSeedCost(crop, gameState.cropsSold);
          if (gameState.player.money >= seedCost) {
            // Just add the task - seed will be auto-purchased when planting
            setGameState(prev => addTask(prev, 'plant', tileX, tileY, crop));
          } else {
            // Show no money message
            setNoSeedsCropType(crop);
            setShowNoSeedsModal(true);
          }
        }
        break;
    }
  }, [gameState, playWaterSplash, getActionForTile, placementMode, tileSelectionMode, selectedSeedBot]);

  // Handle right-click to cancel queued tasks
  const handleCanvasRightClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent context menu
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(clickX / GAME_CONFIG.tileSize);
    const tileY = Math.floor(clickY / GAME_CONFIG.tileSize);

    // Check if tile has a sprinkler - if so, uninstall it
    const currentGrid = getCurrentGrid(gameState);
    const tile = currentGrid[tileY]?.[tileX];

    if (tile?.hasSprinkler) {
      // Uninstall sprinkler and return it to inventory
      setGameState(prev => {
        const grid = getCurrentGrid(prev);
        const newGrid = grid.map((row, y) =>
          row.map((t, x) => {
            if (x === tileX && y === tileY) {
              return {
                ...t,
                hasSprinkler: false,
              };
            }
            return t;
          })
        );

        const updatedState = updateCurrentGrid(prev, newGrid);
        return {
          ...updatedState,
          player: {
            ...updatedState.player,
            inventory: {
              ...updatedState.player.inventory,
              sprinklers: updatedState.player.inventory.sprinklers + 1,
            },
          },
        };
      });
      return;
    }

    // Find and remove tasks for this tile, refunding seeds if cancelled
    setGameState(prev => {
      const currentZoneKey = getZoneKey(prev.currentZone.x, prev.currentZone.y);
      const currentZone = prev.zones[currentZoneKey];

      // No need to refund seeds since they're purchased when actually planting
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [currentZoneKey]: {
            ...currentZone,
            taskQueue: currentZone.taskQueue.filter(task =>
              !(task.tileX === tileX && task.tileY === tileY &&
                task.zoneX === prev.currentZone.x && task.zoneY === prev.currentZone.y)
            ),
          },
        },
      };
    });
  }, []);

  // Handle mouse down for drag-to-draw in tile selection mode
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tileSelectionMode || !tileSelectionMode.active) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();

    // Account for object-fit: contain - the canvas may be centered with letterboxing
    const canvasAspectRatio = canvas.width / canvas.height;
    const rectAspectRatio = rect.width / rect.height;

    let renderWidth = rect.width;
    let renderHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (rectAspectRatio > canvasAspectRatio) {
      // Letterboxing on left/right
      renderWidth = rect.height * canvasAspectRatio;
      offsetX = (rect.width - renderWidth) / 2;
    } else {
      // Letterboxing on top/bottom
      renderHeight = rect.width / canvasAspectRatio;
      offsetY = (rect.height - renderHeight) / 2;
    }

    const scaleX = canvas.width / renderWidth;
    const scaleY = canvas.height / renderHeight;

    const mouseX = (e.clientX - rect.left - offsetX) * scaleX;
    const mouseY = (e.clientY - rect.top - offsetY) * scaleY;

    const tileX = Math.floor(mouseX / GAME_CONFIG.tileSize);
    const tileY = Math.floor(mouseY / GAME_CONFIG.tileSize);

    // Store mouse down position for drag threshold detection
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setDragStartRow(tileY);
    // Don't set isDragging here - wait for mouse move with threshold
  }, [tileSelectionMode]);

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartRow(null);
    setMouseDownPos(null);
  }, []);

  // Keyboard shortcuts (no movement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'b':
          setShowShop(!showShop);
          return;
        case 'v':
          setShowSellShop(!showSellShop);
          return;
        case 'h':
          setShowInstructions(!showInstructions);
          return;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          // Number keys select tools
          const toolIndex = parseInt(e.key) - 1;
          const unlockedTools = gameState.tools.filter(t => t.unlocked);
          if (toolIndex < unlockedTools.length) {
            setGameState(prev => ({
              ...prev,
              player: { ...prev.player, selectedTool: unlockedTools[toolIndex].name },
            }));
          }
          return;
        case '6':
        case '7':
        case '8':
        case 'q':
          // Quick crop selection
          e.preventDefault();
          const crops: Array<Exclude<CropType, null>> = ['carrot', 'wheat', 'tomato'];
          let cropIndex = 0;
          if (e.key === '6' || e.key === 'q') cropIndex = 0; // Carrot
          else if (e.key === '7') cropIndex = 1; // Wheat
          else if (e.key === '8') cropIndex = 2; // Tomato

          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              selectedCrop: crops[cropIndex],
              selectedTool: 'seed_bag', // Auto-switch to seed bag
            },
          }));
          return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, showShop, showSellShop, showInstructions]);

  const confirmNewGame = () => {
    // Show welcome page so user can choose to start new or load existing game
    setShowWelcome(true);
    setSellMessage('');
    setShowShop(false);
    setShowSellShop(false);
    setShowExportModal(false);
    setShowBotFactory(false);
    setShowWarehouseModal(false);
    setShowGarageModal(false);
    setShowInstructions(false);
    setShowNewGameConfirm(false);
  };

  const addDebugMoney = () => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        money: prev.player.money + 1000,
      },
    }));
  };

  const handlePurchaseZone = () => {
    const targetZone = gameState.zones[purchaseZoneKey];
    if (!targetZone) return;

    const canAfford = gameState.player.money >= targetZone.purchasePrice;
    if (canAfford) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money - targetZone.purchasePrice,
        },
        zones: {
          ...prev.zones,
          [purchaseZoneKey]: { ...targetZone, owned: true },
        },
      }));
      setShowPurchaseModal(false);
      setPurchaseZoneKey('');
    }
  };

  const handleZoneTravel = () => {
    if (!previewZone) return;

    if (previewZone.owned) {
      // Just travel
      setGameState(prev => ({
        ...prev,
        currentZone: { x: previewZone.x, y: previewZone.y },
      }));
      setShowZonePreview(false);
      setPreviewZone(null);
    } else {
      // Purchase and travel
      const canAfford = gameState.player.money >= previewZone.purchasePrice;
      if (canAfford) {
        setGameState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            money: prev.player.money - previewZone.purchasePrice,
          },
          zones: {
            ...prev.zones,
            [purchaseZoneKey]: { ...previewZone, owned: true },
          },
          currentZone: { x: previewZone.x, y: previewZone.y },
        }));
        setShowZonePreview(false);
        setPreviewZone(null);
      }
    }
  };

  const sellToVendor = (vendorIndex: number, cropType: Exclude<CropType, null>, vendorPrice: number) => {
    // Filter crops of the specified type from basket AND warehouse
    const basketCrops = gameState.player.basket.filter(item => item.crop === cropType);
    const warehouseCrops = gameState.warehouse.filter(item => item.crop === cropType);
    const allCropsToSell = [...basketCrops, ...warehouseCrops];

    if (allCropsToSell.length === 0) {
      setSellMessage('No crops of that type available!');
      setTimeout(() => setSellMessage(''), 3000);
      return;
    }

    // Calculate total earnings with quality multiplier
    let totalEarned = 0;
    allCropsToSell.forEach(item => {
      const pricePerCrop = Math.floor(vendorPrice * item.quality.yield);
      totalEarned += pricePerCrop;
    });

    // Remove sold crops from basket and warehouse
    const remainingBasket = gameState.player.basket.filter(item => item.crop !== cropType);
    const remainingWarehouse = gameState.warehouse.filter(item => item.crop !== cropType);

    // Get the current zone for earnings tracking
    const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
    const currentZone = gameState.zones[currentZoneKey];
    const zoneName = currentZone?.name || 'Unknown Zone';

    // Calculate average quality for this crop type
    const avgQuality = allCropsToSell.reduce((sum, item) => sum + item.quality.yield, 0) / allCropsToSell.length;
    const pricePerUnit = Math.floor(vendorPrice * avgQuality);

    // Create sale record
    const saleRecord: SaleRecord = {
      timestamp: gameState.gameTime,
      day: gameState.currentDay,
      crop: cropType,
      quantity: allCropsToSell.length,
      pricePerUnit,
      totalRevenue: totalEarned,
      zoneKey: currentZoneKey,
    };

    // Update sales history (keep last 100 records)
    const existingSalesHistory = gameState.salesHistory || [];
    const newSalesHistory = [...existingSalesHistory, saleRecord].slice(-100);

    // Create updated state with earnings and sales
    let updatedState: GameState = {
      ...gameState,
      player: {
        ...gameState.player,
        money: gameState.player.money + totalEarned,
        basket: remainingBasket,
      },
      warehouse: remainingWarehouse,
      cropsSold: {
        ...gameState.cropsSold,
        [cropType]: (gameState.cropsSold[cropType] || 0) + allCropsToSell.length,
      },
      salesHistory: newSalesHistory,
    };

    // Record earnings for this zone
    updatedState = recordZoneEarnings(updatedState, totalEarned, zoneName);

    // Update game state
    setGameState(updatedState);

    setSellMessage(`Sold ${allCropsToSell.length} ${cropType}(s) (${basketCrops.length} from basket, ${warehouseCrops.length} from warehouse) for $${totalEarned}!`);
    setTimeout(() => setSellMessage(''), 3000);
  };

  // Welcome Splash Handlers
  const handleStartNew = () => {
    // Clear all saves
    clearAutosave();
    localStorage.removeItem('aaron-chelsea-farm-save');

    setGameState(createInitialState());
    setShowWelcome(false);
    // Close all modals
    setShowShop(false);
    setShowSellShop(false);
    setShowExportModal(false);
    setShowBotFactory(false);
    setShowWarehouseModal(false);
    setShowGarageModal(false);
  };

  const handleContinue = () => {
    const saved = loadFromLocalStorage();
    if (saved) {
      // Migrate old saves that don't have markedForSale
      if (!saved.markedForSale) {
        saved.markedForSale = [];
      }
      setGameState(saved);
    }
    setShowWelcome(false);
    // Close all modals
    setShowShop(false);
    setShowSellShop(false);
    setShowExportModal(false);
    setShowBotFactory(false);
    setShowWarehouseModal(false);
    setShowGarageModal(false);
  };

  const handleLoadFromCode = async (code: string) => {
    const loaded = await loadFromSaveCode(code);
    // Migrate old saves that don't have markedForSale
    if (!loaded.markedForSale) {
      loaded.markedForSale = [];
    }
    setGameState(loaded);
    setShowWelcome(false);
    // Close all modals
    setShowShop(false);
    setShowSellShop(false);
    setShowExportModal(false);
    setShowBotFactory(false);
    setShowWarehouseModal(false);
    setShowGarageModal(false);
  };

  const handleShowTutorial = () => {
    setShowTutorialModal(true);
  };

  // Save Game Handler
  const handleSaveGame = async () => {
    try {
      // Pass existing code if available
      const code = await generateSaveCode(gameState, gameState.saveCode);
      setCurrentSaveCode(code);
      setGameState(prev => ({ ...prev, saveCode: code }));
      setShowSaveModal(true);
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Failed to save game. Please try again.');
    }
  };

  // Get current zone and its bots
  const currentZoneKey = getZoneKey(gameState.currentZone.x, gameState.currentZone.y);
  const currentZone = gameState.zones[currentZoneKey];
  const waterBots = currentZone?.waterBots || [];
  const harvestBots = currentZone?.harvestBots || [];
  const seedBots = currentZone?.seedBots || [];
  const transportBots = currentZone?.transportBots || [];
  const demolishBots = currentZone?.demolishBots || [];
  const hunterBots = currentZone?.hunterBots || [];
  const fertilizerBot = currentZone?.fertilizerBot;


  return (
    <div className="fixed inset-0 flex gap-2 p-2 pb-4 overflow-hidden">
      {/* Left Sidebar - Farmer Status */}
      <div className="w-52 bg-black/70 p-2 rounded-lg text-white flex flex-col gap-2 max-h-full overflow-y-auto">
        <div className="text-sm font-bold text-center mb-2 text-green-400">👨‍🌾 Farmer</div>

        {/* Task Queue (Current + Next 2 Queued) */}
        <div className="bg-blue-900/30 border border-blue-600 rounded px-2 py-1.5 mb-1">
          <div className="text-xs text-blue-300 font-bold mb-1.5">QUEUE (Max 3):</div>
          <div className="space-y-1">
            {/* Current Task (Position 1) */}
            {currentZone.currentTask ? (
              <div className="bg-green-900/70 border-2 border-green-500 rounded px-2 py-1.5">
                <div className="text-[10px] text-green-400 font-bold mb-0.5">▶ ACTIVE</div>
                <div className="text-sm flex items-center gap-1">
                  {currentZone.currentTask.type === 'clear' ? '⛏️ Clearing' :
                   currentZone.currentTask.type === 'plant' ? '🌱 Planting' :
                   currentZone.currentTask.type === 'water' ? '💧 Watering' :
                   currentZone.currentTask.type === 'harvest' ? '🌾 Harvesting' :
                   currentZone.currentTask.type === 'place_sprinkler' ? '💦 Placing Sprinkler' :
                   currentZone.currentTask.type === 'place_botFactory' ? '⚙️ Building Factory' :
                   currentZone.currentTask.type === 'place_well' ? '🪣 Digging Well' :
                   currentZone.currentTask.type === 'deposit' ? '📦 Depositing' :
                   '🔨 Working'}
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-1.5 bg-green-500 rounded-full transition-all"
                    style={{ width: `${currentZone.currentTask.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-600 rounded px-2 py-1">
                <div className="text-sm text-gray-400 text-center">Idle</div>
              </div>
            )}

            {/* Next 2 Queued Tasks */}
            {currentZone.taskQueue.slice(0, 2).map((task, idx) => {
              // Helper function to get crop icon
              const getCropIcon = (cropType: string | null | undefined) => {
                if (cropType === 'carrot') return '🥕';
                else if (cropType === 'wheat') return '🌾';
                else if (cropType === 'tomato') return '🍅';
                else if (cropType === 'pumpkin') return '🎃';
                else if (cropType === 'watermelon') return '🍉';
                else if (cropType === 'peppers') return '🌶️';
                else if (cropType === 'grapes') return '🍇';
                else if (cropType === 'oranges') return '🍊';
                else if (cropType === 'avocado') return '🥑';
                else if (cropType === 'rice') return '🍚';
                else if (cropType === 'corn') return '🌽';
                else return '🌱';
              };

              // Get work icon and crop icon
              let workIcon = '🔨';
              let cropIcon = '';

              if (task.type === 'clear') workIcon = '⛏️';
              else if (task.type === 'plant') {
                workIcon = '🌱';
                cropIcon = getCropIcon(task.cropType);
              }
              else if (task.type === 'water') {
                workIcon = '💧';
                const tile = currentZone.grid[task.tileY]?.[task.tileX];
                cropIcon = getCropIcon(tile?.crop);
              }
              else if (task.type === 'harvest') {
                workIcon = '🌾';
                const tile = currentZone.grid[task.tileY]?.[task.tileX];
                cropIcon = getCropIcon(tile?.crop);
              }
              else if (task.type === 'place_sprinkler') workIcon = '💦';
              else if (task.type === 'place_botFactory') workIcon = '⚙️';
              else if (task.type === 'place_well') workIcon = '🪣';
              else if (task.type === 'deposit') workIcon = '📦';

              return (
                <div key={task.id} className="bg-blue-900/30 border border-blue-600 rounded px-2 py-1">
                  <div className="text-sm flex items-center gap-1">
                    <span className="text-blue-400 font-bold">{idx + 2}.</span>
                    <span>{workIcon}{cropIcon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Farmer Basket/Inventory */}
        <div className="bg-amber-900/30 border border-amber-600 rounded px-2 py-1.5 mb-2">
          <div className="text-xs text-amber-300 font-bold mb-1">🧺 BASKET ({gameState.player.basket.length}/{gameState.player.basketCapacity})</div>
          {gameState.player.basket.length > 0 ? (
            <div className="space-y-0.5">
              {gameState.player.basket.map((item, idx) => {
                const cropEmojis: Record<string, string> = {
                  carrot: '🥕', wheat: '🌾', tomato: '🍅', pumpkin: '🎃',
                  watermelon: '🍉', peppers: '🌶️', grapes: '🍇', oranges: '🍊',
                  avocado: '🥑', rice: '🍚', corn: '🌽'
                };
                return (
                  <div key={idx} className="text-xs text-white flex items-center gap-1">
                    <span>{cropEmojis[item.crop]}</span>
                    <span className="text-amber-200">Q:{item.quality.yield.toFixed(1)}x</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-400 text-center py-1">Empty</div>
          )}
        </div>

        {/* Farmer Automation Controls */}
        <div className="bg-purple-900/30 border border-purple-600 rounded px-2 py-2 mb-2">
          <div className="text-xs text-purple-300 font-bold mb-2">🤖 AUTOMATION</div>
          <div className="space-y-1.5">
            {/* Auto Plant */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-purple-800/20 px-1 py-0.5 rounded">
              <input
                type="checkbox"
                checked={gameState.player.farmerAuto.autoPlant}
                onChange={() => {
                  setGameState(prev => ({
                    ...prev,
                    player: {
                      ...prev.player,
                      farmerAuto: {
                        ...prev.player.farmerAuto,
                        autoPlant: !prev.player.farmerAuto.autoPlant,
                      },
                    },
                  }));
                }}
                className="w-3 h-3"
              />
              <span className="text-xs text-white">Auto Plant</span>
            </label>
            {/* Crop Selector for Auto Plant - Dropdown */}
            {gameState.player.farmerAuto.autoPlant && (
              <div className="ml-5 text-xs crop-dropdown-container relative">
                <label className="text-gray-400 mb-1 block">Crop rotation:</label>
                <button
                  onClick={() => setShowCropDropdown(!showCropDropdown)}
                  className="w-full bg-purple-900/50 border border-purple-600 rounded px-2 py-1.5 text-white text-xs text-left flex items-center justify-between hover:bg-purple-800/50 transition-colors"
                >
                  <span>
                    {gameState.player.farmerAuto.autoPlantCrops.length === 0
                      ? 'Select crops...'
                      : `${gameState.player.farmerAuto.autoPlantCrops.length} crop${gameState.player.farmerAuto.autoPlantCrops.length !== 1 ? 's' : ''} selected`}
                  </span>
                  <span className="text-purple-400">{showCropDropdown ? '▲' : '▼'}</span>
                </button>
                {showCropDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-purple-950 border border-purple-600 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                    {[
                      { value: 'carrot', label: '🥕 Carrot' },
                      { value: 'wheat', label: '🌾 Wheat' },
                      { value: 'tomato', label: '🍅 Tomato' },
                      { value: 'pumpkin', label: '🎃 Pumpkin' },
                      { value: 'watermelon', label: '🍉 Watermelon' },
                      { value: 'peppers', label: '🌶️ Peppers' },
                      { value: 'grapes', label: '🍇 Grapes' },
                      { value: 'oranges', label: '🍊 Oranges' },
                      { value: 'avocado', label: '🥑 Avocado' },
                      { value: 'rice', label: '🍚 Rice' },
                      { value: 'corn', label: '🌽 Corn' },
                    ].map((crop) => {
                      const isSelected = gameState.player.farmerAuto.autoPlantCrops.includes(crop.value as any);
                      return (
                        <label
                          key={crop.value}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-purple-800/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newCrops = e.target.checked
                                ? [...gameState.player.farmerAuto.autoPlantCrops, crop.value]
                                : gameState.player.farmerAuto.autoPlantCrops.filter(c => c !== crop.value);
                              setGameState(prev => ({
                                ...prev,
                                player: {
                                  ...prev.player,
                                  farmerAuto: {
                                    ...prev.player.farmerAuto,
                                    autoPlantCrops: newCrops as any[],
                                  },
                                },
                              }));
                            }}
                            className="w-3.5 h-3.5"
                          />
                          <span className="text-white">{crop.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Auto Water */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-purple-800/20 px-1 py-0.5 rounded">
              <input
                type="checkbox"
                checked={gameState.player.farmerAuto.autoWater}
                onChange={() => {
                  setGameState(prev => ({
                    ...prev,
                    player: {
                      ...prev.player,
                      farmerAuto: {
                        ...prev.player.farmerAuto,
                        autoWater: !prev.player.farmerAuto.autoWater,
                      },
                    },
                  }));
                }}
                className="w-3 h-3"
              />
              <span className="text-xs text-white">Auto Water</span>
            </label>

            {/* Auto Harvest */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-purple-800/20 px-1 py-0.5 rounded">
              <input
                type="checkbox"
                checked={gameState.player.farmerAuto.autoHarvest}
                onChange={() => {
                  setGameState(prev => ({
                    ...prev,
                    player: {
                      ...prev.player,
                      farmerAuto: {
                        ...prev.player.farmerAuto,
                        autoHarvest: !prev.player.farmerAuto.autoHarvest,
                      },
                    },
                  }));
                }}
                className="w-3 h-3"
              />
              <span className="text-xs text-white">Auto Harvest</span>
            </label>

            {/* Deposit Destination - Radio buttons */}
            <div className="border-t border-purple-700 pt-1.5 mt-1.5">
              <div className="text-xs text-purple-300 mb-1">Harvest Destination:</div>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-purple-800/20 px-1 py-0.5 rounded">
                <input
                  type="radio"
                  name="depositDestination"
                  checked={gameState.player.farmerAuto.autoSell}
                  onChange={() => {
                    setGameState(prev => ({
                      ...prev,
                      player: {
                        ...prev.player,
                        farmerAuto: {
                          ...prev.player.farmerAuto,
                          autoSell: true,
                        },
                      },
                    }));
                  }}
                  className="w-3 h-3"
                />
                <span className="text-xs text-white">🚢 Auto Sell</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-purple-800/20 px-1 py-0.5 rounded">
                <input
                  type="radio"
                  name="depositDestination"
                  checked={!gameState.player.farmerAuto.autoSell}
                  onChange={() => {
                    setGameState(prev => ({
                      ...prev,
                      player: {
                        ...prev.player,
                        farmerAuto: {
                          ...prev.player.farmerAuto,
                          autoSell: false,
                        },
                      },
                    }));
                  }}
                  className="w-3 h-3"
                />
                <span className="text-xs text-white">🏭 To Warehouse</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center gap-2 flex-1 min-h-0 pb-2">
      {/* Compact Top Bar */}
      <div className="w-full bg-black/70 px-4 py-2 rounded-lg text-white flex items-center justify-between">
        {/* Left: Title & Actions */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold cursor-pointer hover:text-green-300 transition-colors" onClick={() => setShowFarmNameEditor(true)}>
            🌾 {gameState.player.farmName} ✏️
          </h1>
          <button onClick={handleSaveGame} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-bold">💾 Save</button>
          <button onClick={() => setShowNewGameConfirm(true)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold">🆕 New Game</button>
          <button onClick={() => setShowTutorialModal(true)} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm font-bold" title="Open Tutorial">❓ Help</button>
          <button onClick={addDebugMoney} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-bold" title="Debug: Add $1000">💰</button>
          <button
            onClick={() => {
              setGameState(prev => {
                const zoneKey = getZoneKey(prev.currentZone.x, prev.currentZone.y);
                const zone = prev.zones[zoneKey];

                // Spawn rabbit at random edge
                const edge = Math.floor(Math.random() * 4);
                let x: number, y: number;
                if (edge === 0) { x = Math.floor(Math.random() * 16); y = 0; }
                else if (edge === 1) { x = Math.floor(Math.random() * 16); y = 11; }
                else if (edge === 2) { x = 15; y = Math.floor(Math.random() * 12); }
                else { x = 0; y = Math.floor(Math.random() * 12); }

                const maxCropsToEat = 3 + Math.floor(Math.random() * 3); // Random 3-5
                const newRabbit = {
                  id: `rabbit-${Date.now()}-${Math.random()}`,
                  x, y, visualX: x, visualY: y,
                  status: 'wandering' as const,
                  spawnTime: prev.gameTime,
                  cropsEaten: 0,
                  maxCropsToEat,
                };

                return {
                  ...prev,
                  zones: {
                    ...prev.zones,
                    [zoneKey]: {
                      ...zone,
                      rabbits: [...zone.rabbits, newRabbit],
                    },
                  },
                };
              });
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-bold"
            title="Debug: Spawn Rabbit"
          >
            🐰
          </button>

          {/* Music Selector - Only show in farm zone */}
          {isInFarmZone() && (
            <div className="relative">
              <button
                onClick={() => setShowMusicDropdown(!showMusicDropdown)}
                className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded text-sm font-bold flex items-center gap-1"
                title="Select farm music"
              >
                {isMusicMuted ? '🔇' : '🎵'} Music
              </button>
              {showMusicDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-black/95 border-2 border-pink-500 rounded-lg shadow-xl z-50 min-w-[250px] max-h-[500px] overflow-y-auto">
                  <div className="p-2">
                    {/* Music Controls */}
                    <button
                      onClick={toggleMusicMute}
                      className="w-full text-left px-3 py-2 rounded text-sm hover:bg-pink-700 transition-colors bg-pink-800 mb-2"
                    >
                      {isMusicMuted ? '🔊 Unmute' : '🔇 Mute'}
                    </button>

                    {/* Volume Slider */}
                    <div className="px-3 py-2 bg-pink-800/50 rounded mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-pink-300">🔊 Volume</span>
                        <span className="text-xs text-pink-400 ml-auto">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={musicVolume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-pink-900 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${musicVolume * 100}%, #831843 ${musicVolume * 100}%, #831843 100%)`
                        }}
                      />
                    </div>

                    {/* Playback Controls */}
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={togglePausePlay}
                        className="flex-1 px-3 py-2 bg-pink-800 hover:bg-pink-700 rounded text-sm font-bold transition-colors"
                        title={isMusicPaused ? 'Play' : 'Pause'}
                      >
                        {isMusicPaused ? '▶️ Play' : '⏸️ Pause'}
                      </button>
                      <button
                        onClick={nextSong}
                        className="flex-1 px-3 py-2 bg-pink-800 hover:bg-pink-700 rounded text-sm font-bold transition-colors"
                        title="Next song"
                      >
                        ⏭️ Next
                      </button>
                    </div>

                    <div className="border-t border-pink-600 mb-2"></div>

                    {/* Farm Music Section */}
                    <div
                      onClick={() => setShowFarmMusicSection(!showFarmMusicSection)}
                      className="text-xs font-bold text-pink-400 mb-2 px-2 cursor-pointer hover:text-pink-300 flex items-center gap-2"
                    >
                      <span>{showFarmMusicSection ? '▼' : '▶'}</span>
                      <span>Farm Music ({farmSongs.length})</span>
                    </div>
                    {showFarmMusicSection && farmSongs.map((song, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                          currentSongIndex === index && !isMusicMuted ? 'bg-pink-600 font-bold' : 'hover:bg-pink-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enabledSongs.has(index)}
                          onChange={() => toggleSongEnabled(index)}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                          title="Include in auto-rotation"
                        />
                        <span
                          onClick={() => handleSongSelect(index)}
                          className="flex-1 cursor-pointer"
                        >
                          {currentSongIndex === index && !isMusicMuted && '▶ '}
                          {song.name}
                        </span>
                      </div>
                    ))}

                    {/* Farm Rap Section */}
                    <div
                      onClick={() => setShowFarmRapSection(!showFarmRapSection)}
                      className="text-xs font-bold text-pink-400 mb-2 px-2 cursor-pointer hover:text-pink-300 flex items-center gap-2 mt-3 border-t border-pink-700 pt-2"
                    >
                      <span>{showFarmRapSection ? '▼' : '▶'}</span>
                      <span>Farm Rap ({farmRapSongs.length}) - Manual Only</span>
                    </div>
                    {showFarmRapSection && farmRapSongs.map((song, index) => (
                      <div
                        key={`rap-${index}`}
                        onClick={() => handleRapSongSelect(index)}
                        className="px-3 py-2 rounded text-sm transition-colors hover:bg-pink-700 cursor-pointer"
                      >
                        {song.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Stats Icons */}
        <div className="flex items-center gap-4">
          {/* Goods Economy Button */}
          {gameState.market && (
            <div
              className="flex items-center gap-2 px-2 py-1 rounded border border-blue-500 cursor-pointer hover:bg-blue-700 transition-colors"
              onClick={() => setShowEconomyModal(true)}
              title="Click to view Goods Economy - Price trends & forecasts"
            >
              <span>📊</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold capitalize">{gameState.market.currentSeason}</span>
                <span className="text-xs text-gray-300">Day {gameState.currentDay}</span>
              </div>
            </div>
          )}
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-green-700 px-2 py-1 rounded transition-colors"
            onClick={() => setShowIncomeModal(true)}
            title="Click to view income history"
          >
            <span>💰</span><span className="font-bold">${gameState.player.money}</span>
          </div>
        </div>
      </div>


      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.gridWidth * GAME_CONFIG.tileSize}
        height={GAME_CONFIG.gridHeight * GAME_CONFIG.tileSize}
        className="border-4 border-white rounded-lg shadow-2xl flex-1 min-h-0"
        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', cursor: cursorType }}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
      />

      {/* Seed Selection Bar */}
      <div className="flex gap-2 w-full bg-black/70 p-2 rounded-lg overflow-x-auto">
        <div className="text-white font-bold text-lg flex items-center hidden md:flex">🌱</div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'carrot'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'carrot'
                ? 'bg-orange-600 ring-2 ring-orange-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/carrot.png" alt="Carrot" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('carrot', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-orange-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-orange-400 mb-1">🥕 Carrot</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.carrot.daysToGrow} day{CROP_INFO.carrot.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('carrot', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('carrot', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('carrot', gameState.cropsSold) - getCurrentSeedCost('carrot', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'wheat'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'wheat'
                ? 'bg-yellow-600 ring-2 ring-yellow-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/wheat.png" alt="Wheat" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('wheat', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-yellow-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-yellow-400 mb-1">🌾 Wheat</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.wheat.daysToGrow} day{CROP_INFO.wheat.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('wheat', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('wheat', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('wheat', gameState.cropsSold) - getCurrentSeedCost('wheat', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'tomato'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'tomato'
                ? 'bg-red-600 ring-2 ring-red-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/tomato.png" alt="Tomato" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('tomato', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-red-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-red-400 mb-1">🍅 Tomato</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.tomato.daysToGrow} day{CROP_INFO.tomato.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('tomato', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('tomato', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('tomato', gameState.cropsSold) - getCurrentSeedCost('tomato', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'pumpkin'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'pumpkin'
                ? 'bg-orange-500 ring-2 ring-orange-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/pumpkin.png" alt="Pumpkin" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('pumpkin', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-orange-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-orange-400 mb-1">🎃 Pumpkin</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.pumpkin.daysToGrow} day{CROP_INFO.pumpkin.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('pumpkin', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('pumpkin', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('pumpkin', gameState.cropsSold) - getCurrentSeedCost('pumpkin', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'watermelon'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'watermelon'
                ? 'bg-green-500 ring-2 ring-green-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/watermelon.png" alt="Watermelon" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('watermelon', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-green-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-green-400 mb-1">🍉 Watermelon</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.watermelon.daysToGrow} day{CROP_INFO.watermelon.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('watermelon', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('watermelon', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('watermelon', gameState.cropsSold) - getCurrentSeedCost('watermelon', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'peppers'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'peppers'
                ? 'bg-red-500 ring-2 ring-red-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/peppers.png" alt="Peppers" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('peppers', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-red-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-red-400 mb-1">🌶️ Peppers</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.peppers.daysToGrow} day{CROP_INFO.peppers.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('peppers', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('peppers', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('peppers', gameState.cropsSold) - getCurrentSeedCost('peppers', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'grapes'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'grapes'
                ? 'bg-purple-600 ring-2 ring-purple-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/grapes.png" alt="Grapes" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('grapes', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-purple-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-purple-400 mb-1">🍇 Grapes</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.grapes.daysToGrow} day{CROP_INFO.grapes.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('grapes', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('grapes', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('grapes', gameState.cropsSold) - getCurrentSeedCost('grapes', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'oranges'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'oranges'
                ? 'bg-orange-400 ring-2 ring-orange-200 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/oranges.png" alt="Oranges" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('oranges', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-orange-400/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-orange-300 mb-1">🍊 Oranges</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.oranges.daysToGrow} day{CROP_INFO.oranges.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('oranges', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('oranges', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('oranges', gameState.cropsSold) - getCurrentSeedCost('oranges', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'avocado'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'avocado'
                ? 'bg-green-600 ring-2 ring-green-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/avocado.png" alt="Avocado" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('avocado', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-green-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-green-400 mb-1">🥑 Avocado</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.avocado.daysToGrow} day{CROP_INFO.avocado.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('avocado', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('avocado', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('avocado', gameState.cropsSold) - getCurrentSeedCost('avocado', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'rice'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'rice'
                ? 'bg-gray-400 ring-2 ring-gray-200 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/rice.png" alt="Rice" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('rice', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-400/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-gray-300 mb-1">🍚 Rice</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.rice.daysToGrow} day{CROP_INFO.rice.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('rice', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('rice', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('rice', gameState.cropsSold) - getCurrentSeedCost('rice', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={() =>
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  selectedCrop: 'corn'
                },
              }))
            }
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
              gameState.player.selectedCrop === 'corn'
                ? 'bg-yellow-500 ring-2 ring-yellow-300 scale-105 md:scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <NextImage src="/corn.png" alt="Corn" width={28} height={28} className="object-contain md:w-8 md:h-8" /> <span className="text-xs md:text-sm">${getCurrentSeedCost('corn', gameState.cropsSold)}</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-yellow-500/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="font-bold text-yellow-300 mb-1">🌽 Corn</div>
            <div className="space-y-0.5">
              <div>⏱️ Grows in <span className="text-green-400 font-semibold">{CROP_INFO.corn.daysToGrow} day{CROP_INFO.corn.daysToGrow !== 1 ? 's' : ''}</span></div>
              <div>💰 Cost: <span className="text-red-400 font-semibold">${getCurrentSeedCost('corn', gameState.cropsSold)}</span> | Sells: <span className="text-green-400 font-semibold">${getCurrentSellPrice('corn', gameState.cropsSold)}</span></div>
              <div>📈 Profit: <span className="text-yellow-400 font-bold">${getCurrentSellPrice('corn', gameState.cropsSold) - getCurrentSeedCost('corn', gameState.cropsSold)}</span></div>
            </div>
          </div>
        </div>

        {/* Uproot Tool - Far right */}
        <button
          onClick={() =>
            setGameState(prev => ({
              ...prev,
              player: {
                ...prev.player,
                selectedCrop: null,
                selectedTool: 'uproot' as ToolType
              },
            }))
          }
          className={`ml-auto px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xl md:text-2xl flex items-center gap-1 md:gap-2 transition-all ${
            gameState.player.selectedTool === 'uproot'
              ? 'bg-red-700 ring-2 ring-red-400 scale-105 md:scale-110'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title="Uproot - Remove plants and clear seed bot tiles"
        >
          <span>🪓</span>
          <span className="text-xs md:text-sm hidden md:inline">Uproot</span>
        </button>
      </div>

      {/* Placement Toolbar - Compact menu for placing items */}
      {isMounted && (gameState.player.inventory.sprinklers > 0 || (gameState.player.inventory.botFactory > 0 && !gameState.player.inventory.botFactoryPlaced) || (gameState.player.inventory.well > 0 && !gameState.player.inventory.wellPlaced) || ((gameState.player.inventory.garage ?? 0) > 0 && !(gameState.player.inventory.garagePlaced ?? false)) || ((gameState.player.inventory.supercharger ?? 0) > 0 && !(gameState.player.inventory.superchargerPlaced ?? false))) && (
        <div className="w-full bg-gradient-to-r from-blue-900/90 to-purple-900/90 p-3 rounded-lg border-4 border-yellow-400 flex items-center gap-3 shadow-2xl animate-pulse" style={{
          boxShadow: '0 0 30px rgba(250, 204, 21, 0.8), 0 0 60px rgba(250, 204, 21, 0.5), 0 0 90px rgba(250, 204, 21, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="text-white font-bold text-base flex items-center gap-2">
            <span className="text-2xl">🔨</span>
            <span>Place Items:</span>
          </div>

          {/* Sprinkler Placement Button */}
          {gameState.player.inventory.sprinklers > 0 && (
            <button
              onClick={() => setPlacementMode(placementMode === 'sprinkler' ? null : 'sprinkler')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'sprinkler'
                  ? 'bg-cyan-500 ring-4 ring-cyan-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
              }`}
            >
              💦 Sprinkler <span className="text-sm bg-black/30 px-2 py-1 rounded">×{gameState.player.inventory.sprinklers}</span>
            </button>
          )}

          {/* Bot Factory Placement Button */}
          {gameState.player.inventory.botFactory > 0 && !gameState.player.inventory.botFactoryPlaced && (
            <button
              onClick={() => setPlacementMode(placementMode === 'botFactory' ? null : 'botFactory')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'botFactory'
                  ? 'bg-orange-500 ring-4 ring-orange-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 animate-pulse ring-2 ring-orange-400/50'
              }`}
            >
              ⚙️ Bot Factory
            </button>
          )}

          {/* Well Placement Button */}
          {gameState.player.inventory.well > 0 && !gameState.player.inventory.wellPlaced && (
            <button
              onClick={() => setPlacementMode(placementMode === 'well' ? null : 'well')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'well'
                  ? 'bg-blue-500 ring-4 ring-blue-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 animate-pulse ring-2 ring-blue-400/50'
              }`}
            >
              🪣 Water Well
            </button>
          )}
{/* Garage Placement Button */}
          {(gameState.player.inventory.garage ?? 0) > 0 && !(gameState.player.inventory.garagePlaced ?? false) && (
            <button
              onClick={() => setPlacementMode(placementMode === 'garage' ? null : 'garage')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'garage'
                  ? 'bg-orange-500 ring-4 ring-orange-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 animate-pulse ring-2 ring-orange-400/50'
              }`}
            >
              🚗 Garage
            </button>
          )}

          {/* Supercharger Placement Button */}
          {(gameState.player.inventory.supercharger ?? 0) > 0 && !(gameState.player.inventory.superchargerPlaced ?? false) && (
            <button
              onClick={() => setPlacementMode(placementMode === 'supercharger' ? null : 'supercharger')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'supercharger'
                  ? 'bg-purple-500 ring-4 ring-purple-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 animate-pulse ring-2 ring-purple-400/50'
              }`}
            >
              ⚡ Supercharger
            </button>
          )}

          {/* Fertilizer Building Placement Button */}
          {(gameState.player.inventory.fertilizerBuilding ?? 0) > 0 && !(gameState.player.inventory.fertilizerBuildingPlaced ?? false) && (
            <button
              onClick={() => setPlacementMode(placementMode === 'fertilizer' ? null : 'fertilizer')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'fertilizer'
                  ? 'bg-lime-500 ring-4 ring-lime-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 animate-pulse ring-2 ring-lime-400/50'
              }`}
            >
              🌱 Fertilizer
            </button>
          )}

          {/* Hopper Placement Button */}
          {(gameState.player.inventory.hopper ?? 0) > 0 && !(gameState.player.inventory.hopperPlaced ?? false) && (
            <button
              onClick={() => setPlacementMode(placementMode === 'hopper' ? null : 'hopper')}
              className={`px-4 py-2 rounded-lg font-bold text-base flex items-center gap-2 transition-all ${
                placementMode === 'hopper'
                  ? 'bg-cyan-500 ring-4 ring-cyan-300 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 animate-pulse ring-2 ring-cyan-400/50'
              }`}
            >
              🎒 Hopper
            </button>
          )}

          {/* Cancel/Clear Selection */}
          {placementMode && (
            <button
              onClick={() => setPlacementMode(null)}
              className="px-4 py-2 rounded-lg font-bold text-base bg-red-600 hover:bg-red-700 ml-auto flex items-center gap-2"
            >
              ✕ Cancel Placement
            </button>
          )}

          {/* Help Text */}
          {placementMode && (
            <div className="text-yellow-300 text-sm font-bold ml-2 bg-black/40 px-3 py-1 rounded">
              👉 {
                placementMode === 'sprinkler' ? 'Click any tile to place sprinkler' :
                placementMode === 'botFactory' ? 'Click grass tile to place shop (2 min build)' :
                placementMode === 'well' ? 'Click grass tile to place well' :
                placementMode === 'garage' ? 'Click grass tile to place garage' :
                placementMode === 'supercharger' ? 'Click grass tile to place supercharger' :
                placementMode === 'fertilizer' ? 'Click grass tile to place fertilizer building' :
                placementMode === 'hopper' ? 'Click grass tile to place hopper' :
                'Click a tile to place'
              }
            </div>
          )}
        </div>
      )}

      {/* Sell Message */}
      {sellMessage && (
        <div
          className={`text-white px-6 py-3 rounded-lg font-bold ${
            sellMessage.includes('Sold') ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {sellMessage}
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-4 border-green-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">📖 How to Play</h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-2xl hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Movement:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>WASD or Arrow Keys:</strong> Move your farmer around the grid</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Tools:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Press 1-5 or Click:</strong> Select a tool</li>
                  <li><strong>Space or E:</strong> Use the selected tool</li>
                  <li><strong>{TOOL_ICONS.hoe} Hoe (1):</strong> Clear rocks and trees to prepare soil</li>
                  <li><strong>{TOOL_ICONS.seed_bag} Seed Bag (2):</strong> Plant seeds on cleared brown dirt</li>
                  <li><strong>{TOOL_ICONS.scythe} Scythe (3):</strong> Harvest golden grown crops</li>
                  <li><strong>{TOOL_ICONS.watering_can} Watering Can:</strong> Water 1 tile (+20% growth)</li>
                  <li><strong>{TOOL_ICONS.water_sprinkler} Sprinkler:</strong> Water 3x3 area (+20% growth)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Gameplay Loop:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Use <strong>Hoe</strong> to clear rocks/trees → creates brown dirt</li>
                  <li>Select <strong>Seed Bag</strong> and choose a crop</li>
                  <li>Stand on brown dirt and press Space to plant</li>
                  <li>Wait for crops to grow (or speed up with watering)</li>
                  <li>Use <strong>Scythe</strong> on golden crops to harvest</li>
                  <li>Harvesting gives you money + 1 seed back!</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Community Management:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Press F:</strong> Feed your community</li>
                  <li>Requires: 2 carrots, 3 wheat, 1 tomato (balanced diet!)</li>
                  <li>Hunger depletes 2% per second - don&apos;t let them starve!</li>
                  <li>Happiness increases when fed, decreases when hungry</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Seed Quality System:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>10% chance per harvest to upgrade seed generation</li>
                  <li>Higher generations = more money (up to 3x) and faster growth (up to 2x)</li>
                  <li>Build up your seed quality for exponential gains!</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Quick Crop Selection:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>6 or Q:</strong> Select Carrot + auto-switch to Seed Bag</li>
                  <li><strong>7:</strong> Select Wheat + auto-switch to Seed Bag</li>
                  <li><strong>8:</strong> Select Tomato + auto-switch to Seed Bag</li>
                  <li>No more dropdown! Instantly switch crops and start planting</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 text-green-300">Other Controls:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>B:</strong> Open shop to buy seeds and tools</li>
                  <li><strong>H:</strong> Toggle this help screen</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg"
            >
              Got it! Let&apos;s Farm! 🌾
            </button>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShop && (
        <Shop
          gameState={gameState}
          onClose={() => setShowShop(false)}
          onBuySeeds={(crop, amount) => setGameState(prev => buySeeds(prev, crop, amount))}
          onBuyTool={toolName => setGameState(prev => buyTool(prev, toolName))}
          onBuySprinklers={amount => setGameState(prev => buySprinklers(prev, amount))}
          onBuyWaterbots={(amount, name) => setGameState(prev => buyWaterbots(prev, amount, name))}
          onBuyHarvestbots={(amount, name) => setGameState(prev => buyHarvestbots(prev, amount, name))}
          onUpgradeBag={() => setGameState(prev => upgradeBag(prev))}
          onBuyBotFactory={() => {
            setGameState(prev => buyBotFactory(prev));
            setShowBuildingPurchaseTip(true);
          }}
          onBuyWell={() => {
            setGameState(prev => buyWell(prev));
            setShowBuildingPurchaseTip(true);
          }}
          onBuyGarage={() => {
            setGameState(prev => buyGarage(prev));
            setShowBuildingPurchaseTip(true);
          }}
          onBuySupercharger={() => {
            setGameState(prev => buySupercharger(prev));
            setShowBuildingPurchaseTip(true);
          }}
          onBuyFertilizerBuilding={() => {
            setGameState(prev => buyFertilizerBuilding(prev));
            setShowBuildingPurchaseTip(true);
          }}
          onToggleAutoBuy={crop => setGameState(prev => toggleAutoBuy(prev, crop))}
        />
      )}

      {/* Sell Shop Modal */}
      {showSellShop && (
        <SellShop
          gameState={gameState}
          onClose={() => setShowSellShop(false)}
          onSellCrop={() => {
            const result = sellBasket(gameState);
            setSellMessage(result.message);
            if (result.success) {
              setGameState(result.state);
            }
            setTimeout(() => setSellMessage(''), 3000);
          }}
        />
      )}

      {/* Export Shop Modal */}
      {showExportModal && (
        <ExportShop
          gameState={gameState}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Mechanic Shop Modal */}
      {showBotFactory && (
        <BotFactory
          gameState={gameState}
          onClose={() => setShowBotFactory(false)}
          onBuyWaterbots={(amount, name) => setGameState(prev => buyWaterbots(prev, amount, name))}
          onBuyHarvestbots={(amount, name) => setGameState(prev => buyHarvestbots(prev, amount, name))}
          onBuySeedbots={(amount, name) => {
            setGameState(prev => {
              const newState = buySeedbots(prev, amount, name);

              // Auto-open seed bot config modal for the newly created bot
              setTimeout(() => {
                const currentZone = newState.zones[`${newState.currentZone.x},${newState.currentZone.y}`];
                if (currentZone?.seedBots && currentZone.seedBots.length > 0) {
                  // Select the newest (last) seed bot
                  const newestBot = currentZone.seedBots[currentZone.seedBots.length - 1];
                  setSelectedSeedBot(newestBot.id);
                  setShowSeedBotConfig(true);
                  setShowBotFactory(false);
                }
              }, 100);

              return newState;
            });
          }}
          onBuyTransportbots={(amount, name, config) => setGameState(prev => buyTransportbots(prev, amount, name, config))}
          onBuyDemolishbots={(amount, name) => setGameState(prev => buyDemolishbots(prev, amount, name))}
          onBuyHunterbots={(amount) => setGameState(prev => buyHunterbots(prev, amount))}
          onBuyFertilizerbot={(name, config) => setGameState(prev => buyFertilizerbot(prev, name))}
          onRelocate={() => {
            setGameState(prev => relocateBotFactory(prev));
            setPlacementMode('botFactory');
            setShowBotFactory(false);
          }}
        />
      )}

      {/* Seed Bot Config Modal */}
      {showSeedBotConfig && selectedSeedBot && seedBots && (
        <SeedBotConfigModal
          seedBot={seedBots.find(b => b.id === selectedSeedBot)!}
          gameState={gameState}
          onClose={() => {
            setShowSeedBotConfig(false);
            setSelectedSeedBot(null);
            setTileSelectionMode(null);
          }}
          onUpdateJobs={(jobs, autoBuySeeds) => {
            setGameState(prev => updateSeedBotJobs(prev, selectedSeedBot, jobs, autoBuySeeds));
            setShowSeedBotConfig(false);
            setSelectedSeedBot(null);
            setTileSelectionMode(null);
          }}
          onEnterTileSelectionMode={(jobId, cropType, jobs, autoBuySeeds) => {
            // First, save the jobs to gameState so they exist during tile selection
            setGameState(prev => updateSeedBotJobs(prev, selectedSeedBot, jobs, autoBuySeeds));

            // Get the current job's selected tiles from the updated jobs
            const job = jobs.find(j => j.id === jobId);
            const selectedTiles = job?.targetTiles || [];

            setTileSelectionMode({
              active: true,
              jobId,
              cropType,
              selectedTiles,
            });
            setShowSeedBotConfig(false);
          }}
        />
      )}

      {/* Warehouse Modal */}
      {showWarehouseModal && (
        <WarehouseModal
          gameState={gameState}
          onClose={() => setShowWarehouseModal(false)}
          onDeposit={() => {
            setGameState(prev => depositToWarehouse(prev));
            setShowWarehouseModal(false);
          }}
          onMarkForSale={(cropType, quantity) => {
            setGameState(prev => {
              // Move items from warehouse to markedForSale
              const itemsToMark: BasketItem[] = [];
              const remainingWarehouse: BasketItem[] = [];
              let markedCount = 0;

              for (const item of prev.warehouse) {
                if (item.crop === cropType && markedCount < quantity) {
                  itemsToMark.push(item);
                  markedCount++;
                } else {
                  remainingWarehouse.push(item);
                }
              }

              return {
                ...prev,
                warehouse: remainingWarehouse,
                markedForSale: [...prev.markedForSale, ...itemsToMark],
              };
            });
          }}
        />
      )}

      {/* Garage Modal */}
      {showGarageModal && (
        <GarageModal
          gameState={gameState}
          onClose={() => setShowGarageModal(false)}
          onRelocate={() => {
            setGameState(prev => relocateGarage(prev));
            setPlacementMode('garage');
            setShowGarageModal(false);
          }}
        />
      )}

      {/* Supercharger Modal */}
      {showSuperchargerModal && (
        <SuperchargerModal
          gameState={gameState}
          onClose={() => setShowSuperchargerModal(false)}
          onSupercharge={(botId, botType) => {
            setGameState(prev => superchargeBot(prev, botId, botType));
          }}
          onRelocate={() => {
            setGameState(prev => relocateSupercharger(prev));
            setPlacementMode('supercharger');
            setShowSuperchargerModal(false);
          }}
        />
      )}

      {/* Hopper Modal */}
      {showHopperModal && (
        <HopperModal
          gameState={gameState}
          onClose={() => setShowHopperModal(false)}
          onUpgrade={(botId, botType) => {
            setGameState(prev => hopperUpgrade(prev, botId, botType));
          }}
          onRelocate={() => {
            setGameState(prev => relocateHopper(prev));
            setPlacementMode('hopper');
            setShowHopperModal(false);
          }}
        />
      )}

      {/* Zone Preview Modal */}
      {showZonePreview && previewZone && (
        <ZonePreviewModal
          zone={previewZone}
          onClose={() => {
            setShowZonePreview(false);
            setPreviewZone(null);
          }}
          onTravel={handleZoneTravel}
        />
      )}

      {/* Tile Selection Mode Overlay */}
      {tileSelectionMode && tileSelectionMode.active && (
        <div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-green-600 to-lime-600 text-white px-8 py-4 rounded-xl shadow-2xl border-4 border-green-300 pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">🌱 Tile Selection Mode</div>
            <div className="text-sm mb-3">
              Click on grass or dirt tiles to select planting zones for {tileSelectionMode.cropType}
            </div>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-lg font-bold">{tileSelectionMode.selectedTiles.length}/20</span>
                <span className="text-xs ml-2">tiles selected</span>
              </div>
            </div>
            <button
              onClick={() => {
                // Save the selected tiles to the job before closing
                if (tileSelectionMode && selectedSeedBot) {
                  setGameState(prev => {
                    const prevZoneKey = getZoneKey(prev.currentZone.x, prev.currentZone.y);
                    const prevZone = prev.zones[prevZoneKey];
                    const seedBot = prevZone?.seedBots?.find(b => b.id === selectedSeedBot);
                    if (!seedBot) return prev;

                    const updatedJobs = seedBot.jobs.map(job => {
                      if (job.id === tileSelectionMode.jobId) {
                        return { ...job, targetTiles: tileSelectionMode.selectedTiles };
                      }
                      return job;
                    });

                    return updateSeedBotJobs(prev, selectedSeedBot, updatedJobs, seedBot.autoBuySeeds);
                  });
                }

                setTileSelectionMode(null);
                setShowSeedBotConfig(true);
              }}
              className="px-6 py-2 bg-white text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors pointer-events-auto"
            >
              ✓ Done Selecting
            </button>
          </div>
        </div>
      )}

      {/* No Seeds Modal */}
      {showNoSeedsModal && noSeedsCropType && (
        <NoSeedsModal
          cropType={noSeedsCropType}
          onClose={() => {
            setShowNoSeedsModal(false);
            setNoSeedsCropType(null);
          }}
          onGoToShop={() => {
            setShowNoSeedsModal(false);
            setNoSeedsCropType(null);
            setShowShop(true);
          }}
        />
      )}

      {/* New Game Confirmation Modal */}
      {showNewGameConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900 to-red-950 text-white p-8 rounded-xl max-w-md w-full border-4 border-red-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">⚠️ Start New Farm?</h2>
              <button
                onClick={() => setShowNewGameConfirm(false)}
                className="text-2xl hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-lg mb-6">
              Are you sure you want to start a new farm? All your current progress will be lost!
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNewGameConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewGame}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg"
              >
                Start New Farm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farm Name Editor Modal */}
      {showFarmNameEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-900 to-green-950 text-white p-8 rounded-xl max-w-md w-full border-4 border-green-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🌾 Rename Your Farm</h2>
              <button
                onClick={() => setShowFarmNameEditor(false)}
                className="text-2xl hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={gameState.player.farmName}
              onChange={(e) => setGameState(prev => ({
                ...prev,
                player: { ...prev.player, farmName: e.target.value }
              }))}
              className="w-full px-4 py-3 rounded-lg text-black font-bold text-xl mb-4"
              placeholder="Enter farm name..."
              maxLength={30}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowFarmNameEditor(false);
                }
              }}
            />

            <div className="text-sm text-gray-300 mb-4">
              {gameState.player.farmName.length}/30 characters
            </div>

            <button
              onClick={() => setShowFarmNameEditor(false)}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg"
            >
              Save Name
            </button>
          </div>
        </div>
      )}

      {/* Zone Purchase Modal */}
      {showPurchaseModal && purchaseZoneKey && gameState.zones[purchaseZoneKey] && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-8 rounded-xl max-w-md w-full border-4 border-amber-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🌳 Purchase Farmland</h2>
              <button
                onClick={() => { setShowPurchaseModal(false); setPurchaseZoneKey(''); }}
                className="text-2xl hover:text-amber-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-lg mb-4">
              Expand your farm to new territory! This will unlock a new area to grow crops and build your farming empire.
            </p>
            <div className="bg-black/30 px-4 py-3 rounded mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg">Price:</span>
                <span className="text-2xl font-bold">💰 ${gameState.zones[purchaseZoneKey].purchasePrice}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg">Your Money:</span>
                <span className={`text-xl font-bold ${gameState.player.money >= gameState.zones[purchaseZoneKey].purchasePrice ? 'text-green-400' : 'text-red-400'}`}>
                  ${gameState.player.money}
                </span>
              </div>
            </div>
            {gameState.player.money < gameState.zones[purchaseZoneKey].purchasePrice && (
              <div className="bg-red-900/30 border border-red-600 px-4 py-2 rounded mb-4 text-center">
                Not enough money! Keep farming and selling crops.
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => { setShowPurchaseModal(false); setPurchaseZoneKey(''); }}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseZone}
                disabled={gameState.player.money < gameState.zones[purchaseZoneKey].purchasePrice}
                className={`flex-1 px-6 py-3 rounded-lg font-bold text-lg ${
                  gameState.player.money >= gameState.zones[purchaseZoneKey].purchasePrice
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Right Sidebar - Bot Status */}
      <div className="w-56 bg-black/70 p-2 rounded-lg text-white flex flex-col gap-1.5 max-h-full overflow-y-auto">
        <div className="text-sm font-bold text-center mb-1 text-blue-400">🤖 Bot Fleet</div>

        {/* Calculate garage position once for all bots */}
        {(() => {
          const grid = getCurrentGrid(gameState);
          const garagePos = findGaragePosition(grid);

          return <>
          {/* Water Robot Section */}
          {(waterBots?.length ?? 0) > 0 && (() => {
            // Check if any bot is low on water and if there's a well
            const hasLowWaterBot = waterBots?.some(bot => bot.waterLevel <= 3);
            const hasWell = grid.some(row => row.some(tile => tile.type === 'well'));
            const needsWell = hasLowWaterBot && !hasWell;

            return (
            <div className={`bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border rounded-lg p-2 shadow-lg transition-all ${
              needsWell
                ? 'border-red-500 shadow-red-500/50 animate-pulse'
                : 'border-cyan-500/60 hover:shadow-cyan-500/30 hover:border-cyan-400'
            }`}>
              <div
                className="text-xs text-cyan-300 font-bold mb-1.5 flex items-center gap-1 cursor-pointer hover:bg-cyan-900/40 rounded px-1.5 py-1 transition-colors group"
                onClick={() => setShowBotInfoModal('water')}
                title="Click to view bot history"
              >
                <span className="text-base">💧</span>
                <span>WATER</span>
                <span className="ml-auto bg-cyan-600/30 px-1.5 py-0.5 rounded text-[10px]">{waterBots?.length ?? 0}</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1.5">
                {waterBots?.map((bot, idx) => {
                  const waterPercent = (bot.waterLevel / 10) * 100;
                  const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
                  const statusText =
                    isParked ? '🏠 Parked in garage' :
                    bot.status === 'traveling' ? 'Moving to crops' :
                    bot.status === 'watering' ? 'Watering plants' :
                    bot.status === 'refilling' ? 'At well' :
                    'Ready';
                  return (
                    <div key={bot.id} className="bg-black/20 rounded p-1.5 border border-cyan-600/20 hover:bg-cyan-900/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-semibold text-cyan-100 cursor-pointer hover:text-cyan-300 hover:underline"
                          onClick={() => setRenamingBot({ id: bot.id, type: 'water', currentName: bot.name })}
                          title="Click to rename"
                        >
                          {bot.name}
                        </span>
                        <span className="text-sm text-cyan-300">
                          {bot.status === 'traveling' && '🚶'}
                          {bot.status === 'watering' && '💦'}
                          {bot.status === 'idle' && '😴'}
                          {bot.status === 'refilling' && '⚡'}
                        </span>
                      </div>
                      <div className="text-[10px] text-cyan-200/70 mb-1 truncate font-medium">{statusText}</div>
                      <div className="bg-gray-900/60 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${waterPercent > 30 ? 'bg-cyan-400' : 'bg-red-500'}`}
                          style={{ width: `${waterPercent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-cyan-300/80 text-center mt-0.5 font-medium">Water: {bot.waterLevel}/10</div>
                    </div>
                  );
                })}
              </div>

              {/* Warning message when bots need well */}
              {needsWell && (
                <div className="mt-2 bg-red-900/40 border border-red-500 rounded px-2 py-1.5 text-xs text-red-200">
                  <div className="font-bold mb-0.5">⚠️ No Well Available!</div>
                  <div className="text-[10px]">Build a well so bots can refill water</div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Harvest Robot Section */}
          {(harvestBots?.length ?? 0) > 0 && (
            <div className="bg-gradient-to-br from-orange-950/40 to-amber-900/20 border border-orange-500/60 rounded-lg p-1.5 shadow-lg hover:shadow-orange-500/30 hover:border-orange-400 transition-all">
              <div
                className="text-xs text-orange-300 font-bold mb-1 flex items-center gap-1 cursor-pointer hover:bg-orange-900/30 rounded px-1 py-0.5 transition-colors group"
                onClick={() => setShowBotInfoModal('harvest')}
                title="Click to view bot history"
              >
                <span>🌾</span>
                HARVEST
                <span className="ml-auto bg-orange-600/30 px-1 rounded text-xs">{harvestBots?.length ?? 0}</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1">
                {harvestBots?.map((bot, idx) => {
                  const inventoryPercent = (bot.inventory.length / bot.inventoryCapacity) * 100;
                  const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
                  const statusText =
                    isParked ? '🏠 Parked in garage' :
                    bot.status === 'traveling' ? 'Moving to field' :
                    bot.status === 'harvesting' ? 'Collecting crops' :
                    bot.status === 'depositing' ? 'At barn' :
                    'Ready';
                  return (
                    <div key={bot.id} className="bg-black/20 rounded p-1 border border-orange-600/20 cursor-pointer hover:bg-orange-900/20 transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-xs font-semibold text-orange-100 cursor-pointer hover:text-orange-300 hover:underline"
                          onClick={() => setRenamingBot({ id: bot.id, type: 'harvest', currentName: bot.name })}
                          title="Click to rename"
                        >
                          {bot.name}
                        </span>
                        <span className="text-sm text-orange-300">
                          {bot.status === 'traveling' && '🚶'}
                          {bot.status === 'harvesting' && '✂️'}
                          {bot.status === 'depositing' && '📦'}
                          {bot.status === 'idle' && '😴'}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-orange-200/60 mb-1 truncate">{statusText}</div>
                      <div className="bg-gray-900/60 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${inventoryPercent < 100 ? 'bg-green-400' : 'bg-yellow-400'}`}
                          style={{ width: `${inventoryPercent}%` }}
                        />
                      </div>
                      <div className="text-sm text-orange-300/70 text-center">Cargo: {bot.inventory.length}/{bot.inventoryCapacity}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seed Bot Section */}
          {seedBots && seedBots.length > 0 && (
            <div className="bg-gradient-to-br from-green-950/40 to-lime-900/20 border border-green-500/60 rounded-lg p-1.5 shadow-lg hover:shadow-green-500/30 hover:border-green-400 transition-all">
              <div
                className="text-xs text-green-300 font-bold mb-1 flex items-center gap-1 cursor-pointer hover:bg-green-900/30 rounded px-1 py-0.5 transition-colors group"
                onClick={() => setShowBotInfoModal('seed')}
                title="Click to view bot history"
              >
                <span>🌱</span>
                SEED
                <span className="ml-auto bg-green-600/30 px-1 rounded text-xs">{seedBots.length}</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1">
                {seedBots.map((bot, idx) => {
                  const jobCount = bot.jobs.length;
                  const totalTiles = bot.jobs.reduce((sum, job) => sum + job.targetTiles.length, 0);
                  const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
                  const statusText =
                    isParked ? '🏠 Parked in garage' :
                    bot.status === 'traveling' ? 'Moving to tile' :
                    bot.status === 'planting' ? 'Planting seeds' :
                    jobCount > 0 ? `${jobCount} job${jobCount > 1 ? 's' : ''} queued` :
                    'Awaiting jobs';
                  return (
                    <div key={bot.id} className="bg-black/20 rounded p-1 border border-green-600/20 cursor-pointer hover:bg-green-900/20 transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-xs font-semibold text-green-100 cursor-pointer hover:text-green-300 hover:underline"
                          onClick={() => setRenamingBot({ id: bot.id, type: 'seed', currentName: bot.name })}
                          title="Click to rename"
                        >
                          {bot.name}
                        </span>
                        <span className="text-sm text-green-300">
                          {bot.status === 'traveling' && '🚶'}
                          {bot.status === 'planting' && '🌱'}
                          {bot.status === 'idle' && '😴'}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-green-200/60 mb-1 truncate">{statusText}</div>
                      <div className="text-sm text-green-300/70 mb-0.5 text-center">
                        Jobs: {jobCount} • Tiles: {totalTiles}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSeedBot(bot.id);
                          setShowSeedBotConfig(true);
                        }}
                        className="w-full px-1 py-0.5 bg-green-600/30 hover:bg-green-600/50 rounded text-sm font-semibold transition-colors"
                      >
                        ⚙️ Configure
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transport Bot Section */}
          {(transportBots?.length ?? 0) > 0 && (
            <div className="bg-gradient-to-br from-purple-950/40 to-violet-900/20 border border-purple-500/60 rounded-lg p-1.5 shadow-lg hover:shadow-purple-500/30 hover:border-purple-400 transition-all">
              <div
                className="text-xs text-purple-300 font-bold mb-1 flex items-center gap-1 cursor-pointer hover:bg-purple-900/30 rounded px-1 py-0.5 transition-colors group"
                onClick={() => setShowBotInfoModal('transport')}
                title="Click to view bot history"
              >
                <span>🚚</span>
                TRANSPORT
                <span className="ml-auto bg-purple-600/30 px-1 rounded text-xs">{transportBots?.length ?? 0}</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1">
                {transportBots?.map((bot, idx) => {
                  const inventoryPercent = (bot.inventory.length / bot.inventoryCapacity) * 100;
                  const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
                  const statusText =
                    isParked ? '🏠 Parked in garage' :
                    bot.status === 'traveling' ? 'En route' :
                    bot.status === 'loading' ? 'Loading cargo' :
                    bot.status === 'transporting' ? 'To market' :
                    bot.status === 'selling' ? 'Selling goods' :
                    'Ready';
                  return (
                    <div key={bot.id} className="bg-black/20 rounded p-1 border border-purple-600/20 cursor-pointer hover:bg-purple-900/20 transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-xs font-semibold text-purple-100 cursor-pointer hover:text-purple-300 hover:underline"
                          onClick={() => setRenamingBot({ id: bot.id, type: 'transport', currentName: bot.name })}
                          title="Click to rename"
                        >
                          {bot.name}
                        </span>
                        <span className="text-sm text-purple-300">
                          {bot.status === 'traveling' && '🚶'}
                          {bot.status === 'loading' && '📥'}
                          {bot.status === 'transporting' && '🚚'}
                          {bot.status === 'selling' && '💰'}
                          {bot.status === 'idle' && '😴'}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-purple-200/60 mb-1 truncate">{statusText}</div>
                      <div className="bg-gray-900/60 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all ${inventoryPercent < 100 ? 'bg-purple-400' : 'bg-yellow-400'}`}
                          style={{ width: `${inventoryPercent}%` }}
                        />
                      </div>
                      <div className="text-sm text-purple-300/70 text-center">Cargo: {bot.inventory.length}/{bot.inventoryCapacity}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Demolish Bot Section */}
          {(demolishBots?.length ?? 0) > 0 && (
            <div className="bg-gradient-to-br from-orange-950/40 to-red-900/20 border border-orange-500/60 rounded-lg p-1.5 shadow-lg hover:shadow-orange-500/30 hover:border-orange-400 transition-all">
              <div
                className="text-xs text-orange-300 font-bold mb-1 flex items-center gap-1 cursor-pointer hover:bg-orange-900/30 rounded px-1 py-0.5 transition-colors group"
                onClick={() => setShowBotInfoModal('demolish')}
                title="Click to view bot history"
              >
                <span>🚧</span>
                DEMOLISH
                <span className="ml-auto bg-orange-600/30 px-1 rounded text-xs">{demolishBots?.length ?? 0}</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1">
                {demolishBots?.map((bot, idx) => {
                  const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
                  const statusText =
                    isParked ? '🏠 Parked in garage' :
                    bot.status === 'traveling' ? 'Moving to target' :
                    bot.status === 'clearing' && bot.targetX !== undefined && bot.targetY !== undefined
                      ? `Clearing (${bot.targetX},${bot.targetY})`
                      : bot.status === 'clearing' ? 'Demolishing'
                      : 'Ready';

                  // Calculate progress if bot is clearing
                  let clearingProgress = 0;
                  if (bot.status === 'clearing' && bot.actionStartTime !== undefined && bot.actionDuration !== undefined) {
                    const elapsed = gameState.gameTime - bot.actionStartTime;
                    clearingProgress = Math.min(100, (elapsed / bot.actionDuration) * 100);
                  }

                  return (
                    <div key={bot.id} className="bg-black/20 rounded p-1 border border-orange-600/20 cursor-pointer hover:bg-orange-900/20 transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-xs font-semibold text-orange-100 cursor-pointer hover:text-orange-300 hover:underline"
                          onClick={() => setRenamingBot({ id: bot.id, type: 'demolish', currentName: bot.name })}
                          title="Click to rename"
                        >
                          {bot.name}
                        </span>
                        <span className="text-sm text-orange-300">
                          {bot.status === 'traveling' && '🚶'}
                          {bot.status === 'clearing' && '🔨'}
                          {bot.status === 'idle' && '😴'}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-orange-200/60 mb-1 truncate">{statusText}</div>

                      {/* Progress bar when clearing */}
                      {bot.status === 'clearing' && (
                        <>
                          <div className="bg-gray-900/60 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all"
                              style={{ width: `${clearingProgress}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-orange-300/70 text-center mt-0.5">
                            {Math.floor(clearingProgress)}%
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hunter Bots Section */}
          {(hunterBots?.length ?? 0) > 0 && (
            <div className="bg-gradient-to-br from-amber-950/40 to-yellow-900/20 border rounded-lg p-2 shadow-lg border-amber-500/60 hover:shadow-amber-500/30 hover:border-amber-400 transition-all">
              <div
                className="text-xs text-amber-300 font-bold mb-1.5 flex items-center gap-1 cursor-pointer hover:bg-amber-900/40 rounded px-1.5 py-1 transition-colors group"
                onClick={() => setShowBotInfoModal('hunter')}
              >
                HUNTER
                <span className="ml-auto bg-amber-600/30 px-1 rounded text-xs">{hunterBots?.length ?? 0}</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1">
                {hunterBots?.map((bot, idx) => {
                  const isParked = bot.status === 'idle' && garagePos && bot.x === garagePos.x && bot.y === garagePos.y;
                  const statusText =
                    isParked ? '🏠 Parked in garage' :
                    bot.status === 'chasing' ? '🏃 Chasing rabbit!' :
                    bot.status === 'capturing' ? '🎯 Capturing' :
                    bot.status === 'escorting' ? '🚪 Escorting out' :
                    bot.status === 'patrolling' ? '👁️ Patrolling' :
                    'Ready';
                  return (
                    <div key={bot.id} className="bg-black/20 rounded p-1 border border-amber-600/20 cursor-pointer hover:bg-amber-900/20 transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-xs font-semibold text-amber-100 cursor-pointer hover:text-amber-300 hover:underline"
                          onClick={() => setRenamingBot({ id: bot.id, type: 'hunter', currentName: bot.name })}
                          title="Click to rename"
                        >
                          {bot.name}
                        </span>
                        <button
                          onClick={() => {
                            if (window.confirm(`Sell ${bot.name} for $${Math.floor(HUNTERBOT_COST * 0.7)}?`)) {
                              setGameState(prev => sellBot(prev, bot.id, 'hunter'));
                            }
                          }}
                          className="text-red-400 hover:text-red-300 text-xs px-1"
                          title="Sell bot"
                        >
                          💰
                        </button>
                      </div>
                      <div className="text-[10px] font-medium text-amber-200/60 mb-1 truncate">{statusText}</div>
                      {bot.supercharged && (
                        <div className="text-[9px] text-yellow-300 bg-yellow-900/30 px-1 py-0.5 rounded mt-1">
                          ⚡ SUPERCHARGED
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fertilizer Bot Section */}
          {fertilizerBot && (
            <div className="bg-gradient-to-br from-lime-950/40 to-green-900/20 border rounded-lg p-2 shadow-lg border-lime-500/60 hover:shadow-lime-500/30 hover:border-lime-400 transition-all">
              <div
                className="text-xs text-lime-300 font-bold mb-1.5 flex items-center gap-1 cursor-pointer hover:bg-lime-900/40 rounded px-1.5 py-1 transition-colors group"
                onClick={() => setShowBotInfoModal('fertilizer')}
              >
                FERTILIZER
                <span className="ml-auto bg-lime-600/30 px-1 rounded text-xs">1</span>
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">ℹ️</span>
              </div>
              <div className="space-y-1">
                <div className="bg-black/20 rounded p-1 border border-lime-600/20 cursor-pointer hover:bg-lime-900/20 transition-colors">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className="text-xs font-semibold text-lime-100 cursor-pointer hover:text-lime-300 hover:underline"
                      onClick={() => setRenamingBot({ id: fertilizerBot.id, type: 'fertilizer', currentName: fertilizerBot.name })}
                      title="Click to rename"
                    >
                      {fertilizerBot.name}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Sell ${fertilizerBot.name} for $${Math.floor(FERTILIZERBOT_COST * 0.7)}?`)) {
                          setGameState(prev => sellBot(prev, fertilizerBot.id, 'fertilizer'));
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-xs px-1"
                      title="Sell bot"
                    >
                      💰
                    </button>
                  </div>
                  <div className="text-[10px] font-medium text-lime-200/60 mb-1 truncate">
                    {fertilizerBot.status === 'idle' && garagePos && fertilizerBot.x === garagePos.x && fertilizerBot.y === garagePos.y
                      ? '🏠 Parked in garage'
                      : fertilizerBot.status === 'fertilizing'
                      ? `🌱 Fertilizing (${fertilizerBot.fertilizerLevel}/${FERTILIZER_MAX_CAPACITY})`
                      : fertilizerBot.status === 'refilling'
                      ? '⛽ Refilling fertilizer'
                      : 'Ready'}
                  </div>
                  {fertilizerBot.supercharged && (
                    <div className="text-[9px] text-yellow-300 bg-yellow-900/30 px-1 py-0.5 rounded mt-1">
                      ⚡ SUPERCHARGED
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          </>;
        })()}
      </div>



      {/* Welcome Screen */}
      {showWelcome && (
        <WelcomeSplash
          onStartNew={handleStartNew}
          onLoadGame={handleLoadFromCode}
          onContinue={handleContinue}
          onShowTutorial={handleShowTutorial}
        />
      )}

      {/* Quick Start Tutorial Modal */}
      {showTutorialModal && (
        <QuickStartTutorial
          onClose={() => setShowTutorialModal(false)}
        />
      )}

      {/* Save Game Modal */}
      {showSaveModal && (
        <SaveGameModal
          saveCode={currentSaveCode}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Zone Earnings Modal */}
      {showEarningsModal && (
        <ZoneEarningsModal
          gameState={gameState}
          onClose={() => setShowEarningsModal(false)}
        />
      )}

      {/* Economy Modal */}
      {showEconomyModal && (
        <EconomyModal
          gameState={gameState}
          onClose={() => setShowEconomyModal(false)}
        />
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <IncomeModal
          gameState={gameState}
          onClose={() => setShowIncomeModal(false)}
        />
      )}

      {/* Bot Info Modal */}
      {showBotInfoModal && (
        <BotInfoModal
          botType={showBotInfoModal}
          onClose={() => setShowBotInfoModal(null)}
        />
      )}

      {/* Well Modal */}
      {showWellModal && (
        <WellModal
          onClose={() => setShowWellModal(false)}
          onRelocate={() => {
            setGameState(prev => relocateWell(prev));
            setPlacementMode('well');
            setShowWellModal(false);
          }}
        />
      )}

      {/* Tutorial Modal (from Help button) */}
      {showTutorialModal && (
        <TutorialModal
          onClose={() => setShowTutorialModal(false)}
          gameState={gameState}
          isInitialWelcome={false}
        />
      )}

      {/* Building Purchase Tip */}
      {showBuildingPurchaseTip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-900 to-amber-950 border-4 border-amber-500 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">🏗️</div>
              <h2 className="text-2xl font-bold text-amber-200 mb-2">Building Purchased!</h2>
            </div>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-amber-100 text-center mb-3">
                Look at the <strong className="text-amber-300">bottom of your screen</strong> to find the placement button for your new building!
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-200">
                <span className="text-2xl">👇</span>
                <span className="font-bold">Scroll down to place it</span>
                <span className="text-2xl">👇</span>
              </div>
            </div>
            <button
              onClick={() => setShowBuildingPurchaseTip(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-lg shadow-lg"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Bot Rename/Sell Modal */}
      {renamingBot && (
        <BotNameModal
          botType={renamingBot.type}
          currentName={renamingBot.currentName}
          onConfirm={(newName) => {
            setGameState(prev => updateBotName(prev, renamingBot.id, newName, renamingBot.type));
            setRenamingBot(null);
          }}
          onCancel={() => setRenamingBot(null)}
          onSell={() => {
            setGameState(prev => sellBot(prev, renamingBot.id, renamingBot.type));
            setRenamingBot(null);
          }}
        />
      )}
    </div>
  );
}



