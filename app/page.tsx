'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReadingTexts, getSessions, getStreak } from '@/lib/storage';
import { todayString, formatDuration } from '@/lib/date';
import type { ReadingSession } from '@/types/reading';

export default function HomePage() {
  const [todaySessions, setTodaySessions] = useState<ReadingSession[]>([]);
  const [streak, setStreak] = useState(0);
  const [hasTexts, setHasTexts] = useState(false);

  useEffect(() => {
    const today = todayString();
    setTodaySessions(getSessions().filter((s) => s.date === today));
    setStreak(getStreak());
    setHasTexts(getReadingTexts().length > 0);
  }, []);

  const todayCompleted = todaySessions.some((s) => s.completed);
  const todayDuration = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-black text-sky-500 tracking-tight">よめたね！</h1>
          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="設定"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
        </div>
        <p className="text-sm text-gray-500">音読練習アプリ</p>
      </div>

      {/* 今日の状況カード */}
      <div className="px-5 mb-5">
        {todayCompleted ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-700 text-sm">今日の音読は完了しています</p>
              {todayDuration > 0 && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  合計 {formatDuration(todayDuration)} 練習しました
                </p>
              )}
            </div>
          </div>
        ) : todaySessions.length > 0 ? (
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <p className="font-semibold text-sky-700 text-sm">今日も練習しています</p>
              <p className="text-xs text-sky-600 mt-0.5">もう少しで完成！</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-amber-700 text-sm">今日の音読をはじめよう</p>
              <p className="text-xs text-amber-600 mt-0.5">毎日の練習が上達の近道です</p>
            </div>
          </div>
        )}
      </div>

      {/* 連続達成日数 */}
      {streak > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xl">🔥</span>
            <span className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">{streak}日</span> 連続で音読中
            </span>
          </div>
        </div>
      )}

      {/* メインメニュー */}
      <div className="px-5 space-y-3 flex-1">
        {hasTexts ? (
          <Link
            href="/readings"
            className="flex items-center gap-4 bg-sky-500 text-white rounded-2xl px-5 py-4 shadow-sm active:scale-95 transition-all hover:bg-sky-600"
          >
            <span className="text-2xl">🎤</span>
            <div>
              <p className="font-bold text-base">音読をはじめる</p>
              <p className="text-xs text-sky-100 mt-0.5">登録した文章から選んで練習</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/readings/new"
            className="flex items-center gap-4 bg-sky-500 text-white rounded-2xl px-5 py-4 shadow-sm active:scale-95 transition-all hover:bg-sky-600"
          >
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-bold text-base">音読をはじめる</p>
              <p className="text-xs text-sky-100 mt-0.5">まず文章を登録しましょう</p>
            </div>
          </Link>
        )}

        {/* 文章登録2択 */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/capture"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 shadow-sm active:scale-95 transition-all hover:bg-gray-50"
          >
            <span className="text-2xl">📷</span>
            <p className="text-sm font-semibold text-gray-700">写真から登録</p>
          </Link>

          <Link
            href="/readings/new"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 shadow-sm active:scale-95 transition-all hover:bg-gray-50"
          >
            <span className="text-2xl">✏️</span>
            <p className="text-sm font-semibold text-gray-700">入力して登録</p>
          </Link>

          <Link
            href="/cards"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 shadow-sm active:scale-95 transition-all hover:bg-gray-50"
          >
            <span className="text-2xl">📋</span>
            <p className="text-sm font-semibold text-gray-700">音読カード</p>
          </Link>

          <Link
            href="/stamps"
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 shadow-sm active:scale-95 transition-all hover:bg-gray-50"
          >
            <span className="text-2xl">⭐</span>
            <p className="text-sm font-semibold text-gray-700">スタンプ帳</p>
          </Link>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
