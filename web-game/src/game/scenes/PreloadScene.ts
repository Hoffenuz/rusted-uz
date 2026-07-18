import Phaser from 'phaser';
import { assetKeys, TANK_DEFS, type TankId } from '../data/tanks';
import { AIRCRAFT_DEFS, aircraftAssetKey, type AircraftId } from '../data/aircraft';

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

    this.load.image('map', '/assets/maps/battlefield.png');
    // Optional menu backdrop (same map if loading.jpg absent)
    this.load.image('loading-art', '/assets/maps/battlefield.png');

    // Deux Vies HQ / town
    this.load.image('bld-dv-hq', '/assets/buildings/dv_hq_lg.png');
    this.load.image('bld-dv-town', '/assets/buildings/dv_town_lg.png');
    // Rusted Warfare vanilla buildings (cropped first frames, nearest-upscaled)
    this.load.image('bld-rw-hq', '/assets/buildings/rw_hq_lg.png');
    this.load.image('bld-rw-tank-factory', '/assets/buildings/rw_tank_factory_lg.png');
    this.load.image('bld-rw-exp-factory', '/assets/buildings/rw_exp_factory_lg.png');
    this.load.image('bld-rw-mech-factory', '/assets/buildings/rw_mech_factory_lg.png');
    this.load.image('bld-rw-air-pad', '/assets/buildings/rw_air_pad_lg.png');
    this.load.image('bld-rw-heli-pad', '/assets/buildings/rw_heli_pad_lg.png');
    this.load.image('bld-rw-repair', '/assets/buildings/rw_repair_bay_lg.png');
    // Mobile joystick pack
    this.load.image('ui-joy-base', '/assets/ui/joy_base.png');
    this.load.image('ui-joy-knob', '/assets/ui/joy_knob.png');
    this.load.image('ui-joy-knob-small', '/assets/ui/joy_knob_small.png');

    (Object.keys(TANK_DEFS) as TankId[]).forEach((id) => {
      const keys = assetKeys(id);
      this.load.image(keys.body, `/assets/tanks/${id}/body.png`);
      this.load.image(keys.turret, `/assets/tanks/${id}/turret.png`);
      this.load.image(keys.barrel, `/assets/tanks/${id}/barrel.png`);
      this.load.image(keys.wreck, `/assets/tanks/${id}/wreck.png`);
    });

    (Object.keys(AIRCRAFT_DEFS) as AircraftId[]).forEach((id) => {
      this.load.image(aircraftAssetKey(id), `/assets/aircraft/${id}.png`);
    });

    this.load.audio('sfx-cannon', '/assets/audio/cannon.ogg');
    this.load.audio('sfx-explode', '/assets/audio/explode.wav');
    this.load.audio('sfx-ricochet', '/assets/audio/ricochet.wav');
    this.load.audio('sfx-engine', '/assets/audio/engine.ogg');
    this.load.audio('sfx-select', '/assets/audio/select.wav');
  }

  create() {
    for (const key of this.textures.getTextureKeys()) {
      if (key === '__DEFAULT' || key === '__MISSING') continue;
      // Pixel RW art stays crisp
      const nearest =
        key.startsWith('bld-rw') || key.startsWith('bld-dv') || key.startsWith('ui-joy');
      this.textures
        .get(key)
        .setFilter(
          nearest ? Phaser.Textures.FilterMode.NEAREST : Phaser.Textures.FilterMode.LINEAR,
        );
    }
    this.scene.start('MainMenu');
  }
}
