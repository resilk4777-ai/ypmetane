'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import ReadingResultCard from '@/components/ReadingResultCard';
import StampSvg from '@/components/StampSvg';
import type { StampLevel } from '@/components/StampSvg';
import { getSessions, getReadingTexts, getSettings } from '@/lib/storage';
import type { ReadingSession, ReadingText } from '@/types/reading';

type DayStamp = 'perfect' | 'good' | 'try' | 'rest' | 'future';

interface DayData {
  dateStr: string;
  day: number;
  weekday: number;
  stamp: DayStamp;
}

const STAMP_CONFIG: Record<DayStamp, { label: string; color: string; border: string; bg: string }> = {
  perfect: { label: 'カンペキ！',    color: '#C84A4A', border: '#F0908A', bg: '#FFF0EE' },
  good:    { label: 'がんばったね！', color: '#3A9A4A', border: '#6FC87A', bg: '#E8F8EC' },
  try:     { label: 'がんばろう！',  color: '#C84A4A', border: '#E07070', bg: '#FFF0EE' },
  rest:    { label: 'おやすみ',      color: '#AAAAAA', border: '#CCCCCC', bg: '#F5F5F5' },
  future:  { label: '',              color: '#DDDDDD', border: '#EEEEEE', bg: '#FAFAFA' },
};

function getStamp(sessions: ReadingSession[], dateStr: string, today: string): DayStamp {
  if (dateStr > today) return 'future';
  const ds = sessions.filter((s) => s.date === dateStr);
  // 今日はまだ練習できるので、セッションがなくても「おやすみ」にしない
  if (ds.length === 0) return dateStr === today ? 'future' : 'rest';
  const maxProg = Math.max(...ds.map((s) => s.progressRate));
  if (maxProg >= 0.9) return 'perfect';
  if (maxProg >= 0.6) return 'good';
  return 'try';
}

function buildCalendar(year: number, month: number, sessions: ReadingSession[], today: string): (DayData | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const cells: (DayData | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ dateStr, day: d, weekday: (firstDay + d - 1) % 7, stamp: getStamp(sessions, dateStr, today) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CardsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [childName, setChildName] = useState('');
  // モーダル
  const [selectedSession, setSelectedSession] = useState<ReadingSession | null>(null);

  useEffect(() => {
    setSessions(getSessions());
    setTexts(getReadingTexts());
    const s = getSettings();
    setChildName(s.childName || '');
  }, []);

  function handleDayTap(dateStr: string) {
    const ds = sessions.filter((s) => s.date === dateStr);
    if (ds.length === 0) return;
    // 最も progress rate の高いセッションを表示
    const best = ds.reduce((a, b) => a.progressRate >= b.progressRate ? a : b);
    setSelectedSession(best);
  }

  const cells = buildCalendar(year, month, sessions, today);
  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const counted = new Set<string>();
  const stampCounts = { perfect: 0, good: 0, try: 0 };
  for (const s of sessions.filter((s) => s.date.startsWith(monthStr))) {
    if (counted.has(s.date)) continue;
    counted.add(s.date);
    const stamp = getStamp(sessions, s.date, today);
    if (stamp in stampCounts) stampCounts[stamp as keyof typeof stampCounts]++;
  }

  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#FAF7F2]">
      <AppHeader title="音読カード" backHref="/" right={
        <Link href="/cards/detail" className="text-xs text-[#9A8070] font-medium px-1">くわしく</Link>
      }/>

      {/* モチベーションバナー */}
      <div className="mx-4 mb-3">
        <div className="bg-white rounded-3xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <span className="text-3xl shrink-0">📖</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#4A3728]">つづけるって、すごいこと！</p>
            <p className="text-xs text-[#9A8070] mt-0.5">毎日の音読で、どんどん上手になっているよ！</p>
          </div>
          <div className="w-10 h-10 bg-[#D9EDDA] rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl">🌱</span>
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="mx-4 mb-4 bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* 月ナビ */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#FAF7F2]">
          <button onClick={() => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); }}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center active:scale-95 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <p className="text-base font-bold text-[#4A3728]">{year}年 {month}月</p>
          <button onClick={() => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); }}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center active:scale-95 transition-all disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        {/* 曜日 */}
        <div className="grid grid-cols-7 border-b border-[#FAF7F2]">
          {['日','月','火','水','木','金','土'].map((d, i) => (
            <div key={d} className="text-center py-2 text-xs font-bold"
              style={{ color: i === 0 ? '#E05A5A' : i === 6 ? '#5A7AE0' : '#9A8070' }}>{d}</div>
          ))}
        </div>
        {/* 日付グリッド */}
        <div className="px-1 py-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((cell, di) => {
                if (!cell) return <div key={di} className="aspect-square" />;
                const cfg = STAMP_CONFIG[cell.stamp];
                const isToday = cell.dateStr === today;
                const isSun = cell.weekday === 0;
                const isSat = cell.weekday === 6;
                const hasSession = cell.stamp !== 'rest' && cell.stamp !== 'future';
                return (
                  <button
                    key={di}
                    onClick={() => handleDayTap(cell.dateStr)}
                    disabled={!hasSession}
                    className="flex flex-col items-center py-1 gap-0.5 active:scale-95 transition-transform disabled:cursor-default"
                  >
                    <div className="h-5 flex items-center justify-center">
                      <p className={`text-xs font-bold leading-none ${isToday ? 'text-white bg-[#6AAF5A] w-5 h-5 rounded-full flex items-center justify-center' : isSun ? 'text-[#E05A5A]' : isSat ? 'text-[#5A7AE0]' : 'text-[#4A3728]'}`}>
                        {cell.day}
                      </p>
                    </div>
                    {cell.stamp === 'future' ? (
                      <div className="w-12 h-12" />
                    ) : cell.stamp === 'rest' ? (
                      <div className="flex flex-col items-center gap-0.5 opacity-40">
                        <DayStampIcon stamp="rest" />
                        <p className="text-[8px] text-gray-400">おやすみ</p>
                      </div>
                    ) : (
                      <DayStampIcon stamp={cell.stamp} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 今月の記録 */}
      <div className="mx-4 mb-4 bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <p className="text-sm font-bold text-[#4A3728]">今月の記録</p>
          </div>
          <Link href="/cards/detail" className="text-xs text-[#9A8070] hover:text-[#6AAF5A] transition-colors">
            くわしく見る ›
          </Link>
        </div>
        <div className="flex px-4 py-4 gap-3">
          {([
            { stamp: 'good' as DayStamp, count: stampCounts.good },
            { stamp: 'try'  as DayStamp, count: stampCounts.try },
            { stamp: 'perfect' as DayStamp, count: stampCounts.perfect },
          ]).map(({ stamp, count }) => {
            const cfg = STAMP_CONFIG[stamp];
            return (
              <div key={stamp} className="flex-1 flex items-center gap-2 bg-[#FAF7F2] rounded-2xl px-2 py-2">
                <DayStampIcon stamp={stamp} small />
                <div>
                  <p className="text-base font-black" style={{ color: cfg.color }}>
                    {count}<span className="text-xs">日</span>
                  </p>
                  <p className="text-[9px] text-[#9A8070] leading-tight">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* モーダル */}
      {selectedSession && (
        <ReadingResultCard
          session={selectedSession}
          text={texts.find((t) => t.id === selectedSession.readingTextId)}
          childName={childName}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}

// ── スタンプアイコン（StampSvg ラッパー） ──
function DayStampIcon({ stamp, small = false }: { stamp: DayStamp; small?: boolean }) {
  const size = stamp === 'rest' ? 32 : small ? 44 : 60;
  if (stamp === 'future') return <div style={{ width: size, height: size }} />;
  const level: StampLevel = stamp === 'rest' ? 'rest'
    : stamp === 'perfect' ? 'perfect'
    : stamp === 'good' ? 'good' : 'try';
  return (
    <div style={{ width: size, height: size }}>
      <StampSvg level={level} size={size} />
    </div>
  );
}
