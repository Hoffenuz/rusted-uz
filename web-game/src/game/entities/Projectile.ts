import Phaser from 'phaser';
import type { TankTeam } from '../data/tanks';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage = 0;
  team: TankTeam = 'player';
  private lifeMs = 1800;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '__WHITE');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(10, 4);
    this.setTint(0xffe0a0);
    this.setDepth(20);
    this.setActive(false);
    this.setVisible(false);
  }

  launch(x: number, y: number, angle: number, speed: number, damage: number, team: TankTeam) {
    this.team = team;
    this.damage = damage;
    this.lifeMs = 1800;
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setRotation(angle);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this.lifeMs -= delta;
    if (this.lifeMs <= 0) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    this.body?.stop();
    this.disableBody(true, true);
  }
}
