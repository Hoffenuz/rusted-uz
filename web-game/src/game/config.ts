import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { BattleScene } from './scenes/BattleScene';

/** Viewport size (camera). */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/** Full battle world size. */
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1800;

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0a100e',
    // Crisp sprites (nearest filter set per-texture in Preload)
    pixelArt: false,
    antialias: true,
    roundPixels: true,
    render: {
      antialias: true,
      roundPixels: true,
      powerPreference: 'high-performance',
    },
    physics: {
      default: 'arcade',
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
    },
  };
}
