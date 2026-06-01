import type { ReadingText, ReadingSession } from '@/types/reading';
import type { Stamp } from '@/types/stamp';
import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const KEYS = {
  READINGS: 'yometane_readings',
  SESSIONS: 'yometane_sessions',
  STAMPS: 'yometane_stamps',
  SETTINGS: 'yometane_settings',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// ReadingText
export function getReadingTexts(): ReadingText[] {
  const raw = safeGet<ReadingText[]>(KEYS.READINGS, []);
  // 旧データ互換: sourceType が未定義の場合は 'manual' にフォールバック
  return raw.map((r) => ({ ...r, sourceType: r.sourceType ?? 'manual' }));
}

export function getReadingTextById(id: string): ReadingText | undefined {
  return getReadingTexts().find((r) => r.id === id);
}

export function saveReadingText(text: ReadingText): void {
  const list = getReadingTexts().filter((r) => r.id !== text.id);
  list.unshift(text);
  safeSet(KEYS.READINGS, list);
}

export function deleteReadingText(id: string): void {
  safeSet(KEYS.READINGS, getReadingTexts().filter((r) => r.id !== id));
}

// ReadingSession
export function getSessions(): ReadingSession[] {
  return safeGet<ReadingSession[]>(KEYS.SESSIONS, []);
}

export function getSessionsByDate(date: string): ReadingSession[] {
  return getSessions().filter((s) => s.date === date);
}

export function getSessionsByTextId(textId: string): ReadingSession[] {
  return getSessions().filter((s) => s.readingTextId === textId);
}

export function saveSession(session: ReadingSession): void {
  const list = getSessions().filter((s) => s.id !== session.id);
  list.unshift(session);
  safeSet(KEYS.SESSIONS, list);
}

export function updateSessionComment(
  sessionId: string,
  field: 'parentComment' | 'teacherComment',
  comment: string
): void {
  const list = getSessions().map((s) =>
    s.id === sessionId ? { ...s, [field]: comment } : s
  );
  safeSet(KEYS.SESSIONS, list);
}

// Stamps
export function getStamps(): Stamp[] {
  return safeGet<Stamp[]>(KEYS.STAMPS, []);
}

export function saveStamp(stamp: Stamp): void {
  const list = getStamps();
  list.push(stamp);
  safeSet(KEYS.STAMPS, list);
}

// Settings
export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...safeGet<Partial<Settings>>(KEYS.SETTINGS, {}) };
}

export function saveSettings(settings: Settings): void {
  safeSet(KEYS.SETTINGS, settings);
}

// Streak
export function getStreak(): number {
  const sessions = getSessions().filter((s) => s.completed);
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);

  let streak = 0;
  let current = new Date(today);

  for (const date of dates) {
    const d = current.toISOString().slice(0, 10);
    if (date === d) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Reset
export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
