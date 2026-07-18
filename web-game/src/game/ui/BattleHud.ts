import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';

/** RW-inspired credits + status chips. */
export class BattleHud {
  private readonly root: Phaser.GameObjects.Container;
  private readonly creditsText: Phaser.GameObjects.Text;
  private readonly armyText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly banner: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    const chipY = 28;
    const chipBg = scene.textures.exists('ui-panel-chip')
      ? scene.add.image(16, chipY, 'ui-panel-chip').setOrigin(0, 0.5).setDisplaySize(210, 44).setAlpha(0.92)
      : scene.add.rectangle(16, chipY, 210, 44, 0x0c1410, 0.85).setOrigin(0, 0.5).setStrokeStyle(1, 0xc4a35a, 0.5);

    const creditIcon = scene.textures.exists('ui-icon-credits')
      ? scene.add.image(36, chipY, 'ui-icon-credits').setOrigin(0.5).setDisplaySize(28, 28)
      : scene.add.circle(36, chipY, 10, 0xc4a35a);

    this.creditsText = scene.add
      .text(58, chipY, '0', {
        fontFamily: 'Segoe UI',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#e8d7a8',
      })
      .setOrigin(0, 0.5);

    const armyBg = scene.textures.exists('ui-panel-chip')
      ? scene.add
          .image(240, chipY, 'ui-panel-chip')
          .setOrigin(0, 0.5)
          .setDisplaySize(200, 44)
          .setAlpha(0.92)
      : scene.add.rectangle(240, chipY, 200, 44, 0x0c1410, 0.85).setOrigin(0, 0.5);

    this.armyText = scene.add
      .text(252, chipY, '', {
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        color: '#d7e6d4',
      })
      .setOrigin(0, 0.5);

    this.statusText = scene.add
      .text(GAME_WIDTH - 16, 16, '', {
        fontFamily: 'Segoe UI',
        fontSize: '13px',
        color: '#d7e6d4',
        align: 'right',
        backgroundColor: 'rgba(8,14,12,0.55)',
        padding: { x: 10, y: 8 },
      })
      .setOrigin(1, 0);

    this.banner = scene.add
      .text(GAME_WIDTH / 2, 120, '', {
        fontFamily: 'Segoe UI',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#e8d7a8',
        backgroundColor: 'rgba(8,14,12,0.75)',
        padding: { x: 28, y: 16 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.root = scene.add.container(0, 0, [
      chipBg,
      creditIcon,
      this.creditsText,
      armyBg,
      this.armyText,
      this.statusText,
      this.banner,
    ]);
    this.root.setScrollFactor(0).setDepth(120);
  }

  setCredits(n: number) {
    this.creditsText.setText(`$ ${Math.floor(n)}`);
  }

  setArmy(player: number, enemy: number) {
    this.armyText.setText(`Siz: ${player}   Dushman: ${enemy}`);
  }

  setStatus(lines: string[]) {
    this.statusText.setText(lines.join('\n'));
  }

  showBanner(text: string, win: boolean) {
    this.banner.setText(text);
    this.banner.setColor(win ? '#9be39b' : '#e8a090');
    this.banner.setAlpha(1);
    this.scene.tweens.add({
      targets: this.banner,
      scale: { from: 0.85, to: 1 },
      duration: 280,
      ease: 'Back.easeOut',
    });
  }
}
