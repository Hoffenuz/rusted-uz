import Phaser from 'phaser';
import { BUILDING_DEFS, type BuildingKind, type BuildingSpawn } from '../data/buildings';
import { AIRCRAFT_DEFS, isAircraftId, type UnitId } from '../data/aircraft';
import { TANK_DEFS, type TankTeam } from '../data/tanks';

export interface ProduceRequest {
  unitId: UnitId;
  remainingMs: number;
  totalMs: number;
}

function unitDef(unitId: UnitId) {
  if (isAircraftId(unitId)) return AIRCRAFT_DEFS[unitId];
  return TANK_DEFS[unitId];
}

export class Building extends Phaser.GameObjects.Container {
  readonly kind: BuildingKind;
  readonly team: TankTeam;
  def = BUILDING_DEFS.hq;
  hp: number;
  alive = true;
  queue: ProduceRequest | null = null;

  private readonly sprite: Phaser.GameObjects.Image;
  private readonly hpBg: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly progressBg: Phaser.GameObjects.Rectangle;
  private readonly progressFill: Phaser.GameObjects.Rectangle;
  private readonly progressLabel: Phaser.GameObjects.Text;
  private readonly selectHint: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, spawn: BuildingSpawn) {
    super(scene, spawn.x, spawn.y);

    const baseDef = BUILDING_DEFS[spawn.kind];
    this.def = {
      ...baseDef,
      produceList: spawn.produceListOverride ? [...spawn.produceListOverride] : [...baseDef.produceList],
    };
    if (spawn.textureOverride) this.def.texture = spawn.textureOverride;
    if (spawn.scaleOverride) this.def.scale = spawn.scaleOverride;

    this.kind = spawn.kind;
    this.team = spawn.team;
    this.hp = this.def.maxHp;

    if (this.def.padTexture && scene.textures.exists(this.def.padTexture)) {
      const pad = scene.add.image(0, 8, this.def.padTexture).setOrigin(0.5);
      pad.setScale(this.def.scale * 1.05);
      pad.setAlpha(0.85);
      this.add(pad);
    }

    this.sprite = scene.add.image(0, 0, this.def.texture).setOrigin(0.5);
    this.sprite.setScale(this.def.scale);
    if (this.team === 'enemy') this.sprite.setTint(0xffd5cc);
    this.add(this.sprite);

    const top = -this.sprite.displayHeight * 0.48;
    this.hpBg = scene.add.rectangle(0, top - 10, 72, 7, 0x111111, 0.85);
    this.hpFill = scene.add
      .rectangle(-36, top - 10, 72, 7, this.team === 'player' ? 0x4caf70 : 0xd35a3d)
      .setOrigin(0, 0.5);
    this.label = scene.add
      .text(0, top - 24, this.def.displayName, {
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        color: this.team === 'player' ? '#cfe8cf' : '#f0c4ba',
      })
      .setOrigin(0.5);

    this.progressBg = scene.add.rectangle(0, this.sprite.displayHeight * 0.42 + 8, 80, 8, 0x111111, 0.8).setVisible(false);
    this.progressFill = scene.add
      .rectangle(-40, this.sprite.displayHeight * 0.42 + 8, 0, 8, 0xc4a35a)
      .setOrigin(0, 0.5)
      .setVisible(false);
    this.progressLabel = scene.add
      .text(0, this.sprite.displayHeight * 0.42 + 22, '', {
        fontFamily: 'Segoe UI',
        fontSize: '11px',
        color: '#e8d7a8',
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.selectHint = scene.add
      .text(0, this.sprite.displayHeight * 0.42 + 8, this.def.canProduce ? 'bosing → menyu' : '', {
        fontFamily: 'Segoe UI',
        fontSize: '10px',
        color: '#c4a35a',
      })
      .setOrigin(0.5)
      .setVisible(this.def.canProduce && this.team === 'player');

    this.add([this.hpBg, this.hpFill, this.label, this.progressBg, this.progressFill, this.progressLabel, this.selectHint]);

    scene.add.existing(this);

    // Hitbox slightly larger than sprite so pads are easy to tap
    const hw = Math.max(40, this.sprite.displayWidth * 0.48);
    const hh = Math.max(40, this.sprite.displayHeight * 0.48);
    this.setSize(hw * 2, hh * 2);
    this.setInteractive(new Phaser.Geom.Rectangle(-hw, -hh, hw * 2, hh * 2), Phaser.Geom.Rectangle.Contains);
    // Above tanks (depth 10) so factory/pad clicks win over overlapping units
    this.setDepth(this.kind === 'airbase' || this.kind === 'helipad' ? 14 : 13);

    if (this.def.canProduce && this.team === 'player') {
      const ring = scene.add
        .rectangle(0, 0, hw * 2.1, hh * 2.1, 0x000000, 0)
        .setStrokeStyle(2, 0xc4a35a, 0.85);
      this.addAt(ring, 0);
    }
  }

  get spawnPoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x + this.def.spawnOffset.x, this.y + this.def.spawnOffset.y);
  }

  spriteDisplayRadius(): number {
    return Math.max(this.sprite.displayWidth, this.sprite.displayHeight) * 0.55;
  }

  containsPoint(x: number, y: number): boolean {
    const hw = Math.max(40, this.sprite.displayWidth * 0.48);
    const hh = Math.max(40, this.sprite.displayHeight * 0.48);
    return Math.abs(x - this.x) <= hw && Math.abs(y - this.y) <= hh;
  }

  canStartProduce(unitId: UnitId, credits: number): string | null {
    if (!this.alive) return 'Baza yo‘q qilingan';
    if (!this.def.canProduce) return 'Bu bino ishlab chiqarmaydi';
    if (!this.def.produceList.includes(unitId)) return 'Bu yerda chiqarib bo‘lmaydi';
    if (this.queue) return 'Zavod band';
    const cost = unitDef(unitId).buildCost;
    if (credits < cost) return `Yetarli kredit yo‘q (${cost})`;
    return null;
  }

  startProduce(unitId: UnitId): number {
    const def = unitDef(unitId);
    this.queue = { unitId, remainingMs: def.buildTimeMs, totalMs: def.buildTimeMs };
    this.selectHint.setVisible(false);
    this.progressBg.setVisible(true);
    this.progressFill.setVisible(true);
    this.progressLabel.setVisible(true);
    this.progressLabel.setText(`${def.displayName}…`);
    return def.buildCost;
  }

  updateProduction(delta: number): UnitId | null {
    if (!this.queue || !this.alive) return null;
    this.queue.remainingMs -= delta;
    const done = 1 - this.queue.remainingMs / this.queue.totalMs;
    this.progressFill.width = 80 * Phaser.Math.Clamp(done, 0, 1);
    if (this.queue.remainingMs > 0) return null;

    const id = this.queue.unitId;
    this.queue = null;
    this.progressBg.setVisible(false);
    this.progressFill.setVisible(false);
    this.progressLabel.setVisible(false);
    this.selectHint.setVisible(this.def.canProduce && this.team === 'player');
    return id;
  }

  takeDamage(amount: number): boolean {
    if (!this.alive) return false;
    this.hp = Math.max(0, this.hp - amount);
    const ratio = this.hp / this.def.maxHp;
    this.hpFill.width = 72 * ratio;
    if (this.hp > 0) return false;

    this.alive = false;
    this.queue = null;
    this.sprite.setTint(0x444444);
    this.setAlpha(0.55);
    this.progressBg.setVisible(false);
    this.progressFill.setVisible(false);
    this.progressLabel.setVisible(false);
    this.selectHint.setVisible(false);
    this.label.setText(`${this.def.displayName} · vayron`);
    this.disableInteractive();
    return true;
  }
}
