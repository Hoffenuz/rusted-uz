import Phaser from 'phaser';
import type { DriveInput } from '../entities/Tank';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { AllyStance } from '../data/tanks';

/**
 * Mobil joystick — katta chap zona + sahnadagi (konteynersiz) hit area.
 * Harakat faqat joystick orqali.
 */
export class MobileControls {
  private readonly base: Phaser.GameObjects.Image;
  private readonly knob: Phaser.GameObjects.Image;
  private readonly joyZone: Phaser.GameObjects.Zone;
  private readonly fireBtn: Phaser.GameObjects.Container;
  private readonly cycleBtn: Phaser.GameObjects.Container;
  private readonly buildBtn: Phaser.GameObjects.Container;
  private readonly stanceBtn: Phaser.GameObjects.Container;
  private readonly menuBtn: Phaser.GameObjects.Container;
  private readonly stanceLabel: Phaser.GameObjects.Text;

  private activePointerId: number | null = null;
  private readonly home = new Phaser.Math.Vector2(128, GAME_HEIGHT - 108);
  private readonly origin = new Phaser.Math.Vector2();
  private readonly maxRadius = 64;

  drive: DriveInput = { throttle: 0, steer: 0 };
  firing = false;
  /** Joystick hozir ushlanmoqdami */
  get steering() {
    return this.activePointerId !== null;
  }

  private cycleLatched = false;
  private buildLatched = false;
  private menuLatched = false;
  private stance: AllyStance = 'auto';
  private stanceChanged = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.origin.copy(this.home);

    this.base = scene.add
      .image(this.home.x, this.home.y, 'ui-joy-base')
      .setDisplaySize(160, 160)
      .setAlpha(0.78)
      .setScrollFactor(0)
      .setDepth(450);

    this.knob = scene.add
      .image(this.home.x, this.home.y, 'ui-joy-knob')
      .setDisplaySize(72, 72)
      .setAlpha(0.95)
      .setScrollFactor(0)
      .setDepth(451);

    // Faqat pastki chap — production bar (yuqoriroq) ni yopmasin
    this.joyZone = scene.add.zone(140, GAME_HEIGHT - 100, 280, 200);
    this.joyZone.setScrollFactor(0).setDepth(448);
    this.joyZone.setInteractive(
      new Phaser.Geom.Rectangle(-140, -100, 280, 200),
      Phaser.Geom.Rectangle.Contains,
    );

    const startJoy = (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      this.activePointerId = p.id;
      // Dinamik markaz: barmoq bosgan joy
      this.origin.set(
        Phaser.Math.Clamp(p.x, 64, 240),
        Phaser.Math.Clamp(p.y, GAME_HEIGHT - 190, GAME_HEIGHT - 40),
      );
      this.base.setPosition(this.origin.x, this.origin.y);
      this.knob.setPosition(this.origin.x, this.origin.y);
      this.updateKnob(p.x, p.y);
    };
    const moveJoy = (p: Phaser.Input.Pointer) => {
      if (this.activePointerId !== p.id) return;
      this.updateKnob(p.x, p.y);
    };
    const endJoy = (p: Phaser.Input.Pointer) => {
      if (this.activePointerId !== p.id) return;
      this.activePointerId = null;
      this.origin.copy(this.home);
      this.base.setPosition(this.home.x, this.home.y);
      this.knob.setPosition(this.home.x, this.home.y);
      this.drive = { throttle: 0, steer: 0 };
    };

    this.joyZone.on('pointerdown', startJoy);
    this.base.setInteractive(new Phaser.Geom.Circle(0, 0, 80), Phaser.Geom.Circle.Contains);
    this.knob.setInteractive(new Phaser.Geom.Circle(0, 0, 44), Phaser.Geom.Circle.Contains);
    this.base.on('pointerdown', startJoy);
    this.knob.on('pointerdown', startJoy);

    scene.input.on('pointermove', moveJoy);
    scene.input.on('pointerup', endJoy);
    scene.input.on('pointerupoutside', endJoy);

    const by = GAME_HEIGHT - 118;
    this.fireBtn = this.makeRoundButton(GAME_WIDTH - 100, by + 8, 0xc45c3a, 'OT', 40);
    this.cycleBtn = this.makeRoundButton(GAME_WIDTH - 100, by - 100, 0xc4a35a, 'R', 30);
    this.buildBtn = this.makeRoundButton(GAME_WIDTH - 198, by + 8, 0x4c8f6a, 'B', 30);
    this.stanceBtn = this.makeRoundButton(GAME_WIDTH - 198, by - 100, 0x5a7a9a, 'AI', 30);
    this.menuBtn = this.makeRoundButton(GAME_WIDTH - 52, 52, 0x2a3530, '☰', 26);

    this.stanceLabel = scene.add
      .text(GAME_WIDTH - 198, by - 145, 'AI: auto', {
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        color: '#c4a35a',
        backgroundColor: 'rgba(8,14,12,0.55)',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(452);

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

  /** World tapni bloklash — joystick / tugmalar / pastki UI. */
  blocksWorldInput(x: number, y: number): boolean {
    // Chap past — joystick
    if (x < 290 && y > GAME_HEIGHT - 210) return true;
    // O‘ng past — OT / R / B / AI
    if (x > GAME_WIDTH - 250 && y > GAME_HEIGHT - 260) return true;
    // Yuqori o‘ng menu
    if (x > GAME_WIDTH - 90 && y < 90) return true;
    return false;
  }

  private makeRoundButton(x: number, y: number, color: number, label: string, radius: number) {
    const bg = this.scene.add.circle(0, 0, radius, color, 0.9).setStrokeStyle(2, 0xffffff, 0.35);
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
    c.setScrollFactor(0);
    c.setDepth(452);
    c.setInteractive(new Phaser.Geom.Circle(0, 0, radius + 6), Phaser.Geom.Circle.Contains);
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
    if (len < 12) {
      this.knob.setPosition(this.origin.x, this.origin.y);
      this.drive = { throttle: 0, steer: 0 };
      return;
    }
    const clamped = Math.min(len, this.maxRadius);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    this.knob.setPosition(this.origin.x + nx, this.origin.y + ny);
    // Yuqori = oldinga (throttle +), o‘ng = o‘ngga burilish
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
    this.base.setVisible(v);
    this.knob.setVisible(v);
    this.joyZone.setVisible(v);
    this.fireBtn.setVisible(v);
    this.cycleBtn.setVisible(v);
    this.buildBtn.setVisible(v);
    this.stanceBtn.setVisible(v);
    this.menuBtn.setVisible(v);
    this.stanceLabel.setVisible(v);
  }

  destroy() {
    this.base.destroy();
    this.knob.destroy();
    this.joyZone.destroy();
    this.fireBtn.destroy(true);
    this.cycleBtn.destroy(true);
    this.buildBtn.destroy(true);
    this.stanceBtn.destroy(true);
    this.menuBtn.destroy(true);
    this.stanceLabel.destroy();
  }
}
