import Phaser from 'phaser';

/** RW-style muzzle / explode / dust / smoke helpers. */
export class Effects {
  constructor(private readonly scene: Phaser.Scene) {}

  muzzle(x: number, y: number, angle: number) {
    if (!this.scene.textures.exists('fx-muzzle-0')) {
      const c = this.scene.add.circle(x, y, 8, 0xffe6a8, 0.9).setDepth(40);
      this.scene.tweens.add({
        targets: c,
        alpha: 0,
        scale: 2.4,
        duration: 110,
        onComplete: () => c.destroy(),
      });
      return;
    }
    const img = this.scene.add
      .image(x, y, 'fx-muzzle-0')
      .setDepth(40)
      .setRotation(angle)
      .setScale(1.4);
    let frame = 0;
    this.scene.time.addEvent({
      delay: 40,
      repeat: 3,
      callback: () => {
        frame++;
        if (frame > 3) {
          img.destroy();
          return;
        }
        if (this.scene.textures.exists(`fx-muzzle-${frame}`)) img.setTexture(`fx-muzzle-${frame}`);
      },
    });
    if (this.scene.textures.exists('fx-light')) {
      const glow = this.scene.add.image(x, y, 'fx-light').setDepth(39).setAlpha(0.7).setScale(1.2);
      this.scene.tweens.add({
        targets: glow,
        alpha: 0,
        scale: 2,
        duration: 160,
        onComplete: () => glow.destroy(),
      });
    }
  }

  explode(x: number, y: number, big = true) {
    if (!this.scene.textures.exists('fx-explode-0')) {
      const boom = this.scene.add.circle(x, y, big ? 16 : 10, 0xffb060, 0.9).setDepth(40);
      this.scene.tweens.add({
        targets: boom,
        alpha: 0,
        scale: 4,
        duration: 380,
        onComplete: () => boom.destroy(),
      });
      return;
    }
    const img = this.scene.add.image(x, y, 'fx-explode-0').setDepth(40).setScale(big ? 1.8 : 1.2);
    let frame = 0;
    this.scene.time.addEvent({
      delay: 45,
      repeat: 10,
      callback: () => {
        frame++;
        if (frame > 10) {
          img.destroy();
          this.smoke(x, y);
          return;
        }
        if (this.scene.textures.exists(`fx-explode-${frame}`)) img.setTexture(`fx-explode-${frame}`);
      },
    });
  }

  smoke(x: number, y: number) {
    if (!this.scene.textures.exists('fx-smoke-0')) return;
    const s = this.scene.add.image(x, y - 4, 'fx-smoke-0').setDepth(35).setAlpha(0.75).setScale(1.3);
    this.scene.tweens.add({
      targets: s,
      y: y - 28,
      alpha: 0,
      scale: 2.2,
      duration: 900,
      onComplete: () => s.destroy(),
    });
  }

  dust(x: number, y: number) {
    if (!this.scene.textures.exists('fx-dust-0')) return;
    const d = this.scene.add
      .image(x + Phaser.Math.Between(-6, 6), y + 8, 'fx-dust-0')
      .setDepth(8)
      .setAlpha(0.55)
      .setScale(1.2);
    let frame = 0;
    this.scene.time.addEvent({
      delay: 50,
      repeat: 2,
      callback: () => {
        frame++;
        if (frame > 2) {
          d.destroy();
          return;
        }
        if (this.scene.textures.exists(`fx-dust-${frame}`)) d.setTexture(`fx-dust-${frame}`);
      },
    });
  }

  touch(screenX: number, screenY: number) {
    if (!this.scene.textures.exists('ui-touch')) return;
    const t = this.scene.add
      .image(screenX, screenY, 'ui-touch')
      .setScrollFactor(0)
      .setDepth(450)
      .setAlpha(0.85)
      .setScale(0.9);
    this.scene.tweens.add({
      targets: t,
      alpha: 0,
      scale: 1.6,
      duration: 280,
      onComplete: () => t.destroy(),
    });
  }
}
