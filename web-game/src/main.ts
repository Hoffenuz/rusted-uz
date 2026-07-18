import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { applyShellLayout, bindOrientationRefresh, isCoarsePointer } from './game/layout';

// Initial shell: mobile-ish devices start full-bleed
applyShellLayout(isCoarsePointer());

const game = new Phaser.Game(createGameConfig('game-root'));
bindOrientationRefresh(game);

export default game;
