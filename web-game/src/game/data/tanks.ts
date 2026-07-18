/** Tank stats — display sizes normalized (~96px tall on screen). */
export type TankId =
  | 'tiger'
  | 't34'
  | 'sherman'
  | 'kv1'
  | 'tiger_b'
  | 'panther'
  | 'panzer4'
  | 'is2'
  | 'pershing'
  | 'm4';

export type TankTeam = 'player' | 'enemy';
export type AllyStance = 'auto' | 'hold' | 'follow' | 'attackMove';
export type FactionId = 'axis' | 'allies';

export interface TankDef {
  id: TankId;
  displayName: string;
  maxHp: number;
  speed: number;
  reverseSpeed: number;
  turnSpeed: number;
  turretTurnSpeed: number;
  attackRange: number;
  fireCooldownMs: number;
  damage: number;
  projectileSpeed: number;
  scale: number;
  bodyFacingOffset: number;
  layerMode: 'layered' | 'separate';
  barrelOriginY: number;
  barrelInset: number;
  buildCost: number;
  buildTimeMs: number;
}

/**
 * Target longest body edge on screen (px).
 * ~118 keeps Deux Vies 128px hulls near 1:1 (kamroq blur).
 */
const TARGET_SIZE = 118;
const scaleFromMax = (w: number, h: number) => TARGET_SIZE / Math.max(w, h);

/** Deux Vies: hull + turret (gun baked in). Do NOT stack barrel — duplicate art. */
const dv = {
  bodyFacingOffset: -Math.PI / 2,
  layerMode: 'layered' as const,
  barrelOriginY: 0.5,
  barrelInset: 0,
  scale: scaleFromMax(99, 128),
};

export const TANK_DEFS: Record<TankId, TankDef> = {
  tiger: {
    id: 'tiger',
    displayName: 'Tiger I',
    maxHp: 700,
    speed: 95,
    reverseSpeed: 55,
    turnSpeed: 1.6,
    turretTurnSpeed: 1.8,
    attackRange: 420,
    fireCooldownMs: 900,
    damage: 85,
    projectileSpeed: 520,
    scale: scaleFromMax(114, 364) * 0.92,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.94,
    barrelInset: 18,
    buildCost: 450,
    buildTimeMs: 6000,
  },
  t34: {
    id: 't34',
    displayName: 'T-34',
    maxHp: 420,
    speed: 120,
    reverseSpeed: 70,
    turnSpeed: 2.0,
    turretTurnSpeed: 2.2,
    attackRange: 380,
    fireCooldownMs: 700,
    damage: 55,
    projectileSpeed: 560,
    // Chinese art visually bulkier — slightly smaller than DV hulls
    scale: scaleFromMax(200, 320) * 0.82,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.92,
    barrelInset: 14,
    buildCost: 250,
    buildTimeMs: 4000,
  },
  sherman: {
    id: 'sherman',
    displayName: 'Sherman',
    maxHp: 480,
    speed: 110,
    reverseSpeed: 65,
    turnSpeed: 1.8,
    turretTurnSpeed: 2.0,
    attackRange: 390,
    fireCooldownMs: 750,
    damage: 60,
    projectileSpeed: 540,
    scale: scaleFromMax(216, 445) * 0.88,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.92,
    barrelInset: 14,
    buildCost: 280,
    buildTimeMs: 4500,
  },
  kv1: {
    id: 'kv1',
    displayName: 'KV-1',
    maxHp: 620,
    speed: 85,
    reverseSpeed: 50,
    turnSpeed: 1.4,
    turretTurnSpeed: 1.5,
    attackRange: 400,
    fireCooldownMs: 850,
    damage: 75,
    projectileSpeed: 500,
    scale: scaleFromMax(152, 250) * 0.8,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.92,
    barrelInset: 16,
    buildCost: 380,
    buildTimeMs: 5500,
  },
  tiger_b: {
    id: 'tiger_b',
    displayName: 'Tiger II',
    maxHp: 780,
    speed: 90,
    reverseSpeed: 50,
    turnSpeed: 1.5,
    turretTurnSpeed: 1.7,
    attackRange: 440,
    fireCooldownMs: 950,
    damage: 95,
    projectileSpeed: 540,
    ...dv,
    buildCost: 500,
    buildTimeMs: 6500,
  },
  panther: {
    id: 'panther',
    displayName: 'Panther',
    maxHp: 560,
    speed: 115,
    reverseSpeed: 65,
    turnSpeed: 1.9,
    turretTurnSpeed: 2.1,
    attackRange: 410,
    fireCooldownMs: 800,
    damage: 72,
    projectileSpeed: 560,
    ...dv,
    buildCost: 360,
    buildTimeMs: 5200,
  },
  panzer4: {
    id: 'panzer4',
    displayName: 'Panzer IV',
    maxHp: 400,
    speed: 110,
    reverseSpeed: 65,
    turnSpeed: 1.9,
    turretTurnSpeed: 2.0,
    attackRange: 380,
    fireCooldownMs: 750,
    damage: 58,
    projectileSpeed: 540,
    ...dv,
    buildCost: 260,
    buildTimeMs: 4200,
  },
  is2: {
    id: 'is2',
    displayName: 'IS-2',
    maxHp: 720,
    speed: 88,
    reverseSpeed: 50,
    turnSpeed: 1.4,
    turretTurnSpeed: 1.6,
    attackRange: 430,
    fireCooldownMs: 900,
    damage: 90,
    projectileSpeed: 520,
    ...dv,
    buildCost: 420,
    buildTimeMs: 5800,
  },
  pershing: {
    id: 'pershing',
    displayName: 'M26 Pershing',
    maxHp: 600,
    speed: 105,
    reverseSpeed: 60,
    turnSpeed: 1.7,
    turretTurnSpeed: 1.9,
    attackRange: 400,
    fireCooldownMs: 820,
    damage: 78,
    projectileSpeed: 550,
    ...dv,
    buildCost: 390,
    buildTimeMs: 5400,
  },
  m4: {
    id: 'm4',
    displayName: 'M4A3 (76)',
    maxHp: 460,
    speed: 118,
    reverseSpeed: 68,
    turnSpeed: 1.9,
    turretTurnSpeed: 2.1,
    attackRange: 385,
    fireCooldownMs: 720,
    damage: 62,
    projectileSpeed: 560,
    ...dv,
    buildCost: 290,
    buildTimeMs: 4500,
  },
};

export function assetKeys(id: TankId) {
  return {
    body: `tank-${id}-body`,
    turret: `tank-${id}-turret`,
    barrel: `tank-${id}-barrel`,
    wreck: `tank-${id}-wreck`,
  };
}

export const AXIS_BUILD: TankId[] = ['panzer4', 'panther', 'tiger_b'];
export const ALLIES_BUILD: TankId[] = ['m4', 'pershing', 'sherman'];
export const SOVIET_BUILD: TankId[] = ['t34', 'kv1', 'is2'];

export const PLAYER_BUILD_QUEUE: TankId[] = AXIS_BUILD;
export const ENEMY_BUILD_QUEUE: TankId[] = SOVIET_BUILD;
