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
  // PNG pixel-perfect: NEAREST + roundPixels (yumshoq LINEAR blur yo‘q)
  const config = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0a100e',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    resolution: renderResolution(),
    render: {
      antialias: false,
      roundPixels: true,
      pixelArt: true,
      powerPreference: 'high-performance' as const,
      mipmapFilter: 'NEAREST' as const,
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
