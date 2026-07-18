import Phaser from 'phaser';
import {
  assetKeys,
  TANK_DEFS,
  type AllyStance,
  type TankDef,
  type TankId,
  type TankTeam,
} from '../data/tanks';

export interface TankSpawnOptions {
  id: TankId;
  team: TankTeam;
  x: number;
  y: number;
  controllable?: boolean;
  facing?: number;
}

export interface DriveInput {
  throttle: number;
  steer: number;
}

export class Tank extends Phaser.GameObjects.Container {
  readonly def: TankDef;
  readonly team: TankTeam;
  readonly controllable: boolean;

  hp: number;
  bodyAngle = 0;
  turretAngle = 0;
  alive = true;
  isPlayerDriven = false;
  /** AI mode for player tanks when not driven. */
  stance: AllyStance = 'auto';

  private readonly bodySprite: Phaser.GameObjects.Image;
  private readonly turretSprite: Phaser.GameObjects.Image;
  private readonly barrelSprite: Phaser.GameObjects.Image;
  private readonly hpBg: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly ownerLabel: Phaser.GameObjects.Text;
  private readonly selectRing: Phaser.GameObjects.Ellipse;
  private cooldownUntil = 0;
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private aimPoint = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, options: TankSpawnOptions) {
    super(scene, options.x, options.y);

    this.def = TANK_DEFS[options.id];
    this.team = options.team;
    this.controllable = options.controllable ?? false;
    this.hp = this.def.maxHp;
    this.bodyAngle = options.facing ?? (options.team === 'player' ? -Math.PI / 2 : Math.PI / 2);
    this.turretAngle = this.bodyAngle;
    this.aimPoint.set(options.x + Math.cos(this.bodyAngle) * 100, options.y + Math.sin(this.bodyAngle) * 100);

    const keys = assetKeys(options.id);
    const scale = this.def.scale;
    const layered = this.def.layerMode === 'layered';

    this.bodySprite = scene.add.image(0, 0, keys.body).setOrigin(0.5);
    this.turretSprite = scene.add.image(0, 0, keys.turret).setOrigin(0.5);
    this.barrelSprite = scene.add
      .image(0, 0, keys.barrel)
      .setOrigin(0.5, layered ? 0.5 : this.def.barrelOriginY);

    this.bodySprite.setScale(scale);
    this.turretSprite.setScale(scale);
    this.barrelSprite.setScale(scale);

    /**
     * Deux Vies (layered): turret.png ALLAQACHON qurolni o‘z ichiga oladi.
     * barrel.png ko‘pincha turret nusxasi — ikkalasini chizish = bijirlash / z-fight.
     * Chinese separate: body + turret + barrel alohida.
     */
    this.barrelSprite.setVisible(!layered);
    this.add([this.bodySprite, this.turretSprite, this.barrelSprite]);

    this.selectRing = scene.add
      .ellipse(0, 0, 56, 40, 0x000000, 0)
      .setStrokeStyle(2, 0x6ecf7a, 1)
      .setVisible(false);
    this.add(this.selectRing);

    this.hpBg = scene.add.rectangle(0, -36, 48, 5, 0x111111, 0.85);
    this.hpFill = scene.add
      .rectangle(-24, -36, 48, 5, this.team === 'player' ? 0x4caf70 : 0xd35a3d)
      .setOrigin(0, 0.5);
    this.nameLabel = scene.add
      .text(0, -46, this.def.displayName, {
        fontFamily: 'Segoe UI',
        fontSize: '10px',
        color: this.team === 'player' ? '#b7e0b8' : '#e8b2a4',
      })
      .setOrigin(0.5);
    this.ownerLabel = scene.add
      .text(0, 40, 'MENING TANKIM', {
        fontFamily: 'Segoe UI',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffe08a',
        backgroundColor: '#1a2a14',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.add([this.hpBg, this.hpFill, this.nameLabel, this.ownerLabel]);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 40);
    body.setOffset(-20, -20);
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false);
    body.moves = false;

    this.setSize(44, 44);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, 22), Phaser.Geom.Circle.Contains);

    this.setDepth(10);
    this.setPlayerDriven(false);
    this.syncSprites();
  }

  setPlayerDriven(driven: boolean) {
    this.isPlayerDriven = driven && this.alive && this.controllable;
    this.selectRing.setVisible(this.isPlayerDriven);
    this.ownerLabel.setVisible(this.isPlayerDriven);
    if (this.isPlayerDriven) {
      this.selectRing.setStrokeStyle(2, 0xffe08a, 1);
      this.nameLabel.setColor('#ffe08a');
    } else if (this.alive) {
      this.selectRing.setVisible(false);
      this.nameLabel.setColor(this.team === 'player' ? '#b7e0b8' : '#e8b2a4');
    }
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
    // layered turret art: barrel tip ~ half of 128px hull along aim
    const length = this.def.layerMode === 'separate' ? 28 : 36 * this.def.scale;
    return new Phaser.Math.Vector2(
      this.x + Math.cos(this.turretAngle) * length,
      this.y + Math.sin(this.turretAngle) * length,
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
    this.refreshHpBar();
    if (this.hp <= 0) {
      this.destroyTank();
      return true;
    }
    return false;
  }

  private refreshHpBar() {
    const ratio = this.hp / this.def.maxHp;
    this.hpFill.width = 48 * ratio;
    this.hpFill.fillColor = ratio > 0.45 ? (this.team === 'player' ? 0x4caf70 : 0xd35a3d) : 0xc4a35a;
  }

  private destroyTank() {
    this.alive = false;
    this.isPlayerDriven = false;
    this.clearMoveTarget();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.disableInteractive();

    this.bodySprite.setTexture(assetKeys(this.def.id).wreck);
    this.turretSprite.setVisible(false);
    this.barrelSprite.setVisible(false);
    this.selectRing.setVisible(false);
    this.ownerLabel.setVisible(false);
    this.hpBg.setVisible(false);
    this.hpFill.setVisible(false);
    this.nameLabel.setText(`${this.def.displayName} · yo'q qilindi`);
    this.setAlpha(0.75);
    this.setDepth(2);
  }

  private syncSprites() {
    const artOffset = this.def.bodyFacingOffset;
    this.bodySprite.setRotation(this.bodyAngle - artOffset);
    this.turretSprite.setRotation(this.turretAngle - artOffset);

    if (this.def.layerMode === 'separate') {
      this.barrelSprite.setVisible(true);
      this.barrelSprite.setRotation(this.turretAngle - artOffset);
      const inset = this.def.barrelInset * this.def.scale;
      this.barrelSprite.setPosition(
        -Math.cos(this.turretAngle) * inset,
        -Math.sin(this.turretAngle) * inset,
      );
    } else {
      // layered: gun is baked into turret art
      this.barrelSprite.setVisible(false);
    }
  }

  private moveBy(speed: number, dt: number) {
    const nx = this.x + Math.cos(this.bodyAngle) * speed * dt;
    const ny = this.y + Math.sin(this.bodyAngle) * speed * dt;
    const bounds = this.scene.physics.world.bounds;
    this.x = Phaser.Math.Clamp(nx, bounds.x + 30, bounds.right - 30);
    this.y = Phaser.Math.Clamp(ny, bounds.y + 30, bounds.bottom - 30);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(this.x, this.y);
  }

  updateTank(delta: number, drive?: DriveInput) {
    if (!this.alive) return;

    const dt = delta / 1000;
    const driving = !!(drive && (Math.abs(drive.throttle) > 0.01 || Math.abs(drive.steer) > 0.01));

    if (this.isPlayerDriven && driving && drive) {
      this.moveTarget = null;
      this.bodyAngle += drive.steer * this.def.turnSpeed * dt;
      if (Math.abs(drive.throttle) > 0.01) {
        const speed = drive.throttle >= 0 ? this.def.speed * drive.throttle : this.def.reverseSpeed * drive.throttle;
        this.moveBy(speed, dt);
      }
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.x;
      const dy = this.moveTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 14) {
        this.moveTarget = null;
      } else {
        const desired = Math.atan2(dy, dx);
        this.bodyAngle = Phaser.Math.Angle.RotateTo(this.bodyAngle, desired, this.def.turnSpeed * dt);
        const aligned = Math.abs(Phaser.Math.Angle.Wrap(desired - this.bodyAngle)) < 0.55;
        this.moveBy(aligned ? this.def.speed : this.def.speed * 0.35, dt);
      }
    }

    const aimAngle = Math.atan2(this.aimPoint.y - this.y, this.aimPoint.x - this.x);
    this.turretAngle = Phaser.Math.Angle.RotateTo(this.turretAngle, aimAngle, this.def.turretTurnSpeed * dt);
    this.syncSprites();
  }
}
