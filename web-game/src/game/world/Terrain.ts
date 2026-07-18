import Phaser from 'phaser';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../config';

/** Battlefield from original high-res map — no tint, no wash. */
export function createBattlefield(scene: Phaser.Scene): void {
  const map = scene.add.image(0, 0, 'map').setOrigin(0).setDepth(0);
  const scaleX = WORLD_WIDTH / map.width;
  const scaleY = WORLD_HEIGHT / map.height;
  const scale = Math.max(scaleX, scaleY);
  map.setScale(scale);
  map.setPosition(
    (WORLD_WIDTH - map.displayWidth) / 2,
    (WORLD_HEIGHT - map.displayHeight) / 2,
  );
  map.clearTint();
  map.setAlpha(1);
}
