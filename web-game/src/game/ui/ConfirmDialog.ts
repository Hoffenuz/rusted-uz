import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

/**
 * Yes/No overlay.
 * Objects are NOT in a Container — interactive Zones work reliably on mobile.
 */
export class ConfirmDialog {
  private readonly parts: Phaser.GameObjects.GameObject[] = [];
  private readonly message: Phaser.GameObjects.Text;
  private readonly yesZone: Phaser.GameObjects.Zone;
  private readonly noZone: Phaser.GameObjects.Zone;
  private onYes: (() => void) | null = null;
  private busy = false;
  private visible = false;

  constructor(private readonly scene: Phaser.Scene) {
    const depth = 500;

    // Dim is NOT interactive — Ha/Yo‘q zones alone handle taps (mobile steal fix)
    const dim = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.62)
      .setScrollFactor(0)
      .setDepth(depth)
      .setVisible(false);

    const panel = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 460, 230, 0x121a16, 0.97)
      .setStrokeStyle(2, 0xc4a35a, 0.95)
      .setScrollFactor(0)
      .setDepth(depth + 1)
      .setVisible(false);

    this.message = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 48, '', {
        fontFamily: 'Segoe UI',
        fontSize: '18px',
        color: '#e8d7a8',
        align: 'center',
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 2)
      .setVisible(false);

    const yesBg = scene.add
      .rectangle(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 55, 132, 58, 0xc4a35a, 1)
      .setStrokeStyle(1, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(depth + 3)
      .setVisible(false);
    const yesLabel = scene.add
      .text(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 55, 'Ha', {
        fontFamily: 'Segoe UI',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#0c1210',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 4)
      .setVisible(false);

    const noBg = scene.add
      .rectangle(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 55, 132, 58, 0x2a3530, 1)
      .setStrokeStyle(1, 0xffffff, 0.25)
      .setScrollFactor(0)
      .setDepth(depth + 3)
      .setVisible(false);
    const noLabel = scene.add
      .text(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 55, 'Yo‘q', {
        fontFamily: 'Segoe UI',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#d7e6d4',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 4)
      .setVisible(false);

    this.yesZone = scene.add
      .zone(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 55, 150, 70)
      .setScrollFactor(0)
      .setDepth(depth + 5)
      .setVisible(false);
    this.yesZone.setInteractive({ useHandCursor: true });

    this.noZone = scene.add
      .zone(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 55, 150, 70)
      .setScrollFactor(0)
      .setDepth(depth + 5)
      .setVisible(false);
    this.noZone.setInteractive({ useHandCursor: true });

    this.yesZone.on('pointerup', () => this.accept());
    // Also accept on pointerdown for stubborn mobile browsers
    this.yesZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      this.accept();
    });
    this.noZone.on('pointerup', () => this.hide());
    this.noZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      this.hide();
    });

    this.parts.push(dim, panel, this.message, yesBg, yesLabel, noBg, noLabel, this.yesZone, this.noZone);
  }

  get isOpen() {
    return this.visible;
  }

  show(text: string, onYes: () => void) {
    this.busy = false;
    this.visible = true;
    this.onYes = onYes;
    this.message.setText(text);
    this.setShown(true);
    this.yesZone.setInteractive({ useHandCursor: true });
    this.noZone.setInteractive({ useHandCursor: true });
  }

  private accept() {
    if (this.busy || !this.visible) return;
    this.busy = true;
    const cb = this.onYes;
    this.onYes = null;
    this.setShown(false);
    this.yesZone.disableInteractive();
    this.noZone.disableInteractive();
    this.scene.time.delayedCall(30, () => {
      try {
        cb?.();
      } finally {
        this.busy = false;
      }
    });
  }

  hide() {
    if (this.busy) return;
    this.onYes = null;
    this.setShown(false);
    this.yesZone.disableInteractive();
    this.noZone.disableInteractive();
  }

  private setShown(v: boolean) {
    this.visible = v;
    for (const p of this.parts) {
      const obj = p as Phaser.GameObjects.GameObject & { setVisible?: (v: boolean) => void };
      obj.setVisible?.(v);
    }
  }
}
