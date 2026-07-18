import Phaser from 'phaser';
import { createGameConfig } from './game/config';

const game = new Phaser.Game(createGameConfig('game-root'));

export default game;
