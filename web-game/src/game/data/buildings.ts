import type { TankId, TankTeam, FactionId } from './tanks';
import type { AircraftId } from './aircraft';
import type { UnitId } from './aircraft';

export type BuildingKind = 'hq' | 'factory' | 'barracks' | 'enemyBase' | 'airbase' | 'helipad';

export interface BuildingDef {
  kind: BuildingKind;
  displayName: string;
  maxHp: number;
  texture: string;
  padTexture?: string;
  scale: number;
  spawnOffset: { x: number; y: number };
  canProduce: boolean;
  produceList: UnitId[];
}

/**
 * Buildings from real RW / Deux Vies art (not hand-drawn):
 * - HQ: Deux Vies hq.png
 * - Tank factory: RW experimental unit factory
 * - Depot: Deux Vies town.png
 * - Enemy factory: RW land factory
 * - Air / heli: RW air_factory / air_factory_t2 (first frame, upscaled)
 */
export const BUILDING_DEFS: Record<BuildingKind, BuildingDef> = {
  hq: {
    kind: 'hq',
    displayName: 'Qo‘mondonlik',
    maxHp: 2000,
    texture: 'bld-dv-hq',
    scale: 1.15,
    spawnOffset: { x: 0, y: 70 },
    canProduce: false,
    produceList: [],
  },
  factory: {
    kind: 'factory',
    displayName: 'Tank zavodi',
    maxHp: 1400,
    texture: 'bld-rw-exp-factory',
    scale: 1.05,
    spawnOffset: { x: 70, y: 50 },
    canProduce: true,
    produceList: ['m4', 'panther', 'tiger_b'] satisfies TankId[],
  },
  barracks: {
    kind: 'barracks',
    displayName: 'Ombor',
    maxHp: 900,
    texture: 'bld-dv-town',
    scale: 1.0,
    spawnOffset: { x: 50, y: 30 },
    canProduce: false,
    produceList: [],
  },
  enemyBase: {
    kind: 'enemyBase',
    displayName: 'Dushman zavodi',
    maxHp: 2400,
    texture: 'bld-rw-tank-factory',
    scale: 1.2,
    spawnOffset: { x: -70, y: 50 },
    canProduce: true,
    produceList: ['t34', 'is2', 'kv1'] satisfies TankId[],
  },
  airbase: {
    kind: 'airbase',
    displayName: 'Samolyot maydoni',
    maxHp: 1100,
    texture: 'bld-rw-air-pad',
    scale: 1.0,
    spawnOffset: { x: 80, y: 10 },
    canProduce: true,
    produceList: ['bf109'] satisfies AircraftId[],
  },
  helipad: {
    kind: 'helipad',
    displayName: 'Vertolyot maydoni',
    maxHp: 1000,
    texture: 'bld-rw-heli-pad',
    scale: 1.0,
    spawnOffset: { x: 70, y: 20 },
    canProduce: true,
    produceList: ['hellcat'] satisfies AircraftId[],
  },
};

export interface BuildingSpawn {
  kind: BuildingKind;
  team: TankTeam;
  x: number;
  y: number;
  textureOverride?: string;
  scaleOverride?: number;
  produceListOverride?: UnitId[];
}

export type { FactionId };
