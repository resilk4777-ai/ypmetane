'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReadingTexts, getSessions, getStreak, getStamps } from '@/lib/storage';
import { todayString } from '@/lib/date';
import type { ReadingSession } from '@/types/reading';

export default function HomePage() {
  const [todaySessions, setTodaySessions] = useState<ReadingSession[]>([]);
  const [streak, setStreak] = useState(0);
  const [hasTexts, setHasTexts] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [stampCount, setStampCount] = useState(0);

  useEffect(() => {
    const today = todayString();
    const all = getSessions();
    setTodaySessions(all.filter((s) => s.date === today));
    setStreak(getStreak());
    setHasTexts(getReadingTexts().length > 0);
    setTotalSessions(all.length);
    setStamps();
  }, []);

  function setStamps() {
    const stamps = getStamps();
    const unique = new Set(stamps.map((s) => s.type));
    setStampCount(unique.size);
  }

  const todayCompleted = todaySessions.some((s) => s.completed);
  const todayProgress = todaySessions.length > 0
    ? Math.round(Math.max(...todaySessions.map((s) => s.progressRate)) * 100)
    : 0;

  // 週の練習回数（直近7日）
  const weekCount = getSessions
    ? (() => {
        try {
          const all = getSessions();
          const week = new Date();
          week.setDate(week.getDate() - 7);
          return all.filter((s) => new Date(s.date) >= week).length;
        } catch { return 0; }
      })()
    : 0;

  return (
    <div className="flex flex-col min-h-screen pb-20">

      {/* ── ヘッダー ── */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 bg-[#FAF7F2]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <h1 className="text-xl font-black text-[#4A3728] tracking-tight leading-none">よめたね</h1>
            <p className="text-xs text-[#9A8070] mt-0.5">音読練習アプリ</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex flex-col items-center gap-0.5 w-12 h-12 justify-center rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span className="text-[10px] text-[#9A8070] font-medium">設定</span>
        </Link>
      </header>

      {/* ── ヒーローカード ── */}
      <div className="mx-4 mb-4">
        <div className="relative rounded-3xl overflow-hidden bg-[#EDE8DF] px-5 py-5">
          {/* テキスト */}
          <div className="relative z-10 max-w-[56%]">
            <h2 className="text-xl font-black text-[#3D2B1F] leading-tight mb-2">
              {todayCompleted ? 'よくできました！' : streak > 2 ? 'がんばってるね！' : 'さあ、はじめよう！'}
            </h2>
            <p className="text-xs text-[#7A6050] leading-relaxed">
              {todayCompleted
                ? '今日の音読、完了！\nまた明日もいっしょに練習しよう。'
                : '音読は、毎日のつみかさねがだいじだよ。\nたのしみながら、じょうずになっていこう！'}
            </p>
          </div>

          {/* 今日の進捗カード */}
          {todaySessions.length > 0 && (
            <div className="relative z-10 mt-4 bg-white rounded-2xl px-4 py-3 shadow-sm max-w-[70%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#E8F5E2] flex items-center justify-center">
                  <span className="text-sm">🌱</span>
                </div>
                <p className="text-xs font-bold text-[#4A7C40]">
                  {todayCompleted ? '今日の音読、完了！' : '今日も練習しています'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#E8F0E4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6AAF5A] rounded-full transition-all duration-700"
                    style={{ width: `${todayProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#6AAF5A] shrink-0">{todayProgress}%</span>
              </div>
            </div>
          )}

          {/* 右側のイラスト風デコ */}
          <div className="absolute right-0 top-0 bottom-0 w-[44%] flex items-center justify-center">
            <div className="text-[80px] opacity-20 select-none">📚</div>
          </div>

          {/* 連続記録バッジ */}
          {streak > 0 && (
            <div className="absolute top-3 right-3 bg-[#F5A623] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              🔥 {streak}日連続
            </div>
          )}
        </div>
      </div>

      {/* ── 音読をはじめるボタン ── */}
      <div className="mx-4 mb-5">
        <Link
          href={hasTexts ? '/readings' : '/readings/new'}
          className="flex items-center justify-between bg-[#EDE0CC] rounded-3xl px-6 py-5 shadow-sm active:scale-95 transition-all hover:bg-[#E5D5BB] group"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎤</span>
            <div>
              <p className="text-lg font-black text-[#4A3728]">音読をはじめる</p>
              <p className="text-xs text-[#9A8070] mt-0.5">
                {hasTexts ? '登録した文章からえらんで練習しよう！' : 'まず文章を登録しよう！'}
              </p>
            </div>
          </div>
          <div className="w-9 h-9 bg-[#4A3728] rounded-full flex items-center justify-center group-hover:bg-[#3A2718] transition-colors shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* ── 4グリッドメニュー ── */}
      <div className="mx-4 mb-5 grid grid-cols-2 gap-3">
        <MenuCard
          href="/capture"
          iconBg="#D9EDDA"
          icon="📷"
          title="写真から登録"
          desc="教科書やプリントを写真にとって登録"
        />
        <MenuCard
          href="/readings/new"
          iconBg="#FDF3CC"
          icon="✏️"
          title="入力して登録"
          desc="文章を入力して練習文をつくる"
        />
        <MenuCard
          href="/cards"
          iconBg="#D6E8F5"
          icon="📋"
          title="音読カード"
          desc="がんばりをカードにして記録しよう"
        />
        <MenuCard
          href="/stamps"
          iconBg="#FAE0E4"
          icon="⭐"
          title="スタンプ帳"
          desc="ためたスタンプを見てみよう！"
        />
      </div>

      {/* ── がんばりのきろく ── */}
      <div className="mx-4 mb-4">
        <div className="bg-white rounded-3xl px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🚩</span>
              <p className="text-sm font-bold text-[#4A3728]">がんばりのきろく</p>
            </div>
            <Link href="/cards" className="text-xs text-[#9A8070] hover:text-[#6AAF5A] transition-colors">
              もっと見る ›
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatItem icon="📖" value={weekCount} unit="回" label="今週の練習回数" color="#6AAF5A" />
            <StatItem icon="☀️" value={streak} unit="日" label="つづけた日数" color="#F5A623" />
            <StatItem icon="🏆" value={stampCount} unit="こ" label="もらったスタンプ" color="#E07B5A" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── サブコンポーネント ──

interface MenuCardProps {
  href: string;
  iconBg: string;
  icon: string;
  title: string;
  desc: string;
}

function MenuCard({ href, iconBg, icon, title, desc }: MenuCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-3xl px-4 py-4 shadow-sm active:scale-95 transition-all hover:shadow-md flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <div
          className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{ borderColor: iconBg }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9A8070" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-[#4A3728] leading-tight">{title}</p>
        <p className="text-xs text-[#9A8070] mt-1 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}

interface StatItemProps {
  icon: string;
  value: number;
  unit: string;
  label: string;
  color: string;
}

function StatItem({ icon, value, unit, label, color }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#FAF7F2] rounded-2xl py-3 px-2">
      <span className="text-xl">{icon}</span>
      <p className="text-lg font-black leading-none" style={{ color }}>
        {value}<span className="text-xs font-bold ml-0.5">{unit}</span>
      </p>
      <p className="text-[10px] text-[#9A8070] text-center leading-tight">{label}</p>
    </div>
  );
}
