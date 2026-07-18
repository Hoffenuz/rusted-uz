import Phaser from 'phaser';
import { AIRCRAFT_DEFS, isAircraftId, type UnitId } from '../data/aircraft';
import { TANK_DEFS } from '../data/tanks';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { Building } from '../entities/Building';

export type BuildMenuSelect = (unitId: UnitId) => void;

function labelFor(unitId: UnitId): string {
  if (isAircraftId(unitId)) {
    const d = AIRCRAFT_DEFS[unitId];
    return `${d.displayName}  ·  $${d.buildCost}`;
  }
  const d = TANK_DEFS[unitId];
  return `${d.displayName}  ·  $${d.buildCost}`;
}

/** Screen-space production menu — RW panel chrome. */
export class BuildMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly buttons: Phaser.GameObjects.GameObject[] = [];
  private readonly panel: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private openBuilding: Building | null = null;
  private onSelect: BuildMenuSelect | null = null;

  constructor(private readonly scene: Phaser.Scene) {
    this.panel = scene.textures.exists('ui-panel-box')
      ? scene.add.image(0, 0, 'ui-panel-box').setDisplaySize(320, 220).setAlpha(0.95)
      : scene.add.rectangle(0, 0, 300, 200, 0x0c1410, 0.92).setStrokeStyle(1, 0xc4a35a, 0.8);

    const icon = scene.textures.exists('ui-icon-build')
      ? scene.add.image(-120, -78, 'ui-icon-build').setDisplaySize(22, 22)
      : scene.add.circle(-120, -78, 8, 0xc4a35a);

    this.title = scene.add
      .text(-100, -78, 'Ishlab chiqarish', {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        color: '#e8d7a8',
      })
      .setOrigin(0, 0.5);

    const close = scene.add
      .text(130, -78, '✕', {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        color: '#e8b2a4',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.hide());

    this.root = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2, [
      this.panel,
      icon,
      this.title,
      close,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(200);
    this.root.setVisible(false);
  }

  get isOpen() {
    return this.root.visible;
  }

  get building() {
    return this.openBuilding;
  }

  show(building: Building, credits: number, onSelect: BuildMenuSelect) {
    this.openBuilding = building;
    this.onSelect = onSelect;
    this.title.setText(building.def.displayName);

    for (const b of this.buttons) b.destroy();
    this.buttons.length = 0;

    const mobile =
      (this.scene.registry.get('session') as { platform?: string } | undefined)?.platform ===
      'mobile';
    const rowH = mobile ? 48 : 36;
    const list = building.def.produceList;
    const h = 100 + list.length * rowH;
    if (this.panel instanceof Phaser.GameObjects.Image) {
      this.panel.setDisplaySize(340, h);
    } else {
      this.panel.setSize(320, h);
    }

    list.forEach((unitId, i) => {
      const def = isAircraftId(unitId) ? AIRCRAFT_DEFS[unitId] : TANK_DEFS[unitId];
      const affordable = credits >= def.buildCost && !building.queue && building.alive;
      const btn = this.scene.add
        .text(0, -20 + i * rowH, labelFor(unitId), {
          fontFamily: 'Segoe UI',
          fontSize: mobile ? '17px' : '15px',
          color: affordable ? '#d7e6d4' : '#6a7368',
          backgroundColor: affordable ? '#1a2a20' : '#151915',
          padding: { x: 16, y: mobile ? 12 : 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: affordable });

      if (affordable) {
        btn.on('pointerover', () => btn.setColor('#ffe08a'));
        btn.on('pointerout', () => btn.setColor('#d7e6d4'));
        btn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          this.onSelect?.(unitId);
          this.hide();
        });
      }

      this.root.add(btn);
      this.buttons.push(btn);
    });

    const tip = this.scene.add
      .text(0, h / 2 - 28, `Kredit: $${Math.floor(credits)}`, {
        fontFamily: 'Segoe UI',
        fontSize: '13px',
        color: '#c4a35a',
      })
      .setOrigin(0.5);
    this.root.add(tip);
    this.buttons.push(tip);

    this.root.setPosition(GAME_WIDTH / 2, mobile ? GAME_HEIGHT / 2 - 40 : GAME_HEIGHT / 2);
    this.root.setVisible(true);
  }

  hide() {
    this.root.setVisible(false);
    this.openBuilding = null;
    this.onSelect = null;
    for (const b of this.buttons) b.destroy();
    this.buttons.length = 0;
  }
}
