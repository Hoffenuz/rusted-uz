import Phaser from 'phaser';
import { assetKeys, TANK_DEFS, type TankId } from '../data/tanks';
import { AIRCRAFT_DEFS, aircraftAssetKey, type AircraftId } from '../data/aircraft';
import { assetUrl } from '../assetUrl';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 420, 18, 0x1a2420).setStrokeStyle(1, 0xc4a35a);
    const bar = this.add.rectangle(width / 2 - 205, height / 2, 4, 12, 0xc4a35a).setOrigin(0, 0.5);
    const label = this.add
      .text(width / 2, height / 2 - 36, 'Resurslar yuklanmoqda…', {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        color: '#d7e6d4',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.width = Math.max(4, 410 * value);
      label.setText(`Yuklanmoqda… ${Math.round(value * 100)}%`);
    });

    this.load.image('map', assetUrl('assets/maps/battlefield.png'));
    this.load.image('loading-art', assetUrl('assets/maps/battlefield.png'));

    this.load.image('bld-hq-player', assetUrl('assets/buildings/hq_player.png'));
    this.load.image('bld-factory-player', assetUrl('assets/buildings/factory_player.png'));
    this.load.image('bld-factory-pad', assetUrl('assets/buildings/factory_pad.png'));
    this.load.image('bld-barracks-player', assetUrl('assets/buildings/barracks_player.png'));
    this.load.image('bld-barracks-pad', assetUrl('assets/buildings/barracks_pad.png'));
    this.load.image('bld-factory-enemy', assetUrl('assets/buildings/factory_enemy.png'));
    this.load.image('bld-base-enemy', assetUrl('assets/buildings/base_enemy.png'));
    this.load.image('bld-rw-air-pad', assetUrl('assets/buildings/rw_air_pad_lg.png'));
    this.load.image('bld-rw-heli-pad', assetUrl('assets/buildings/rw_heli_pad_lg.png'));

    // UI (RW)
    this.load.image('ui-joy-base', assetUrl('assets/ui/joy_base.png'));
    this.load.image('ui-joy-knob', assetUrl('assets/ui/joy_knob.png'));
    this.load.image('ui-joy-knob-small', assetUrl('assets/ui/joy_knob_small.png'));
    this.load.image('ui-title', assetUrl('assets/ui/title.png'));
    this.load.image('ui-panel-chip', assetUrl('assets/ui/panel_chip.png'));
    this.load.image('ui-panel-box', assetUrl('assets/ui/panel_box.png'));
    this.load.image('ui-panel-menu', assetUrl('assets/ui/panel_menu.png'));
    this.load.image('ui-icon-credits', assetUrl('assets/ui/icon_credits.png'));
    this.load.image('ui-icon-build', assetUrl('assets/ui/icon_build.png'));
    this.load.image('ui-btn-yes', assetUrl('assets/ui/btn_yes.png'));
    this.load.image('ui-btn-no', assetUrl('assets/ui/btn_no.png'));
    this.load.image('ui-touch', assetUrl('assets/ui/touch.png'));

    // FX (RW)
    this.load.image('fx-light', assetUrl('assets/fx/light.png'));
    this.load.image('fx-smoke-0', assetUrl('assets/fx/smoke_0.png'));
    for (let i = 0; i <= 10; i++) {
      this.load.image(`fx-explode-${i}`, assetUrl(`assets/fx/explode_${i}.png`));
    }
    for (let i = 0; i <= 3; i++) {
      this.load.image(`fx-muzzle-${i}`, assetUrl(`assets/fx/muzzle_${i}.png`));
    }
    for (let i = 0; i <= 2; i++) {
      this.load.image(`fx-dust-${i}`, assetUrl(`assets/fx/dust_${i}.png`));
    }

    (Object.keys(TANK_DEFS) as TankId[]).forEach((id) => {
      const keys = assetKeys(id);
      this.load.image(keys.body, assetUrl(`assets/tanks/${id}/body.png`));
      this.load.image(keys.turret, assetUrl(`assets/tanks/${id}/turret.png`));
      this.load.image(keys.barrel, assetUrl(`assets/tanks/${id}/barrel.png`));
      this.load.image(keys.wreck, assetUrl(`assets/tanks/${id}/wreck.png`));
    });

    (Object.keys(AIRCRAFT_DEFS) as AircraftId[]).forEach((id) => {
      this.load.image(aircraftAssetKey(id), assetUrl(`assets/aircraft/${id}.png`));
    });

    this.load.audio('sfx-cannon', assetUrl('assets/audio/cannon.ogg'));
    this.load.audio('sfx-explode', assetUrl('assets/audio/explode.wav'));
    this.load.audio('sfx-ricochet', assetUrl('assets/audio/ricochet.wav'));
    this.load.audio('sfx-engine', assetUrl('assets/audio/engine.ogg'));
    this.load.audio('sfx-select', assetUrl('assets/audio/select.wav'));
  }

  create() {
    // Unit/UI PNG — NEAREST (fayldagidek keskin). Faqat katta xarita LINEAR.
    for (const key of this.textures.getTextureKeys()) {
      if (key === '__DEFAULT' || key === '__MISSING') continue;
      const softMap = key === 'map' || key === 'loading-art';
      this.textures
        .get(key)
        .setFilter(
          softMap ? Phaser.Textures.FilterMode.LINEAR : Phaser.Textures.FilterMode.NEAREST,
        );
    }
    this.scene.start('MainMenu');
  }
}
