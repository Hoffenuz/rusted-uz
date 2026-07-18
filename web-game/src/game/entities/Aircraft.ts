import Phaser from 'phaser';
import {
  AIRCRAFT_DEFS,
  aircraftAssetKey,
  type AircraftDef,
  type AircraftId,
} from '../data/aircraft';
import type { AllyStance, TankTeam } from '../data/tanks';

export interface AircraftSpawnOptions {
  id: AircraftId;
  team: TankTeam;
  x: number;
  y: number;
  facing?: number;
  controllable?: boolean;
}

export class Aircraft extends Phaser.GameObjects.Container {
  readonly def: AircraftDef;
  readonly team: TankTeam;
  readonly controllable: boolean;

  hp: number;
  bodyAngle = 0;
  alive = true;
  isPlayerDriven = false;
  stance: AllyStance = 'auto';

  private readonly sprite: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly hpBg: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly ownerLabel: Phaser.GameObjects.Text;
  private cooldownUntil = 0;
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private aimPoint = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, options: AircraftSpawnOptions) {
    super(scene, options.x, options.y);

    this.def = AIRCRAFT_DEFS[options.id];
    this.team = options.team;
    this.controllable = options.controllable ?? false;
    this.hp = this.def.maxHp;
    this.bodyAngle = options.facing ?? (options.team === 'player' ? -Math.PI / 2 : Math.PI / 2);
    this.aimPoint.set(options.x + Math.cos(this.bodyAngle) * 120, options.y + Math.sin(this.bodyAngle) * 120);

    this.shadow = scene.add.ellipse(6, 10 + this.def.altitude * 0.15, 36, 16, 0x000000, 0.28);
    this.sprite = scene.add.image(0, -this.def.altitude * 0.2, aircraftAssetKey(options.id)).setOrigin(0.5);
    this.sprite.setScale(this.def.scale);
    if (this.team === 'enemy') this.sprite.setTint(0xffd0c8);
    this.add([this.shadow, this.sprite]);

    this.hpBg = scene.add.rectangle(0, -40, 44, 5, 0x111111, 0.85);
    this.hpFill = scene.add
      .rectangle(-22, -40, 44, 5, this.team === 'player' ? 0x6ec8ff : 0xd35a3d)
      .setOrigin(0, 0.5);
    this.nameLabel = scene.add
      .text(0, -50, this.def.displayName, {
        fontFamily: 'Segoe UI',
        fontSize: '10px',
        color: this.team === 'player' ? '#b8ddff' : '#e8b2a4',
      })
      .setOrigin(0.5);
    this.ownerLabel = scene.add
      .text(0, 28, this.def.kind === 'heli' ? 'MENING VERTOLYOTIM' : 'MENING SAMOLYOTIM', {
        fontFamily: 'Segoe UI',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#9fd0ff',
        backgroundColor: '#14202a',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.add([this.hpBg, this.hpFill, this.nameLabel, this.ownerLabel]);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 36);
    body.setOffset(-18, -18);
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false);
    body.moves = false;

    this.setSize(50, 50);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, 28), Phaser.Geom.Circle.Contains);
    this.setDepth(40);
    this.setPlayerDriven(false);
    this.syncSprite();
  }

  setPlayerDriven(driven: boolean) {
    this.isPlayerDriven = driven && this.alive && this.controllable;
    this.ownerLabel.setVisible(this.isPlayerDriven);
    this.nameLabel.setColor(this.isPlayerDriven ? '#9fd0ff' : this.team === 'player' ? '#b8ddff' : '#e8b2a4');
  }

  setMoveTarget(x: number, y: number) {
    this.moveTarget = new Phaser.Math.Vector2(x, y);
  }

  clearMoveTarget() {
    this.moveTarget = null;
  }

  setAim(x: number, y: number) {
    this.aimPoint.set(x, y);
  }

  get muzzle(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      this.x + Math.cos(this.bodyAngle) * 24,
      this.y + Math.sin(this.bodyAngle) * 24,
    );
  }

  canFire(time: number) {
    return this.alive && time >= this.cooldownUntil;
  }

  markFired(time: number) {
    this.cooldownUntil = time + this.def.fireCooldownMs;
  }

  takeDamage(amount: number): boolean {
    if (!this.alive) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.hpFill.width = 44 * (this.hp / this.def.maxHp);
    if (this.hp > 0) return false;
    this.alive = false;
    this.isPlayerDriven = false;
    this.clearMoveTarget();
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.disableInteractive();
    this.sprite.setTint(0x444444);
    this.setAlpha(0.5);
    this.nameLabel.setText(`${this.def.displayName} · yo'qolgan`);
    this.ownerLabel.setVisible(false);
    this.setDepth(3);
    return true;
  }

  private syncSprite() {
    this.sprite.setRotation(this.bodyAngle - this.def.bodyFacingOffset);
  }

  private moveBy(speed: number, dt: number) {
    const nx = this.x + Math.cos(this.bodyAngle) * speed * dt;
    const ny = this.y + Math.sin(this.bodyAngle) * speed * dt;
    const bounds = this.scene.physics.world.bounds;
    this.x = Phaser.Math.Clamp(nx, bounds.x + 40, bounds.right - 40);
    this.y = Phaser.Math.Clamp(ny, bounds.y + 40, bounds.bottom - 40);
    (this.body as Phaser.Physics.Arcade.Body).reset(this.x, this.y);
  }

  updateAircraft(delta: number, drive?: { throttle: number; steer: number }) {
    if (!this.alive) return;
    const dt = delta / 1000;
    const driving = !!(drive && (Math.abs(drive.throttle) > 0.01 || Math.abs(drive.steer) > 0.01));

    if (this.isPlayerDriven && driving && drive) {
      this.moveTarget = null;
      this.bodyAngle += drive.steer * this.def.turnSpeed * dt;
      // Planes keep slight forward motion; helis can hover
      const minThrottle = this.def.kind === 'plane' ? 0.35 : 0;
      const throttle = Math.max(drive.throttle, minThrottle);
      if (Math.abs(throttle) > 0.01) {
        this.moveBy(this.def.speed * throttle, dt);
      }
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.x;
      const dy = this.moveTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 20) {
        this.moveTarget = null;
        if (this.def.kind === 'plane') this.moveBy(this.def.speed * 0.35, dt);
      } else {
        const desired = Math.atan2(dy, dx);
        this.bodyAngle = Phaser.Math.Angle.RotateTo(this.bodyAngle, desired, this.def.turnSpeed * dt);
        this.moveBy(this.def.speed, dt);
      }
    } else if (this.def.kind === 'plane' && !this.isPlayerDriven) {
      this.moveBy(this.def.speed * 0.4, dt);
    }

    // Air units aim with nose mostly
    const aimAngle = Math.atan2(this.aimPoint.y - this.y, this.aimPoint.x - this.x);
    if (!this.isPlayerDriven || !driving) {
      this.bodyAngle = Phaser.Math.Angle.RotateTo(this.bodyAngle, aimAngle, this.def.turnSpeed * 0.35 * dt);
    }
    this.syncSprite();
  }
}
