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
 * Baza / kazarma / zavod — eski mod art.
 * Faqat aerodrom va vertolyot maydoni — RW pad art.
 */
export const BUILDING_DEFS: Record<BuildingKind, BuildingDef> = {
  hq: {
    kind: 'hq',
    displayName: 'Qo‘mondonlik',
    maxHp: 2000,
    texture: 'bld-hq-player',
    scale: 0.85,
    spawnOffset: { x: 0, y: 70 },
    canProduce: false,
    produceList: [],
  },
  factory: {
    kind: 'factory',
    displayName: 'Tank zavodi',
    maxHp: 1400,
    texture: 'bld-factory-player',
    padTexture: 'bld-factory-pad',
    scale: 1.15,
    spawnOffset: { x: 70, y: 40 },
    canProduce: true,
    produceList: ['m4', 'panther', 'tiger_b'] satisfies TankId[],
  },
  barracks: {
    kind: 'barracks',
    displayName: 'Kazarma',
    maxHp: 900,
    texture: 'bld-barracks-player',
    padTexture: 'bld-barracks-pad',
    scale: 1.05,
    spawnOffset: { x: 50, y: 30 },
    canProduce: false,
    produceList: [],
  },
  enemyBase: {
    kind: 'enemyBase',
    displayName: 'Dushman zavodi',
    maxHp: 2400,
    texture: 'bld-factory-enemy',
    scale: 1.1,
    spawnOffset: { x: -70, y: 40 },
    canProduce: true,
    produceList: ['t34', 'is2', 'kv1'] satisfies TankId[],
  },
  airbase: {
    kind: 'airbase',
    displayName: 'Samolyot maydoni',
    maxHp: 1100,
    texture: 'bld-rw-air-pad',
    scale: 1.05,
    spawnOffset: { x: 80, y: 10 },
    canProduce: true,
    produceList: ['bf109'] satisfies AircraftId[],
  },
  helipad: {
    kind: 'helipad',
    displayName: 'Vertolyot maydoni',
    maxHp: 1000,
    texture: 'bld-rw-heli-pad',
    scale: 1.05,
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
