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

/** PNG: 1 yoki 0.5 — blur beradigan ixtiyoriy scale yo‘q. */
function crispScale(texMax: number, maxEdge = 200): number {
  if (texMax <= maxEdge) return 1;
  if (texMax * 0.5 <= maxEdge * 1.1) return 0.5;
  return 0.25;
}

/**
 * Baza / kazarma / zavod — eski mod art.
 * Aerodrom / vertolyot — RW pad.
 */
export const BUILDING_DEFS: Record<BuildingKind, BuildingDef> = {
  hq: {
    kind: 'hq',
    displayName: 'Qo‘mondonlik',
    maxHp: 2000,
    texture: 'bld-hq-player',
    scale: crispScale(450, 220),
    spawnOffset: { x: 0, y: 55 },
    canProduce: false,
    produceList: [],
  },
  factory: {
    kind: 'factory',
    displayName: 'Tank zavodi',
    maxHp: 1400,
    texture: 'bld-factory-player',
    padTexture: 'bld-factory-pad',
    scale: crispScale(235, 180),
    spawnOffset: { x: 55, y: 35 },
    canProduce: true,
    produceList: ['m4', 'panther', 'tiger_b'] satisfies TankId[],
  },
  barracks: {
    kind: 'barracks',
    displayName: 'Kazarma',
    maxHp: 900,
    texture: 'bld-barracks-player',
    padTexture: 'bld-barracks-pad',
    scale: crispScale(172, 160),
    spawnOffset: { x: 40, y: 25 },
    canProduce: false,
    produceList: [],
  },
  enemyBase: {
    kind: 'enemyBase',
    displayName: 'Dushman zavodi',
    maxHp: 2400,
    texture: 'bld-factory-enemy',
    scale: crispScale(241, 180),
    spawnOffset: { x: -55, y: 35 },
    canProduce: true,
    produceList: ['t34', 'is2', 'kv1'] satisfies TankId[],
  },
  airbase: {
    kind: 'airbase',
    displayName: 'Samolyot maydoni',
    maxHp: 1100,
    texture: 'bld-rw-air-pad',
    scale: 1,
    spawnOffset: { x: 60, y: 8 },
    canProduce: true,
    produceList: ['bf109'] satisfies AircraftId[],
  },
  helipad: {
    kind: 'helipad',
    displayName: 'Vertolyot maydoni',
    maxHp: 1000,
    texture: 'bld-rw-heli-pad',
    scale: 1,
    spawnOffset: { x: 55, y: 15 },
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
