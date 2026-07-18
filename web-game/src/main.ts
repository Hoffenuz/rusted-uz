import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { applyShellLayout, bindOrientationRefresh, isCoarsePointer } from './game/layout';

applyShellLayout(isCoarsePointer());

const game = new Phaser.Game(createGameConfig('game-root'));
bindOrientationRefresh(game);

// PNG keskin: brauzer canvasni yumshoq blur qilmasin
game.events.once(Phaser.Core.Events.READY, () => {
  const canvas = game.canvas;
  if (!canvas) return;
  canvas.style.setProperty('image-rendering', 'pixelated');
});

export default game;
