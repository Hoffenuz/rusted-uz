import Phaser from 'phaser';
import { AIRCRAFT_DEFS, isAircraftId, type UnitId } from '../data/aircraft';
import { TANK_DEFS } from '../data/tanks';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { Building } from '../entities/Building';

export type ProducePick = (building: Building, unitId: UnitId) => void;

type Slot = {
  unitId: UnitId;
  building: Building;
  hit: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  cost: Phaser.GameObjects.Text;
};

/**
 * Pastki ishlab chiqarish — konteynersiz (Phaser container hit-test bugidan qochish).
 */
export class ProductionBar {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly slots: Slot[] = [];
  private onPick: ProducePick | null = null;
  readonly barTop: number;
  readonly barHeight: number;

  constructor(private readonly scene: Phaser.Scene) {
    const mobile =
      (scene.registry.get('session') as { platform?: string } | undefined)?.platform === 'mobile';
    this.barHeight = mobile ? 88 : 78;
    // Mobil: joystick (pastki ~200px) ustida
    this.barTop = mobile ? GAME_HEIGHT - 300 : GAME_HEIGHT - this.barHeight - 8;
    const cy = this.barTop + this.barHeight / 2;

    this.panel = scene.add
      .rectangle(GAME_WIDTH / 2, cy, GAME_WIDTH - 12, this.barHeight, 0x0a1210, 0.92)
      .setStrokeStyle(1, 0xc4a35a, 0.55)
      .setScrollFactor(0)
      .setDepth(500)
      .setInteractive(); // world click yutmasin

    this.panel.on('pointerdown', (p: Phaser.Input.Pointer) => p.event?.stopPropagation?.());
    this.panel.on('pointerup', (p: Phaser.Input.Pointer) => p.event?.stopPropagation?.());

    this.hint = scene.add
      .text(GAME_WIDTH / 2, this.barTop + 6, 'Ishlab chiqarish', {
        fontFamily: 'Segoe UI',
        fontSize: '11px',
        color: '#c4a35a',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(501);
  }

  containsScreen(_x: number, y: number) {
    return y >= this.barTop - 6 && y <= this.barTop + this.barHeight + 6;
  }

  setup(buildings: Building[], onPick: ProducePick) {
    this.onPick = onPick;
    for (const s of this.slots) {
      s.hit.destroy();
      s.label.destroy();
      s.cost.destroy();
    }
    this.slots.length = 0;

    const producers = buildings.filter((b) => b.team === 'player' && b.def.canProduce);
    const entries: { building: Building; unitId: UnitId }[] = [];
    for (const b of producers) {
      for (const id of b.def.produceList) entries.push({ building: b, unitId: id });
    }

    const mobile =
      (this.scene.registry.get('session') as { platform?: string } | undefined)?.platform ===
      'mobile';
    const slotW = mobile ? 108 : 118;
    const slotH = mobile ? 56 : 48;
    const gap = 8;
    const totalW = Math.max(0, entries.length * (slotW + gap) - gap);
    let x = GAME_WIDTH / 2 - totalW / 2 + slotW / 2;
    const y = this.barTop + this.barHeight / 2 + 8;

    for (const e of entries) {
      const def = isAircraftId(e.unitId) ? AIRCRAFT_DEFS[e.unitId] : TANK_DEFS[e.unitId];
      const hit = this.scene.add
        .rectangle(x, y, slotW, slotH, 0x1a2a20, 0.98)
        .setStrokeStyle(1, 0xc4a35a, 0.7)
        .setScrollFactor(0)
        .setDepth(510)
        .setInteractive({ useHandCursor: true });

      const label = this.scene.add
        .text(x, y - 10, def.displayName, {
          fontFamily: 'Segoe UI',
          fontSize: mobile ? '12px' : '11px',
          fontStyle: 'bold',
          color: '#d7e6d4',
          align: 'center',
          wordWrap: { width: slotW - 8 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(511);

      const cost = this.scene.add
        .text(x, y + 12, `$${def.buildCost}`, {
          fontFamily: 'Segoe UI',
          fontSize: '12px',
          color: '#c4a35a',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(511);

      hit.on('pointerdown', (p: Phaser.Input.Pointer) => {
        p.event?.stopPropagation?.();
        hit.setFillStyle(0x2a4030, 1);
      });
      hit.on('pointerup', (p: Phaser.Input.Pointer) => {
        p.event?.stopPropagation?.();
        hit.setFillStyle(0x1a2a20, 0.98);
        this.onPick?.(e.building, e.unitId);
      });
      hit.on('pointerout', () => hit.setFillStyle(0x1a2a20, 0.98));

      this.slots.push({ ...e, hit, label, cost });
      x += slotW + gap;
    }
  }

  refresh(credits: number) {
    for (const s of this.slots) {
      const def = isAircraftId(s.unitId) ? AIRCRAFT_DEFS[s.unitId] : TANK_DEFS[s.unitId];
      const ok =
        s.building.alive && !s.building.queue && credits >= def.buildCost && s.building.def.canProduce;
      s.hit.setFillStyle(ok ? 0x1a2a20 : 0x141814, 0.98);
      s.hit.setStrokeStyle(1, ok ? 0xc4a35a : 0x445544, ok ? 0.85 : 0.35);
      s.label.setColor(ok ? '#d7e6d4' : '#667066');
      const queue = s.building.queue;
      if (queue && queue.unitId === s.unitId) {
        s.cost.setText(`${Math.ceil(queue.remainingMs / 1000)}s…`);
        s.cost.setColor('#ffe08a');
      } else {
        s.cost.setText(`$${def.buildCost}`);
        s.cost.setColor(ok ? '#c4a35a' : '#556055');
      }
      // Doimo bosiladi — kredit yetmasa toast tryBuildAt da
      s.hit.setInteractive({ useHandCursor: true });
    }
  }

  setVisible(v: boolean) {
    this.panel.setVisible(v);
    this.hint.setVisible(v);
    for (const s of this.slots) {
      s.hit.setVisible(v);
      s.label.setVisible(v);
      s.cost.setVisible(v);
    }
  }
}
