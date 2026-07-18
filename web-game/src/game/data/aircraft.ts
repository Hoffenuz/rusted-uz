import type { TankTeam } from './tanks';

export type AircraftId = 'bf109' | 'hellcat' | 'stuka' | 'mig';
export type AircraftKind = 'plane' | 'heli';

export interface AircraftDef {
  id: AircraftId;
  kind: AircraftKind;
  displayName: string;
  maxHp: number;
  speed: number;
  turnSpeed: number;
  attackRange: number;
  fireCooldownMs: number;
  damage: number;
  projectileSpeed: number;
  scale: number;
  bodyFacingOffset: number;
  buildCost: number;
  buildTimeMs: number;
  altitude: number;
}

export const AIRCRAFT_DEFS: Record<AircraftId, AircraftDef> = {
  bf109: {
    id: 'bf109',
    kind: 'plane',
    displayName: 'Bf 109',
    maxHp: 220,
    speed: 210,
    turnSpeed: 2.4,
    attackRange: 360,
    fireCooldownMs: 280,
    damage: 22,
    projectileSpeed: 700,
    scale: 0.45,
    bodyFacingOffset: -Math.PI / 2,
    buildCost: 320,
    buildTimeMs: 5000,
    altitude: 28,
  },
  hellcat: {
    id: 'hellcat',
    kind: 'heli',
    displayName: 'Vertolyot',
    maxHp: 280,
    speed: 150,
    turnSpeed: 2.8,
    attackRange: 300,
    fireCooldownMs: 220,
    damage: 18,
    projectileSpeed: 650,
    scale: 0.32,
    bodyFacingOffset: -Math.PI / 2,
    buildCost: 360,
    buildTimeMs: 5500,
    altitude: 22,
  },
  stuka: {
    id: 'stuka',
    kind: 'plane',
    displayName: 'Stuka',
    maxHp: 200,
    speed: 180,
    turnSpeed: 2.0,
    attackRange: 340,
    fireCooldownMs: 900,
    damage: 70,
    projectileSpeed: 480,
    scale: 0.55,
    bodyFacingOffset: -Math.PI / 2,
    buildCost: 340,
    buildTimeMs: 5200,
    altitude: 30,
  },
  mig: {
    id: 'mig',
    kind: 'plane',
    displayName: 'MiG',
    maxHp: 240,
    speed: 220,
    turnSpeed: 2.5,
    attackRange: 370,
    fireCooldownMs: 260,
    damage: 24,
    projectileSpeed: 720,
    scale: 0.42,
    bodyFacingOffset: -Math.PI / 2,
    buildCost: 330,
    buildTimeMs: 5000,
    altitude: 28,
  },
};

export type UnitId = import('./tanks').TankId | AircraftId;

export function isAircraftId(id: string): id is AircraftId {
  return id in AIRCRAFT_DEFS;
}

export function aircraftAssetKey(id: AircraftId) {
  return `air-${id}`;
}

export const PLAYER_PLANE_QUEUE: AircraftId[] = ['bf109'];
export const PLAYER_HELI_QUEUE: AircraftId[] = ['hellcat'];
export const ENEMY_AIR_QUEUE: AircraftId[] = ['mig', 'stuka'];

export type { TankTeam };
