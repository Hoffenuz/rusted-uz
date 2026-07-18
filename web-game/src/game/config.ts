import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { BattleScene } from './scenes/BattleScene';

/** Logical game resolution (camera). */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/** Full battle world size. */
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1800;

/** Retina/FIT uchun ichki buffer — blur kamayadi, pixelated CSS kerak emas. */
function renderResolution() {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  // resolution: retina/FIT buffer (types ba’zan yo‘q deb ko‘rsatadi)
  const config = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0a100e',
    // Painted tank art: LINEAR + AA. pixelArt/NEAREST aylanganda “bijirlash” berardi.
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    resolution: renderResolution(),
    render: {
      antialias: true,
      roundPixels: false,
      pixelArt: false,
      powerPreference: 'high-performance' as const,
      mipmapFilter: 'LINEAR' as const,
    },
    physics: {
      default: 'arcade' as const,
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, MainMenuScene, BattleScene],
    input: {
      activePointers: 3,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: false,
      fullscreenTarget: parent,
    },
  };
  return config as Phaser.Types.Core.GameConfig;
}
