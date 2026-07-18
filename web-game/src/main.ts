import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { applyShellLayout, bindOrientationRefresh, isCoarsePointer } from './game/layout';

applyShellLayout(isCoarsePointer());

const game = new Phaser.Game(createGameConfig('game-root'));
bindOrientationRefresh(game);

// Smooth FIT upscale (pixelated CSS rotating sprites ni “bijirlatardi”)
game.events.once(Phaser.Core.Events.READY, () => {
  const canvas = game.canvas;
  if (!canvas) return;
  canvas.style.imageRendering = 'auto';
});

export default game;
