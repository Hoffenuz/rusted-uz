import Phaser from 'phaser';
import type { DriveInput } from '../entities/Tank';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { AllyStance } from '../data/tanks';

/**
 * On-screen joystick + action buttons for mobile.
 * Uses /assets/ui joystick pack.
 */
export class MobileControls {
  private readonly root: Phaser.GameObjects.Container;
  private readonly base: Phaser.GameObjects.Image;
  private readonly knob: Phaser.GameObjects.Image;
  private readonly fireBtn: Phaser.GameObjects.Container;
  private readonly cycleBtn: Phaser.GameObjects.Container;
  private readonly buildBtn: Phaser.GameObjects.Container;
  private readonly stanceBtn: Phaser.GameObjects.Container;
  private readonly menuBtn: Phaser.GameObjects.Container;
  private readonly stanceLabel: Phaser.GameObjects.Text;

  private activePointerId: number | null = null;
  private readonly origin = new Phaser.Math.Vector2();
  private readonly maxRadius = 58;
  private readonly uiBottom = 220;

  drive: DriveInput = { throttle: 0, steer: 0 };
  firing = false;
  private cycleLatched = false;
  private buildLatched = false;
  private menuLatched = false;
  private stance: AllyStance = 'auto';
  private stanceChanged = false;

  constructor(private readonly scene: Phaser.Scene) {
    const y = GAME_HEIGHT - 120;
    this.base = scene.add.image(120, y, 'ui-joy-base').setDisplaySize(150, 150).setAlpha(0.82);
    this.knob = scene.add.image(120, y, 'ui-joy-knob').setDisplaySize(68, 68).setAlpha(0.95);
    this.origin.set(120, y);

    this.fireBtn = this.makeRoundButton(GAME_WIDTH - 105, y + 10, 0xc45c3a, 'OT', 38);
    this.cycleBtn = this.makeRoundButton(GAME_WIDTH - 105, y - 95, 0xc4a35a, 'R', 30);
    this.buildBtn = this.makeRoundButton(GAME_WIDTH - 200, y + 10, 0x4c8f6a, 'B', 30);
    this.stanceBtn = this.makeRoundButton(GAME_WIDTH - 200, y - 95, 0x5a7a9a, 'AI', 30);
    this.menuBtn = this.makeRoundButton(GAME_WIDTH - 52, 52, 0x2a3530, '☰', 26);

    this.stanceLabel = scene.add
      .text(GAME_WIDTH - 200, y - 140, 'AI: auto', {
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        color: '#c4a35a',
        backgroundColor: 'rgba(8,14,12,0.55)',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5);

    this.root = scene.add.container(0, 0, [
      this.base,
      this.knob,
      this.fireBtn,
      this.cycleBtn,
      this.buildBtn,
      this.stanceBtn,
      this.menuBtn,
      this.stanceLabel,
    ]);
    this.root.setScrollFactor(0).setDepth(300);

    // Wider invisible hit for stick
    this.base.setInteractive(new Phaser.Geom.Circle(0, 0, 78), Phaser.Geom.Circle.Contains);
    this.knob.setInteractive(new Phaser.Geom.Circle(0, 0, 42), Phaser.Geom.Circle.Contains);

    const startJoy = (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      this.activePointerId = p.id;
      this.updateKnob(p.x, p.y);
    };
    const moveJoy = (p: Phaser.Input.Pointer) => {
      if (this.activePointerId !== p.id) return;
      this.updateKnob(p.x, p.y);
    };
    const endJoy = (p: Phaser.Input.Pointer) => {
      if (this.activePointerId !== p.id) return;
      this.activePointerId = null;
      this.knob.setPosition(this.origin.x, this.origin.y);
      this.drive = { throttle: 0, steer: 0 };
    };

    this.base.on('pointerdown', startJoy);
    this.knob.on('pointerdown', startJoy);
    scene.input.on('pointermove', moveJoy);
    scene.input.on('pointerup', endJoy);
    scene.input.on('pointerupoutside', endJoy);

    this.bindHold(this.fireBtn, (v) => {
      this.firing = v;
    });
    this.bindTap(this.cycleBtn, () => {
      this.cycleLatched = true;
    });
    this.bindTap(this.buildBtn, () => {
      this.buildLatched = true;
    });
    this.bindTap(this.menuBtn, () => {
      this.menuLatched = true;
    });
    this.bindTap(this.stanceBtn, () => {
      this.stance =
        this.stance === 'auto' ? 'follow' : this.stance === 'follow' ? 'hold' : 'auto';
      this.stanceLabel.setText(
        this.stance === 'auto' ? 'AI: auto' : this.stance === 'follow' ? 'AI: ergash' : 'AI: tur',
      );
      this.stanceChanged = true;
    });
  }

  /** True if this screen point is over joystick / buttons (block world tap). */
  blocksWorldInput(x: number, y: number): boolean {
    if (y > GAME_HEIGHT - this.uiBottom) return true;
    // top-right menu
    if (x > GAME_WIDTH - 90 && y < 90) return true;
    return false;
  }

  private makeRoundButton(x: number, y: number, color: number, label: string, radius: number) {
    const bg = this.scene.add.circle(0, 0, radius, color, 0.88).setStrokeStyle(2, 0xffffff, 0.35);
    const text = this.scene.add
      .text(0, 0, label, {
        fontFamily: 'Segoe UI',
        fontSize: radius > 34 ? '17px' : '15px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const c = this.scene.add.container(x, y, [bg, text]);
    c.setSize(radius * 2, radius * 2);
    c.setInteractive(new Phaser.Geom.Circle(0, 0, radius + 4), Phaser.Geom.Circle.Contains);
    return c;
  }

  private bindHold(btn: Phaser.GameObjects.Container, cb: (down: boolean) => void) {
    btn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      cb(true);
    });
    btn.on('pointerup', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      cb(false);
    });
    btn.on('pointerout', () => cb(false));
    btn.on('pointerupoutside', () => cb(false));
  }

  private bindTap(btn: Phaser.GameObjects.Container, cb: () => void) {
    btn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      cb();
    });
  }

  private updateKnob(px: number, py: number) {
    const dx = px - this.origin.x;
    const dy = py - this.origin.y;
    const len = Math.hypot(dx, dy) || 1;
    const dead = 10;
    if (len < dead) {
      this.knob.setPosition(this.origin.x, this.origin.y);
      this.drive = { throttle: 0, steer: 0 };
      return;
    }
    const clamped = Math.min(len, this.maxRadius);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    this.knob.setPosition(this.origin.x + nx, this.origin.y + ny);
    this.drive = {
      throttle: Phaser.Math.Clamp(-ny / this.maxRadius, -1, 1),
      steer: Phaser.Math.Clamp(nx / this.maxRadius, -1, 1),
    };
  }

  consumeCycle() {
    const v = this.cycleLatched;
    this.cycleLatched = false;
    return v;
  }

  consumeBuild() {
    const v = this.buildLatched;
    this.buildLatched = false;
    return v;
  }

  consumeMenu() {
    const v = this.menuLatched;
    this.menuLatched = false;
    return v;
  }

  consumeStance(): AllyStance | null {
    if (!this.stanceChanged) return null;
    this.stanceChanged = false;
    return this.stance;
  }

  setVisible(v: boolean) {
    this.root.setVisible(v);
  }

  destroy() {
    this.root.destroy(true);
  }
}
