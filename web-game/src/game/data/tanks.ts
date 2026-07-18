/** Tank stats — barcha hull ~ bir xil ekran balandligi. */
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
  /** Native body texture size — runtime scale = TARGET_H / bodyH */
  bodyW: number;
  bodyH: number;
  bodyFacingOffset: number;
  layerMode: 'layered' | 'separate';
  barrelOriginY: number;
  barrelInset: number;
  buildCost: number;
  buildTimeMs: number;
}

/** Bir xil vizual balandlik (px) — avvalgi holat. */
export const TANK_TARGET_H = 72;

export function tankScale(texH: number): number {
  return TANK_TARGET_H / Math.max(1, texH);
}

const dv = {
  bodyW: 99,
  bodyH: 128,
  bodyFacingOffset: -Math.PI / 2,
  layerMode: 'layered' as const,
  barrelOriginY: 0.5,
  barrelInset: 0,
};

export const TANK_DEFS: Record<TankId, TankDef> = {
  tiger: {
    id: 'tiger',
    displayName: 'Tiger I',
    maxHp: 720,
    speed: 95,
    reverseSpeed: 55,
    turnSpeed: 1.6,
    turretTurnSpeed: 1.8,
    // CN 虎式重型坦克.ini [attack] maxAttackRange:420
    attackRange: 420,
    fireCooldownMs: 900,
    damage: 88,
    projectileSpeed: 520,
    bodyW: 114,
    bodyH: 364,
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
    maxHp: 380,
    speed: 125,
    reverseSpeed: 72,
    turnSpeed: 2.1,
    turretTurnSpeed: 2.3,
    // CN T34中型坦克.ini maxAttackRange:400
    attackRange: 400,
    fireCooldownMs: 650,
    damage: 52,
    projectileSpeed: 560,
    bodyW: 200,
    bodyH: 320,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.92,
    barrelInset: 14,
    buildCost: 220,
    buildTimeMs: 3800,
  },
  sherman: {
    id: 'sherman',
    displayName: 'Sherman',
    maxHp: 440,
    speed: 112,
    reverseSpeed: 66,
    turnSpeed: 1.85,
    turretTurnSpeed: 2.0,
    // CN 谢尔曼中型坦克.ini maxAttackRange:385
    attackRange: 385,
    fireCooldownMs: 720,
    damage: 58,
    projectileSpeed: 540,
    bodyW: 216,
    bodyH: 445,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.92,
    barrelInset: 14,
    buildCost: 260,
    buildTimeMs: 4200,
  },
  kv1: {
    id: 'kv1',
    displayName: 'KV-1',
    maxHp: 680,
    speed: 82,
    reverseSpeed: 48,
    turnSpeed: 1.35,
    turretTurnSpeed: 1.45,
    // CN KV1重型坦克.ini maxAttackRange:380
    attackRange: 380,
    fireCooldownMs: 880,
    damage: 78,
    projectileSpeed: 500,
    bodyW: 152,
    bodyH: 250,
    bodyFacingOffset: -Math.PI / 2,
    layerMode: 'separate',
    barrelOriginY: 0.92,
    barrelInset: 16,
    buildCost: 360,
    buildTimeMs: 5200,
  },
  tiger_b: {
    id: 'tiger_b',
    displayName: 'Tiger II',
    maxHp: 820,
    speed: 88,
    reverseSpeed: 48,
    turnSpeed: 1.45,
    turretTurnSpeed: 1.65,
    // DV Tiger Ausf B / Tiger.ini maxAttackRange:500
    attackRange: 500,
    fireCooldownMs: 980,
    damage: 100,
    projectileSpeed: 540,
    ...dv,
    buildCost: 520,
    buildTimeMs: 6800,
  },
  panther: {
    id: 'panther',
    displayName: 'Panther',
    maxHp: 560,
    speed: 118,
    reverseSpeed: 66,
    turnSpeed: 1.95,
    turretTurnSpeed: 2.15,
    // DV Panther.ini maxAttackRange:500
    attackRange: 500,
    fireCooldownMs: 780,
    damage: 74,
    projectileSpeed: 560,
    ...dv,
    buildCost: 360,
    buildTimeMs: 5200,
  },
  panzer4: {
    id: 'panzer4',
    displayName: 'Panzer IV',
    maxHp: 400,
    speed: 112,
    reverseSpeed: 66,
    turnSpeed: 1.95,
    turretTurnSpeed: 2.05,
    // DV panzer IV.ini maxAttackRange:500
    attackRange: 500,
    fireCooldownMs: 700,
    damage: 56,
    projectileSpeed: 540,
    ...dv,
    buildCost: 240,
    buildTimeMs: 4000,
  },
  is2: {
    id: 'is2',
    displayName: 'IS-2',
    maxHp: 760,
    speed: 86,
    reverseSpeed: 48,
    turnSpeed: 1.35,
    turretTurnSpeed: 1.55,
    // DV is2.ini maxAttackRange:500
    attackRange: 500,
    fireCooldownMs: 920,
    damage: 96,
    projectileSpeed: 520,
    ...dv,
    buildCost: 440,
    buildTimeMs: 6000,
  },
  pershing: {
    id: 'pershing',
    displayName: 'M26 Pershing',
    maxHp: 620,
    speed: 105,
    reverseSpeed: 60,
    turnSpeed: 1.7,
    turretTurnSpeed: 1.9,
    // DV pershing.ini maxAttackRange:500
    attackRange: 500,
    fireCooldownMs: 820,
    damage: 80,
    projectileSpeed: 550,
    ...dv,
    buildCost: 390,
    buildTimeMs: 5400,
  },
  m4: {
    id: 'm4',
    displayName: 'M4A3 (76)',
    maxHp: 450,
    speed: 120,
    reverseSpeed: 70,
    turnSpeed: 1.95,
    turretTurnSpeed: 2.15,
    // DV Sherman.ini (m4a3) maxAttackRange:500
    attackRange: 500,
    fireCooldownMs: 700,
    damage: 60,
    projectileSpeed: 560,
    ...dv,
    buildCost: 270,
    buildTimeMs: 4300,
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
