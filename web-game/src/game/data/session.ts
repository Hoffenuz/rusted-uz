import type { FactionId } from './tanks';

export type PlatformMode = 'pc' | 'mobile';
export type BattleId = 'skirmish' | 'assault';

export interface SessionConfig {
  platform: PlatformMode;
  faction: FactionId;
  battle: BattleId;
}

export const DEFAULT_SESSION: SessionConfig = {
  platform: 'pc',
  faction: 'axis',
  battle: 'skirmish',
};

export const BATTLE_INFO: Record<BattleId, { title: string; desc: string }> = {
  skirmish: {
    title: 'Skirmish',
    desc: 'Oddiy jang — baza + zavodlar',
  },
  assault: {
    title: 'Hujum',
    desc: 'Kuchliroq dushman to‘lqini',
  },
};
