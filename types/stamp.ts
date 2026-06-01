export type StampType =
  | 'well_read'
  | 'completed'
  | 'clear_voice'
  | 'daily_challenge'
  | 'streak_3'
  | 'streak_7'
  | 'smooth_read';

export interface StampDefinition {
  type: StampType;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

export interface Stamp {
  id: string;
  type: StampType;
  name: string;
  description: string;
  acquiredAt: string;
}

export const STAMP_DEFINITIONS: StampDefinition[] = [
  {
    type: 'well_read',
    name: 'よく読めました',
    description: '一生懸命読んだよ',
    emoji: '⭐',
    color: '#F59E0B',
  },
  {
    type: 'completed',
    name: '最後まで読めました',
    description: '最後まで読みきったよ',
    emoji: '🎉',
    color: '#10B981',
  },
  {
    type: 'clear_voice',
    name: 'はきはき読めました',
    description: 'はっきりした声で読んだよ',
    emoji: '🔊',
    color: '#3B82F6',
  },
  {
    type: 'daily_challenge',
    name: '毎日チャレンジ',
    description: '今日も音読したよ',
    emoji: '📖',
    color: '#8B5CF6',
  },
  {
    type: 'streak_3',
    name: '3日連続',
    description: '3日続けて音読したよ',
    emoji: '🔥',
    color: '#EF4444',
  },
  {
    type: 'streak_7',
    name: '7日連続',
    description: '1週間毎日音読したよ',
    emoji: '🌟',
    color: '#F59E0B',
  },
  {
    type: 'smooth_read',
    name: 'すらすら読めました',
    description: 'スムーズに読めたよ',
    emoji: '✨',
    color: '#06B6D4',
  },
];
