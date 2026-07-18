import Phaser from 'phaser';
import { Tank, type DriveInput } from '../entities/Tank';
import { Aircraft } from '../entities/Aircraft';
import { Projectile } from '../entities/Projectile';
import { Building } from '../entities/Building';
import { BuildMenu } from '../ui/BuildMenu';
import { MobileControls } from '../ui/MobileControls';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  ALLIES_BUILD,
  AXIS_BUILD,
  SOVIET_BUILD,
  TANK_DEFS,
  type TankId,
} from '../data/tanks';
import {
  AIRCRAFT_DEFS,
  ENEMY_AIR_QUEUE,
  isAircraftId,
  type AircraftId,
  type UnitId,
} from '../data/aircraft';
import { DEFAULT_SESSION, type SessionConfig } from '../data/session';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_HEIGHT, WORLD_WIDTH } from '../config';
import { createBattlefield } from '../world/Terrain';

type Controllable = Tank | Aircraft;

export class BattleScene extends Phaser.Scene {
  private tanks: Tank[] = [];
  private aircraft: Aircraft[] = [];
  private buildings: Building[] = [];
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private fireKey!: Phaser.Input.Keyboard.Key;
  private cycleKey!: Phaser.Input.Keyboard.Key;
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;
  private key3!: Phaser.Input.Keyboard.Key;
  private key4!: Phaser.Input.Keyboard.Key;
  private keyF!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private keyG!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private pointerWorld = new Phaser.Math.Vector2();
  private statusText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private buildMenu!: BuildMenu;
  private mobile?: MobileControls;
  private confirm!: ConfirmDialog;
  private whiteReady = false;
  private blockWorldClickUntil = 0;
  private session: SessionConfig = { ...DEFAULT_SESSION };

  private myUnit: Controllable | null = null;

  private playerCredits = 700;
  private enemyCredits = 900;
  private creditTimer = 0;
  private enemyBuildTimer = 5000;
  private enemyAirTimer = 8000;
  private messageTimer = 0;

  private playerFactory!: Building;
  private playerAirbase!: Building;
  private playerHelipad!: Building;
  private enemyFactory!: Building;
  private enemyAirbase!: Building;

  constructor() {
    super('Battle');
  }

  create() {
    this.session = { ...(this.registry.get('session') as SessionConfig | undefined ?? DEFAULT_SESSION) };
    const assault = this.session.battle === 'assault';
    const axis = this.session.faction === 'axis';

    this.ensureWhiteTexture();
    createBattlefield(this);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.setBounds(60, 60, WORLD_WIDTH - 120, WORLD_HEIGHT - 120);
    this.input.setTopOnly(true);

    this.projectiles = this.physics.add.group({
      classType: Projectile,
      maxSize: 120,
      runChildUpdate: true,
    });

    const playerBuild = axis ? AXIS_BUILD : ALLIES_BUILD;
    const enemyBuild = axis ? SOVIET_BUILD : AXIS_BUILD;

    const hq = new Building(this, { kind: 'hq', team: 'player', x: 260, y: 1380 });
    this.playerFactory = new Building(this, {
      kind: 'factory',
      team: 'player',
      x: 420,
      y: 1300,
      produceListOverride: [...playerBuild],
    });
    const barracks = new Building(this, { kind: 'barracks', team: 'player', x: 180, y: 1240 });
    // Air pads away from tank spawn (right side of base) — simple RW pads
    this.playerAirbase = new Building(this, { kind: 'airbase', team: 'player', x: 320, y: 1050 });
    this.playerHelipad = new Building(this, { kind: 'helipad', team: 'player', x: 520, y: 1050 });
    this.buildings.push(hq, this.playerFactory, barracks, this.playerAirbase, this.playerHelipad);

    this.enemyFactory = new Building(this, {
      kind: 'enemyBase',
      team: 'enemy',
      x: 1980,
      y: 420,
      produceListOverride: [...enemyBuild],
    });
    const enemyPad = new Building(this, {
      kind: 'hq',
      team: 'enemy',
      x: 1780,
      y: 340,
      textureOverride: 'bld-rw-hq',
      scaleOverride: 1.2,
    });
    this.enemyAirbase = new Building(this, {
      kind: 'airbase',
      team: 'enemy',
      x: 1680,
      y: 260,
      produceListOverride: ['mig', 'stuka'],
    });
    this.buildings.push(this.enemyFactory, enemyPad, this.enemyAirbase);

    const starterA: TankId = axis ? 'tiger_b' : 'pershing';
    const starterB: TankId = axis ? 'panther' : 'm4';
    // Spawn tanks away from air/heli pads to avoid mis-taps
    const myTank = new Tank(this, {
      id: starterA,
      team: 'player',
      x: 700,
      y: 1420,
      controllable: true,
      facing: -Math.PI / 2,
    });
    const allyTank = new Tank(this, {
      id: starterB,
      team: 'player',
      x: 820,
      y: 1480,
      controllable: true,
      facing: -Math.PI / 2,
    });

    // Stronger enemy force (same visual scale family)
    const enemyStarters: { id: TankId; x: number; y: number }[] = axis
      ? [
          { id: 'is2', x: 1680, y: 500 },
          { id: 't34', x: 1800, y: 560 },
          { id: 'kv1', x: 1900, y: 640 },
          { id: 't34', x: 1750, y: 700 },
        ]
      : [
          { id: 'tiger_b', x: 1680, y: 500 },
          { id: 'panther', x: 1800, y: 560 },
          { id: 'panzer4', x: 1900, y: 640 },
          { id: 'panther', x: 1750, y: 700 },
        ];
    if (assault) {
      enemyStarters.push(
        { id: enemyStarters[0].id, x: 1600, y: 620 },
        { id: enemyStarters[1].id, x: 1950, y: 480 },
      );
      this.enemyCredits = 1200;
      this.enemyBuildTimer = 3500;
      this.enemyAirTimer = 6000;
    }

    this.tanks.push(
      myTank,
      allyTank,
      ...enemyStarters.map(
        (e) => new Tank(this, { id: e.id, team: 'enemy', x: e.x, y: e.y, facing: Math.PI }),
      ),
    );
    this.aircraft.push(
      new Aircraft(this, { id: 'mig', team: 'enemy', x: 1500, y: 380, facing: Math.PI }),
      new Aircraft(this, { id: 'stuka', team: 'enemy', x: 1580, y: 300, facing: Math.PI }),
    );

    this.takeControl(myTank);
    this.cameras.main.centerOn(myTank.x, myTank.y);

    this.buildMenu = new BuildMenu(this);
    this.confirm = new ConfirmDialog(this);
    if (this.session.platform === 'mobile') {
      this.mobile = new MobileControls(this);
    } else {
      // PC: small menu button
      const menuBtn = this.add
        .text(GAME_WIDTH - 16, GAME_HEIGHT - 16, 'Menu (ESC)', {
          fontFamily: 'Segoe UI',
          fontSize: '13px',
          color: '#c4a35a',
          backgroundColor: 'rgba(8,14,12,0.65)',
          padding: { x: 10, y: 6 },
        })
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(300)
        .setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => this.askLeave());
    }

    this.game.canvas.setAttribute('tabindex', '0');
    this.game.canvas.focus();

    this.input.keyboard!.enabled = true;
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cycleKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.key1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.keyF = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyH = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keyG = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (this.buildMenu.isOpen || this.confirm.isOpen) return;
      if (this.time.now < this.blockWorldClickUntil) return;
      if (this.mobile?.blocksWorldInput(pointer.x, pointer.y)) return;

      // Baza ustida tank bo‘lsa ham — avval bino
      const overBuild = this.buildings.find(
        (b) => b.team === 'player' && b.alive && b.def.canProduce && b.containsPoint(pointer.worldX, pointer.worldY),
      );
      if (overBuild) {
        pointer.event?.stopPropagation?.();
        this.blockWorldClickUntil = this.time.now + 250;
        this.buildMenu.show(overBuild, this.playerCredits, (unitId) => this.tryBuildAt(overBuild, unitId));
        this.showToast(`${overBuild.def.displayName} — tanlang`);
        return;
      }

      if (obj instanceof Building) return;

      if (obj instanceof Tank && obj.team === 'player' && obj.alive && obj.controllable) {
        this.takeControl(obj);
        this.showToast(`${obj.def.displayName} — endi siz boshqarasiz`);
        return;
      }

      if (obj instanceof Aircraft && obj.team === 'player' && obj.alive && obj.controllable) {
        this.takeControl(obj);
        this.showToast(`${obj.def.displayName} — endi siz boshqarasiz`);
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.game.canvas.focus();
      if (this.confirm.isOpen) return;
      if (this.buildMenu.isOpen) {
        if (pointer.rightButtonDown() || this.session.platform === 'mobile') this.buildMenu.hide();
        return;
      }
      if (this.time.now < this.blockWorldClickUntil) return;

      // Ignore UI zone clicks on mobile (joystick / buttons / menu)
      if (this.mobile?.blocksWorldInput(pointer.x, pointer.y)) return;

      if (pointer.rightButtonDown()) {
        const wx = pointer.worldX;
        const wy = pointer.worldY;
        if (pointer.event.shiftKey) {
          this.orderAlliesAttackMove(wx, wy);
          this.showToast('Barcha birliklar: hujum-harakat');
          return;
        }
        if (this.myUnit?.alive) {
          this.myUnit.setMoveTarget(wx, wy);
          this.showToast('Nuqtaga borish');
        }
        return;
      }

      if (!pointer.leftButtonDown()) return;

      // Buildings first — never fall through to tank select
      const hitBuilding = this.buildings.find(
        (b) => b.team === 'player' && b.alive && b.def.canProduce && b.containsPoint(pointer.worldX, pointer.worldY),
      );
      if (hitBuilding) {
        this.blockWorldClickUntil = this.time.now + 200;
        this.buildMenu.show(hitBuilding, this.playerCredits, (unitId) => this.tryBuildAt(hitBuilding, unitId));
        this.showToast(`${hitBuilding.def.displayName} menyusi`);
        return;
      }

      const hitTank = this.tanks.find(
        (t) =>
          t.team === 'player' &&
          t.alive &&
          t.controllable &&
          Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, t.x, t.y) < 28,
      );
      if (hitTank) {
        this.takeControl(hitTank);
        return;
      }

      const hitAir = this.aircraft.find(
        (a) =>
          a.team === 'player' &&
          a.alive &&
          a.controllable &&
          Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, a.x, a.y) < 28,
      );
      if (hitAir) {
        this.takeControl(hitAir);
        return;
      }

      // Mobile tap-to-move when not firing via button
      if (this.session.platform === 'mobile' && this.myUnit?.alive && !this.mobile?.firing) {
        this.myUnit.setMoveTarget(pointer.worldX, pointer.worldY);
        return;
      }

      this.tryFire(this.myUnit);
    });

    this.statusText = this.add
      .text(GAME_WIDTH - 16, 16, '', {
        fontFamily: 'Segoe UI',
        fontSize: '13px',
        color: '#d7e6d4',
        align: 'right',
        backgroundColor: 'rgba(8,14,12,0.55)',
        padding: { x: 10, y: 8 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.toastText = this.add
      .text(GAME_WIDTH / 2, this.session.platform === 'mobile' ? GAME_HEIGHT - 210 : GAME_HEIGHT - 28, '', {
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        color: '#f0e0b0',
        backgroundColor: 'rgba(8,14,12,0.65)',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.sound.play('sfx-select', { volume: 0.35 });
    this.showToast(
      this.session.platform === 'mobile'
        ? 'Joystick + OT tugmasi · B=zavod · tap=borish'
        : 'Zavod/maydon ustiga bosing · ESC=menu',
    );
  }

  private takeControl(unit: Controllable) {
    if (!unit.alive) return;
    this.tanks.forEach((t) => t.setPlayerDriven(false));
    this.aircraft.forEach((a) => a.setPlayerDriven(false));
    unit.setPlayerDriven(true);
    unit.clearMoveTarget();
    this.myUnit = unit;
    this.sound.play('sfx-select', { volume: 0.3 });
  }

  private ensureWhiteTexture() {
    if (this.whiteReady || this.textures.exists('__WHITE')) {
      this.whiteReady = true;
      return;
    }
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture('__WHITE', 8, 8);
    g.destroy();
    this.whiteReady = true;
  }

  private showToast(msg: string) {
    this.toastText.setText(msg);
    this.toastText.setAlpha(1);
    this.messageTimer = 2800;
  }

  private controllableUnits(): Controllable[] {
    return [
      ...this.tanks.filter((t) => t.team === 'player' && t.alive && t.controllable),
      ...this.aircraft.filter((a) => a.team === 'player' && a.alive && a.controllable),
    ];
  }

  private cycleMyUnit() {
    const list = this.controllableUnits();
    if (!list.length) {
      this.myUnit = null;
      return;
    }
    const idx = this.myUnit ? list.indexOf(this.myUnit) : -1;
    this.takeControl(list[(idx + 1) % list.length]);
    this.showToast(`${'def' in this.myUnit! ? this.myUnit.def.displayName : ''} tanlandi`);
  }

  private tryBuildAt(building: Building, unitId: UnitId) {
    const err = building.canStartProduce(unitId, this.playerCredits);
    if (err) {
      this.showToast(err);
      return;
    }
    this.playerCredits -= building.startProduce(unitId);
    this.sound.play('sfx-engine', { volume: 0.35 });
    const name = isAircraftId(unitId) ? AIRCRAFT_DEFS[unitId].displayName : TANK_DEFS[unitId].displayName;
    this.showToast(`${name} ishlab chiqarilmoqda…`);
  }

  private spawnTank(id: TankId, team: 'player' | 'enemy', x: number, y: number, facing?: number) {
    const tank = new Tank(this, { id, team, x, y, controllable: team === 'player', facing });
    this.tanks.push(tank);
    if (team === 'player' && !this.myUnit?.alive) this.takeControl(tank);
    return tank;
  }

  private spawnAircraft(id: AircraftId, team: 'player' | 'enemy', x: number, y: number, facing?: number) {
    const air = new Aircraft(this, { id, team, x, y, controllable: team === 'player', facing });
    this.aircraft.push(air);
    if (team === 'player' && !this.myUnit?.alive) this.takeControl(air);
    return air;
  }

  private spawnUnit(unitId: UnitId, team: 'player' | 'enemy', x: number, y: number, facing?: number) {
    if (isAircraftId(unitId)) return this.spawnAircraft(unitId, team, x, y, facing);
    return this.spawnTank(unitId, team, x, y, facing);
  }

  private tryFire(unit?: Controllable | null) {
    if (!unit || !unit.canFire(this.time.now)) return;

    const muzzle = unit.muzzle;
    const shot = this.projectiles.get(muzzle.x, muzzle.y) as Projectile | null;
    if (!shot) return;

    const angle = unit instanceof Tank ? unit.turretAngle : unit.bodyAngle;
    const speed = unit.def.projectileSpeed;
    const damage = unit.team === 'enemy' ? unit.def.damage * 1.15 : unit.def.damage;
    shot.launch(muzzle.x, muzzle.y, angle, speed, damage, unit.team);
    unit.markFired(this.time.now);
    this.sound.play('sfx-cannon', { volume: unit.team === 'player' ? 0.4 : 0.28 });

    const flash = this.add.circle(muzzle.x, muzzle.y, 7, 0xffe6a8, 0.85).setDepth(25);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.2,
      duration: 120,
      onComplete: () => flash.destroy(),
    });
  }

  private updateProduction(delta: number) {
    for (const b of this.buildings) {
      if (!b.def.canProduce) continue;
      const finished = b.updateProduction(delta);
      if (!finished) continue;
      const p = b.spawnPoint;
      const facing = b.team === 'player' ? -Math.PI / 2 : Math.PI;
      this.spawnUnit(
        finished,
        b.team,
        p.x + Phaser.Math.Between(-24, 24),
        p.y + Phaser.Math.Between(-24, 24),
        facing,
      );
      if (b.team === 'player') {
        const name = isAircraftId(finished) ? AIRCRAFT_DEFS[finished].displayName : TANK_DEFS[finished].displayName;
        this.sound.play('sfx-select', { volume: 0.4 });
        this.showToast(`${name} tayyor — ustiga bosing yoki R`);
      }
    }
  }

  private updateEconomy(delta: number) {
    this.creditTimer += delta;
    if (this.creditTimer >= 1000) {
      this.creditTimer = 0;
      if (this.playerFactory.alive) this.playerCredits += 18;
      if (this.playerAirbase.alive) this.playerCredits += 6;
      // Enemy economy stronger — keeps pressure
      if (this.enemyFactory.alive) this.enemyCredits += 28;
      if (this.enemyAirbase.alive) this.enemyCredits += 12;
    }

    const enemyList = this.enemyFactory.def.produceList.filter((id) => !isAircraftId(id)) as TankId[];
    this.enemyBuildTimer -= delta;
    if (this.enemyBuildTimer <= 0 && this.enemyFactory.alive && !this.enemyFactory.queue && enemyList.length) {
      const pick = enemyList[Phaser.Math.Between(0, enemyList.length - 1)];
      if (!this.enemyFactory.canStartProduce(pick, this.enemyCredits)) {
        // skip
      } else {
        this.enemyCredits -= this.enemyFactory.startProduce(pick);
      }
      this.enemyBuildTimer = 4500 + Phaser.Math.Between(0, 2500);
    }

    this.enemyAirTimer -= delta;
    if (this.enemyAirTimer <= 0 && this.enemyAirbase.alive && !this.enemyAirbase.queue) {
      const pick = ENEMY_AIR_QUEUE[Phaser.Math.Between(0, ENEMY_AIR_QUEUE.length - 1)];
      if (!this.enemyAirbase.canStartProduce(pick, this.enemyCredits)) {
        // skip
      } else {
        this.enemyCredits -= this.enemyAirbase.startProduce(pick);
      }
      this.enemyAirTimer = 7000 + Phaser.Math.Between(0, 3000);
    }
  }

  private updateAi(delta: number) {
    const players = [
      ...this.tanks.filter((t) => t.team === 'player' && t.alive),
      ...this.aircraft.filter((a) => a.team === 'player' && a.alive),
    ];
    const enemies = [
      ...this.tanks.filter((t) => t.team === 'enemy' && t.alive),
      ...this.aircraft.filter((a) => a.team === 'enemy' && a.alive),
    ];
    const playerBuildings = this.buildings.filter((b) => b.team === 'player' && b.alive);

    for (const enemy of this.tanks.filter((t) => t.team === 'enemy' && t.alive)) {
      let nearest: Controllable | undefined;
      let best = Number.POSITIVE_INFINITY;
      for (const p of players) {
        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, p.x, p.y);
        if (d < best) {
          best = d;
          nearest = p;
        }
      }
      let nearestBld: Building | undefined;
      let bestBld = Number.POSITIVE_INFINITY;
      for (const b of playerBuildings) {
        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, b.x, b.y);
        if (d < bestBld) {
          bestBld = d;
          nearestBld = b;
        }
      }
      // Prefer fighting units; only hit buildings if no unit nearby
      const preferUnit = nearest && best < 900;
      const tx = preferUnit ? nearest!.x : nearestBld?.x ?? nearest?.x;
      const ty = preferUnit ? nearest!.y : nearestBld?.y ?? nearest?.y;
      if (tx === undefined || ty === undefined) {
        enemy.updateTank(delta);
        continue;
      }
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, tx, ty);
      enemy.setAim(tx, ty);
      // Always press the attack — chase hard
      if (dist > enemy.def.attackRange * 0.55) enemy.setMoveTarget(tx, ty);
      else enemy.clearMoveTarget();
      const aimDiff = Math.abs(Phaser.Math.Angle.Wrap(enemy.turretAngle - Math.atan2(ty - enemy.y, tx - enemy.x)));
      if (dist <= enemy.def.attackRange && aimDiff < 0.45) this.tryFire(enemy);
      enemy.updateTank(delta);
    }

    for (const air of this.aircraft.filter((a) => a.team === 'enemy' && a.alive)) {
      let nearest: Controllable | Building | undefined;
      let best = Number.POSITIVE_INFINITY;
      for (const p of players) {
        const d = Phaser.Math.Distance.Between(air.x, air.y, p.x, p.y);
        if (d < best) {
          best = d;
          nearest = p;
        }
      }
      for (const b of playerBuildings) {
        const d = Phaser.Math.Distance.Between(air.x, air.y, b.x, b.y);
        if (d < best) {
          best = d;
          nearest = b;
        }
      }
      if (!nearest) {
        air.updateAircraft(delta);
        continue;
      }
      air.setAim(nearest.x, nearest.y);
      air.setMoveTarget(nearest.x, nearest.y);
      if (best <= air.def.attackRange) this.tryFire(air);
      air.updateAircraft(delta);
    }

    // Player allies: independent AI + stance (auto / hold / follow / attackMove)
    const leader = this.myUnit?.alive ? this.myUnit : null;
    for (const ally of this.tanks.filter((t) => t.team === 'player' && t.alive && !t.isPlayerDriven)) {
      this.runAllyAi(ally, enemies, leader, delta);
    }
    for (const ally of this.aircraft.filter((a) => a.team === 'player' && a.alive && !a.isPlayerDriven)) {
      this.runAllyAi(ally, enemies, leader, delta);
    }
  }

  private nearestEnemy(from: Controllable, enemies: Controllable[]): { unit?: Controllable; dist: number } {
    let unit: Controllable | undefined;
    let dist = Number.POSITIVE_INFINITY;
    for (const e of enemies) {
      const d = Phaser.Math.Distance.Between(from.x, from.y, e.x, e.y);
      if (d < dist) {
        dist = d;
        unit = e;
      }
    }
    return { unit, dist };
  }

  private runAllyAi(ally: Controllable, enemies: Controllable[], leader: Controllable | null, delta: number) {
    const { unit: nearest, dist } = this.nearestEnemy(ally, enemies);
    const aggro = ally instanceof Tank ? 780 : 900;
    const range = ally.def.attackRange;

    if (ally.stance === 'hold') {
      ally.clearMoveTarget();
      if (nearest && dist <= range) {
        ally.setAim(nearest.x, nearest.y);
        this.tryFire(ally);
      }
    } else if (ally.stance === 'follow' && leader) {
      const fd = Phaser.Math.Distance.Between(ally.x, ally.y, leader.x, leader.y);
      if (fd > 110) ally.setMoveTarget(leader.x, leader.y);
      else ally.clearMoveTarget();
      if (nearest && dist <= range) {
        ally.setAim(nearest.x, nearest.y);
        this.tryFire(ally);
      } else {
        ally.setAim(leader.x + Math.cos(leader.bodyAngle) * 80, leader.y + Math.sin(leader.bodyAngle) * 80);
      }
    } else if (ally.stance === 'attackMove') {
      // keep existing moveTarget; engage if enemy nearby
      if (nearest && dist <= aggro) {
        ally.setAim(nearest.x, nearest.y);
        if (dist > range * 0.75) ally.setMoveTarget(nearest.x, nearest.y);
        if (dist <= range) this.tryFire(ally);
      }
    } else {
      // auto: hunt nearby enemies, otherwise hold near leader
      if (nearest && dist <= aggro) {
        ally.setAim(nearest.x, nearest.y);
        if (dist > range * 0.7) ally.setMoveTarget(nearest.x, nearest.y);
        else ally.clearMoveTarget();
        if (dist <= range) this.tryFire(ally);
      } else if (leader) {
        const fd = Phaser.Math.Distance.Between(ally.x, ally.y, leader.x, leader.y);
        if (fd > 160) ally.setMoveTarget(leader.x, leader.y);
        else ally.clearMoveTarget();
      } else {
        ally.clearMoveTarget();
      }
    }

    if (ally instanceof Tank) ally.updateTank(delta);
    else ally.updateAircraft(delta);
  }

  private setAlliesStance(stance: import('../data/tanks').AllyStance) {
    for (const t of this.tanks.filter((x) => x.team === 'player' && x.alive && !x.isPlayerDriven)) {
      t.stance = stance;
      if (stance === 'hold') t.clearMoveTarget();
    }
    for (const a of this.aircraft.filter((x) => x.team === 'player' && x.alive && !x.isPlayerDriven)) {
      a.stance = stance;
      if (stance === 'hold') a.clearMoveTarget();
    }
  }

  private orderAlliesAttackMove(x: number, y: number) {
    this.setAlliesStance('attackMove');
    for (const t of this.tanks.filter((u) => u.team === 'player' && u.alive && !u.isPlayerDriven)) {
      t.setMoveTarget(x, y);
    }
    for (const a of this.aircraft.filter((u) => u.team === 'player' && u.alive && !u.isPlayerDriven)) {
      a.setMoveTarget(x, y);
    }
  }

  private resolveHits() {
    const active = this.projectiles.getChildren().filter((c) => (c as Projectile).active) as Projectile[];
    for (const shot of active) {
      let hit = false;

      for (const tank of this.tanks) {
        if (!tank.alive || tank.team === shot.team) continue;
        if (Phaser.Math.Distance.Between(shot.x, shot.y, tank.x, tank.y) > 30) continue;
        const killed = tank.takeDamage(shot.damage);
        shot.kill();
        this.sound.play(killed ? 'sfx-explode' : 'sfx-ricochet', { volume: killed ? 0.5 : 0.28 });
        if (killed) {
          this.spawnBoom(tank.x, tank.y);
          if (tank === this.myUnit) this.recoverControl();
        }
        hit = true;
        break;
      }
      if (hit) continue;

      for (const air of this.aircraft) {
        if (!air.alive || air.team === shot.team) continue;
        if (Phaser.Math.Distance.Between(shot.x, shot.y, air.x, air.y) > 28) continue;
        const killed = air.takeDamage(shot.damage);
        shot.kill();
        this.sound.play(killed ? 'sfx-explode' : 'sfx-ricochet', { volume: killed ? 0.5 : 0.25 });
        if (killed) {
          this.spawnBoom(air.x, air.y);
          if (air === this.myUnit) this.recoverControl();
        }
        hit = true;
        break;
      }
      if (hit) continue;

      for (const bld of this.buildings) {
        if (!bld.alive || bld.team === shot.team) continue;
        if (Phaser.Math.Distance.Between(shot.x, shot.y, bld.x, bld.y) > bld.spriteDisplayRadius()) continue;
        const destroyed = bld.takeDamage(shot.damage * 0.7);
        shot.kill();
        this.sound.play(destroyed ? 'sfx-explode' : 'sfx-ricochet', { volume: destroyed ? 0.55 : 0.25 });
        if (destroyed) this.spawnBoom(bld.x, bld.y);
        break;
      }
    }
  }

  private recoverControl() {
    this.myUnit = null;
    const next = this.controllableUnits()[0];
    if (next) this.takeControl(next);
  }

  private spawnBoom(x: number, y: number) {
    const boom = this.add.circle(x, y, 14, 0xffb060, 0.9).setDepth(30);
    this.tweens.add({
      targets: boom,
      alpha: 0,
      scale: 4,
      duration: 380,
      onComplete: () => boom.destroy(),
    });
  }

  private askLeave() {
    if (this.confirm.isOpen) return;
    this.confirm.show('Menyuga qaytasizmi?\nJang holati saqlanmaydi.', () => {
      this.mobile?.destroy();
      this.scene.start('MainMenu');
    });
  }

  update(_time: number, delta: number) {
    if (this.confirm.isOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.escKey) || this.mobile?.consumeMenu()) {
        this.confirm.hide();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey) || this.mobile?.consumeMenu()) {
      this.askLeave();
      return;
    }

    const buildList = this.playerFactory.def.produceList.filter((id) => !isAircraftId(id)) as TankId[];
    if (Phaser.Input.Keyboard.JustDown(this.cycleKey) || this.mobile?.consumeCycle()) this.cycleMyUnit();
    if (Phaser.Input.Keyboard.JustDown(this.key1) && buildList[0]) this.tryBuildAt(this.playerFactory, buildList[0]);
    if (Phaser.Input.Keyboard.JustDown(this.key2) && buildList[1]) this.tryBuildAt(this.playerFactory, buildList[1]);
    if (Phaser.Input.Keyboard.JustDown(this.key3)) this.tryBuildAt(this.playerAirbase, 'bf109');
    if (Phaser.Input.Keyboard.JustDown(this.key4)) this.tryBuildAt(this.playerHelipad, 'hellcat');
    if (this.mobile?.consumeBuild()) {
      this.buildMenu.show(this.playerFactory, this.playerCredits, (id) => this.tryBuildAt(this.playerFactory, id));
    }
    const mobileStance = this.mobile?.consumeStance();
    if (mobileStance) {
      this.setAlliesStance(mobileStance);
      this.showToast(
        mobileStance === 'auto'
          ? 'Ittifoqchilar: mustaqil AI'
          : mobileStance === 'follow'
            ? 'Ittifoqchilar: kuzatish'
            : 'Ittifoqchilar: joyida turadi',
      );
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
      this.setAlliesStance('follow');
      this.showToast('Ittifoqchilar: sizni kuzatadi (F)');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyH)) {
      this.setAlliesStance('hold');
      this.showToast('Ittifoqchilar: joyida turadi (H)');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyG)) {
      this.setAlliesStance('auto');
      this.showToast('Ittifoqchilar: mustaqil AI (G)');
    }

    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) this.toastText.setAlpha(0);
    }

    if (this.myUnit && !this.myUnit.alive) this.recoverControl();

    const pointer = this.input.activePointer;
    this.cameras.main.getWorldPoint(pointer.x, pointer.y, this.pointerWorld);

    const mine = this.myUnit;
    if (mine?.alive && !this.buildMenu.isOpen && !this.confirm.isOpen) {
      // Aim: mobile aims forward / at move target; PC aims at pointer
      if (this.session.platform === 'mobile') {
        if (mine instanceof Tank) {
          mine.setAim(
            mine.x + Math.cos(mine.bodyAngle) * 200,
            mine.y + Math.sin(mine.bodyAngle) * 200,
          );
        } else {
          mine.setAim(
            mine.x + Math.cos(mine.bodyAngle) * 200,
            mine.y + Math.sin(mine.bodyAngle) * 200,
          );
        }
      } else {
        mine.setAim(this.pointerWorld.x, this.pointerWorld.y);
      }

      const drive: DriveInput = { throttle: 0, steer: 0 };
      if (this.session.platform === 'mobile' && this.mobile) {
        drive.throttle = this.mobile.drive.throttle;
        drive.steer = this.mobile.drive.steer;
      } else {
        if (this.wasd.W.isDown || this.cursors.up?.isDown) drive.throttle += 1;
        if (this.wasd.S.isDown || this.cursors.down?.isDown) drive.throttle -= 1;
        if (this.wasd.A.isDown || this.cursors.left?.isDown) drive.steer -= 1;
        if (this.wasd.D.isDown || this.cursors.right?.isDown) drive.steer += 1;
      }

      if (mine instanceof Tank) mine.updateTank(delta, drive);
      else mine.updateAircraft(delta, drive);

      if (this.fireKey.isDown || this.mobile?.firing) this.tryFire(mine);
      this.cameras.main.startFollow(mine, true, 0.12, 0.12);
    } else if (this.playerFactory.alive) {
      this.cameras.main.startFollow(this.playerFactory, true, 0.05, 0.05);
    }

    this.updateEconomy(delta);
    this.updateProduction(delta);
    this.updateAi(delta);
    this.resolveHits();
    this.refreshHud();
  }

  private refreshHud() {
    const playersAlive =
      this.tanks.filter((t) => t.team === 'player' && t.alive).length +
      this.aircraft.filter((a) => a.team === 'player' && a.alive).length;
    const enemiesAlive =
      this.tanks.filter((t) => t.team === 'enemy' && t.alive).length +
      this.aircraft.filter((a) => a.team === 'enemy' && a.alive).length;

    const mine = this.myUnit?.alive ? this.myUnit : null;
    const line = mine
      ? `SIZNING TEXNIKANGIZ: ${mine.def.displayName}  HP ${Math.round(mine.hp)}/${mine.def.maxHp}`
      : 'Texnika yo‘q — zavod/aerodromdan chiqaring';

    const factoryBusy = this.playerFactory.queue
      ? `Zavod: ${unitName(this.playerFactory.queue.unitId)} ${Math.ceil(this.playerFactory.queue.remainingMs / 1000)}s`
      : 'Zavod: bo‘sh (bosing)';
    const airBusy = this.playerAirbase.queue
      ? `Aerodrom: ${unitName(this.playerAirbase.queue.unitId)} ${Math.ceil(this.playerAirbase.queue.remainingMs / 1000)}s`
      : 'Aerodrom: bo‘sh (bosing)';
    const heliBusy = this.playerHelipad.queue
      ? `Vert.baza: ${unitName(this.playerHelipad.queue.unitId)} ${Math.ceil(this.playerHelipad.queue.remainingMs / 1000)}s`
      : 'Vert.baza: bo‘sh (bosing)';

    const playerBase = this.buildings.some((b) => b.team === 'player' && b.alive);
    const enemyBase = this.buildings.some((b) => b.team === 'enemy' && b.alive);
    let state = 'Jang davom etmoqda';
    if (!enemyBase && enemiesAlive === 0) state = 'G‘ALABA';
    if (!playerBase && playersAlive === 0) state = 'MAG‘LUBIYAT';

    this.statusText.setText(
      [
        `Kredit: ${Math.floor(this.playerCredits)}`,
        line,
        factoryBusy,
        airBusy,
        heliBusy,
        `O‘yinchi: ${playersAlive}   Dushman: ${enemiesAlive}`,
        this.session.platform === 'mobile'
          ? 'Joystick · OT otish · B zavod · R almashtirish · ☰ menu'
          : '1–2 tank · 3 samolyot · 4 vertolyot · ESC menu',
        state,
      ].join('\n'),
    );
  }
}

function unitName(id: UnitId) {
  return isAircraftId(id) ? AIRCRAFT_DEFS[id].displayName : TANK_DEFS[id].displayName;
}
