import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

/** Simple yes/no overlay for menu / exit. */
export class ConfirmDialog {
  private readonly root: Phaser.GameObjects.Container;
  private readonly message: Phaser.GameObjects.Text;
  private onYes: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    const dim = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55)
      .setInteractive();
    const panel = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 440, 210, 0x121a16, 0.96)
      .setStrokeStyle(2, 0xc4a35a, 0.9);
    this.message = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '', {
        fontFamily: 'Segoe UI',
        fontSize: '18px',
        color: '#e8d7a8',
        align: 'center',
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5);

    const yes = scene.add
      .text(GAME_WIDTH / 2 - 90, GAME_HEIGHT / 2 + 50, 'Ha', {
        fontFamily: 'Segoe UI',
        fontSize: '18px',
        color: '#0c1210',
        backgroundColor: '#c4a35a',
        padding: { x: 28, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const no = scene.add
      .text(GAME_WIDTH / 2 + 90, GAME_HEIGHT / 2 + 50, 'Yo‘q', {
        fontFamily: 'Segoe UI',
        fontSize: '18px',
        color: '#d7e6d4',
        backgroundColor: '#2a3530',
        padding: { x: 28, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    yes.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      const cb = this.onYes;
      this.hide();
      cb?.();
    });
    no.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      this.hide();
    });
    dim.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event?.stopPropagation?.();
      this.hide();
    });

    this.root = scene.add.container(0, 0, [dim, panel, this.message, yes, no]);
    this.root.setScrollFactor(0).setDepth(400).setVisible(false);
  }

  get isOpen() {
    return this.root.visible;
  }

  show(text: string, onYes: () => void) {
    this.message.setText(text);
    this.onYes = onYes;
    this.root.setVisible(true);
  }

  hide() {
    this.root.setVisible(false);
    this.onYes = null;
  }
}
