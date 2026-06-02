'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { getSessions } from '@/lib/storage';
import type { ReadingSession } from '@/types/reading';

type DayStamp = 'perfect' | 'good' | 'try' | 'rest' | 'future';

interface DayData {
  dateStr: string;
  day: number;
  weekday: number;
  stamp: DayStamp;
}

const STAMP_CONFIG: Record<DayStamp, { label: string; color: string; border: string; face: string; bg: string }> = {
  perfect: { label: 'カンペキ！',    color: '#2B7BC7', border: '#5BA8F0', face: '👑', bg: '#EBF4FF' },
  good:    { label: 'がんばったね！', color: '#3A9A4A', border: '#6FC87A', face: '😊', bg: '#E8F8EC' },
  try:     { label: 'がんばろう！',  color: '#D46A20', border: '#F0963A', face: '😄', bg: '#FFF0E2' },
  rest:    { label: 'おやすみ',      color: '#AAAAAA', border: '#CCCCCC', face: '😶', bg: '#F5F5F5' },
  future:  { label: '',              color: '#DDDDDD', border: '#EEEEEE', face: '',   bg: '#FAFAFA' },
};

function getStamp(sessions: ReadingSession[], dateStr: string, today: string): DayStamp {
  if (dateStr > today) return 'future';
  const daySessions = sessions.filter((s) => s.date === dateStr);
  if (daySessions.length === 0) return 'rest';
  const completed = daySessions.some((s) => s.completed);
  const maxProgress = Math.max(...daySessions.map((s) => s.progressRate));
  if (completed && maxProgress >= 0.95) return 'perfect';
  if (completed) return 'good';
  return 'try';
}

function buildCalendar(year: number, month: number, sessions: ReadingSession[], today: string): (DayData | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=日
  const lastDate = new Date(year, month, 0).getDate();
  const cells: (DayData | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr,
      day: d,
      weekday: (firstDay + d - 1) % 7,
      stamp: getStamp(sessions, dateStr, today),
    });
  }
  // 7の倍数になるまで null 埋め
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CardsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => { setSessions(getSessions()); }, []);

  const cells = buildCalendar(year, month, sessions, today);
  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // 今月の集計
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthSessions = sessions.filter((s) => s.date.startsWith(monthStr));
  const stampCounts = { perfect: 0, good: 0, try: 0 };
  const counted = new Set<string>();
  for (const s of monthSessions) {
    if (counted.has(s.date)) continue;
    counted.add(s.date);
    const stamp = getStamp(sessions, s.date, today);
    if (stamp in stampCounts) stampCounts[stamp as keyof typeof stampCounts]++;
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#FAF7F2]">
      <AppHeader
        title="音読カード"
        backHref="/"
        right={
          <Link href="/cards/detail" className="text-xs text-[#9A8070] font-medium px-1">
            くわしく
          </Link>
        }
      />

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
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center active:scale-95 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <p className="text-base font-bold text-[#4A3728]">{year}年 {month}月</p>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center active:scale-95 transition-all disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-[#FAF7F2]">
          {['日','月','火','水','木','金','土'].map((d, i) => (
            <div key={d} className="text-center py-2 text-xs font-bold"
              style={{ color: i === 0 ? '#E05A5A' : i === 6 ? '#5A7AE0' : '#9A8070' }}>
              {d}
            </div>
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
                return (
                  <div key={di} className="flex flex-col items-center py-1 gap-0.5">
                    {/* 日付 */}
                    <p className={`text-xs font-bold ${isToday ? 'text-white bg-[#6AAF5A] w-5 h-5 rounded-full flex items-center justify-center' : isSun ? 'text-[#E05A5A]' : isSat ? 'text-[#5A7AE0]' : 'text-[#4A3728]'}`}>
                      {cell.day}
                    </p>
                    {/* スタンプ */}
                    {cell.stamp !== 'future' ? (
                      <DayStampIcon stamp={cell.stamp} />
                    ) : (
                      <div className="w-9 h-9" />
                    )}
                    {/* ラベル */}
                    {cell.stamp !== 'future' && (
                      <p className="text-[8px] font-medium text-center leading-tight"
                        style={{ color: cfg.color }}>
                        {cfg.label}
                      </p>
                    )}
                  </div>
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
            { stamp: 'try' as DayStamp, count: stampCounts.try },
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
    </div>
  );
}

// ── スタンプアイコン ──
function DayStampIcon({ stamp, small = false }: { stamp: DayStamp; small?: boolean }) {
  const cfg = STAMP_CONFIG[stamp];
  const size = small ? 'w-9 h-9 text-base' : 'w-9 h-9 text-lg';

  if (stamp === 'rest') {
    return (
      <div className={`${size} rounded-full flex items-center justify-center flex-col border-2`}
        style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}>
        <span style={{ fontSize: small ? '14px' : '16px' }}>😶</span>
      </div>
    );
  }

  if (stamp === 'perfect') {
    return (
      <div className={`${size} rounded-full flex items-center justify-center border-[3px] relative`}
        style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}>
        <StampFacePerfect size={small ? 28 : 32} />
      </div>
    );
  }

  if (stamp === 'good') {
    return (
      <div className={`${size} rounded-full flex items-center justify-center border-[3px] relative`}
        style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}>
        <StampFaceGood size={small ? 28 : 32} />
      </div>
    );
  }

  if (stamp === 'try') {
    return (
      <div className={`${size} rounded-full flex items-center justify-center border-[3px] relative`}
        style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}>
        <StampFaceTry size={small ? 28 : 32} />
      </div>
    );
  }

  return <div className={`${size} rounded-full`} style={{ backgroundColor: cfg.bg }} />;
}

function StampFaceGood({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#C8F0CC" stroke="#5EBD6A" strokeWidth="2"/>
      <circle cx="11" cy="13" r="2" fill="#3A9A4A"/>
      <circle cx="21" cy="13" r="2" fill="#3A9A4A"/>
      <path d="M10 19 Q16 24 22 19" stroke="#3A9A4A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <text x="16" y="30" textAnchor="middle" fontSize="6" fill="#3A9A4A" fontWeight="bold">がんばったね</text>
    </svg>
  );
}

function StampFaceTry({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#FFE5C8" stroke="#E08030" strokeWidth="2"/>
      <circle cx="11" cy="13" r="2" fill="#D46A20"/>
      <circle cx="21" cy="13" r="2" fill="#D46A20"/>
      <path d="M10 20 Q16 24 22 20" stroke="#D46A20" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <text x="16" y="30" textAnchor="middle" fontSize="6" fill="#D46A20" fontWeight="bold">がんばろう</text>
    </svg>
  );
}

function StampFacePerfect({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#D0E8FF" stroke="#4A90D8" strokeWidth="2"/>
      {/* 王冠 */}
      <path d="M9 12 L12 8 L16 11 L20 8 L23 12 L22 15 H10 Z" fill="#F5C842" stroke="#D4A020" strokeWidth="0.8"/>
      <circle cx="11" cy="19" r="1.8" fill="#2B7BC7"/>
      <circle cx="21" cy="19" r="1.8" fill="#2B7BC7"/>
      <path d="M10 23 Q16 27 22 23" stroke="#2B7BC7" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
