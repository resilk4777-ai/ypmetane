'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SuccessEffect from '@/components/SuccessEffect';
import { getSessions, getReadingTextById, saveStamp, getSettings } from '@/lib/storage';
import { STAMP_DEFINITIONS } from '@/types/stamp';
import { playSuccess, playStamp } from '@/lib/sound';
import { formatDuration, generateId } from '@/lib/date';
import type { ReadingSession } from '@/types/reading';
import type { ReadingText } from '@/types/reading';

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const textId = searchParams.get('textId');

  const [session, setSession] = useState<ReadingSession | null>(null);
  const [text, setText] = useState<ReadingText | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [stampsGiven, setStampsGiven] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId || !textId) { router.replace('/'); return; }

    const s = getSessions().find((s) => s.id === sessionId);
    const t = getReadingTextById(textId);

    if (!s || !t) { router.replace('/'); return; }

    setSession(s);
    setText(t);

    const settings = getSettings();

    // 効果音
    if (settings.soundEnabled) {
      setTimeout(() => playSuccess(), 300);
      setTimeout(() => playStamp(), 800);
    }

    // 演出
    if (settings.effectsEnabled) {
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 3000);
    }

    // スタンプ付与
    const stampIds = s.stampIds;
    const given: string[] = [];
    for (const sid of stampIds) {
      const def = STAMP_DEFINITIONS.find((d) => d.type === sid);
      saveStamp({
        id: generateId(),
        type: sid as import('@/types/stamp').StampType,
        name: def?.name ?? sid,
        description: def?.description ?? '',
        acquiredAt: new Date().toISOString(),
      });
      given.push(sid);
    }
    setStampsGiven(given);
  }, [sessionId, textId, router]);

  if (!session || !text) return null;

  const STAMP_LABELS: Record<string, { emoji: string; name: string }> = {
    completed: { emoji: '🎉', name: '最後まで読めました' },
    well_read: { emoji: '⭐', name: 'よく読めました' },
    clear_voice: { emoji: '🔊', name: 'はきはき読めました' },
    daily_challenge: { emoji: '📖', name: '毎日チャレンジ' },
    streak_3: { emoji: '🔥', name: '3日連続' },
    streak_7: { emoji: '🌟', name: '7日連続' },
    smooth_read: { emoji: '✨', name: 'すらすら読めました' },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SuccessEffect show={showEffect} />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">
        {/* 完了アイコン */}
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100">
          <span className="text-5xl">🎊</span>
        </div>

        <h1 className="text-2xl font-black text-gray-800 mb-2">音読クリア！</h1>
        <p className="text-base text-gray-600 mb-8">最後まで読めました</p>

        {/* 統計 */}
        <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-500">
                {Math.round(session.progressRate * 100)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">読めた割合</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {formatDuration(session.durationSeconds)}
              </p>
              <p className="text-xs text-gray-500 mt-1">かかった時間</p>
            </div>
          </div>
        </div>

        {/* スタンプ */}
        {stampsGiven.length > 0 && (
          <div className="w-full max-w-sm mb-8">
            <p className="text-sm font-medium text-gray-600 mb-3">スタンプを押しました</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {stampsGiven.map((sid) => {
                const info = STAMP_LABELS[sid];
                return info ? (
                  <div
                    key={sid}
                    className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-full px-4 py-2"
                  >
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-sm font-semibold text-amber-700">{info.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* ボタンエリア */}
      <div className="px-5 pb-8 space-y-3">
        <Link
          href="/cards"
          className="block w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base text-center hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
        >
          今日の音読カードを見る
        </Link>
        <button
          onClick={() => router.push(`/practice?id=${textId}`)}
          className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-4 font-semibold text-base hover:bg-gray-50 active:scale-95 transition-all"
        >
          もう一回読む
        </button>
        <Link
          href="/"
          className="block w-full text-gray-500 text-center py-3 text-sm hover:text-gray-700 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
