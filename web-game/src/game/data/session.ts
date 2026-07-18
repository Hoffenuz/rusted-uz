import type { FactionId } from './tanks';

export type PlatformMode = 'pc' | 'mobile';
export type BattleId = 'skirmish' | 'assault';
export type DifficultyId = 'easy' | 'normal' | 'hard';

export interface SessionConfig {
  platform: PlatformMode;
  faction: FactionId;
  battle: BattleId;
  difficulty: DifficultyId;
}

export const DEFAULT_SESSION: SessionConfig = {
  platform: 'pc',
  faction: 'axis',
  battle: 'skirmish',
  difficulty: 'normal',
};

export const BATTLE_INFO: Record<BattleId, { title: string; desc: string }> = {
  skirmish: {
    title: 'Skirmish',
    desc: 'Oddiy jang — baza + zavodlar',
  },
  assault: {
    title: 'Hujum',
    desc: 'Ko‘proq dushman starti',
  },
};

export const DIFFICULTY_INFO: Record<
  DifficultyId,
  {
    title: string;
    desc: string;
    enemyCreditMult: number;
    enemyDamageMult: number;
    enemyBuildMsMult: number;
    enemyStartExtra: number;
    playerCreditMult: number;
  }
> = {
  easy: {
    title: 'Oson',
    desc: 'Sekinroq dushman, ko‘proq kredit',
    enemyCreditMult: 0.65,
    enemyDamageMult: 0.85,
    enemyBuildMsMult: 1.4,
    enemyStartExtra: 0,
    playerCreditMult: 1.25,
  },
  normal: {
    title: 'Oddiy',
    desc: 'Muvozanatli jang',
    enemyCreditMult: 1,
    enemyDamageMult: 1.15,
    enemyBuildMsMult: 1,
    enemyStartExtra: 0,
    playerCreditMult: 1,
  },
  hard: {
    title: 'Qiyin',
    desc: 'Tez ishlab chiqarish + kuchli otish',
    enemyCreditMult: 1.45,
    enemyDamageMult: 1.35,
    enemyBuildMsMult: 0.7,
    enemyStartExtra: 2,
    playerCreditMult: 0.9,
  },
};
