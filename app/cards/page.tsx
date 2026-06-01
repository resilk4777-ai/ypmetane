'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import ReadingCard from '@/components/ReadingCard';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { getSessions, getReadingTexts, updateSessionComment } from '@/lib/storage';
import { todayString, formatDate } from '@/lib/date';
import type { ReadingSession, ReadingText } from '@/types/reading';

export default function CardsPage() {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  useEffect(() => {
    setSessions(getSessions());
    setTexts(getReadingTexts());
  }, []);

  function handleCommentChange(
    sessionId: string,
    field: 'parentComment' | 'teacherComment',
    value: string
  ) {
    updateSessionComment(sessionId, field, value);
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, [field]: value } : s))
    );
  }

  const today = todayString();
  const todaySessions = sessions.filter((s) => s.date === today);
  const allSessions = sessions;

  const displaySessions = activeTab === 'today' ? todaySessions : allSessions;

  const getTextById = (id: string) => texts.find((t) => t.id === id);

  // 日付でグループ化
  const grouped = displaySessions.reduce<Record<string, ReadingSession[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="音読カード" backHref="/" />

      {/* タブ */}
      <div className="flex px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'today'
              ? 'bg-sky-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          今日の音読カード
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-sky-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          音読の記録
        </button>
      </div>

      <div className="flex-1 px-4 py-4">
        {displaySessions.length === 0 ? (
          <EmptyState
            icon="📋"
            title={activeTab === 'today' ? 'まだ今日の音読がありません' : '音読の記録がありません'}
            description={activeTab === 'today' ? '音読を完了するとカードが作られます' : '音読を練習するとここに記録が残ります'}
            action={
              <Link
                href="/readings"
                className="bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all inline-block"
              >
                音読をはじめる
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-500 mb-2 px-1">
                  {date === today ? '今日 · ' : ''}{formatDate(date)}
                </p>
                <div className="space-y-3">
                  {grouped[date].map((session) => (
                    <ReadingCard
                      key={session.id}
                      session={session}
                      text={getTextById(session.readingTextId)}
                      showCommentFields
                      onCommentChange={(field, value) => handleCommentChange(session.id, field, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
