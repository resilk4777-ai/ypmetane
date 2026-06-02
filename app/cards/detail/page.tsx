'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { getSessions, getReadingTexts, updateSessionComment } from '@/lib/storage';
import { todayString, formatDate, formatDuration } from '@/lib/date';
import { STAMP_DEFINITIONS } from '@/types/stamp';
import type { ReadingSession, ReadingText } from '@/types/reading';

export default function CardsDetailPage() {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [texts, setTexts] = useState<ReadingText[]>([]);

  useEffect(() => {
    setSessions(getSessions());
    setTexts(getReadingTexts());
  }, []);

  function handleComment(id: string, field: 'parentComment' | 'teacherComment', value: string) {
    updateSessionComment(id, field, value);
    setSessions(sessions.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  const today = todayString();
  const getTextById = (id: string) => texts.find((t) => t.id === id);

  const grouped = sessions.reduce<Record<string, ReadingSession[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#FAF7F2]">
      <AppHeader title="音読の記録" backHref="/cards" />
      <div className="flex-1 px-4 py-4">
        {sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-sm font-bold text-[#9A8070]">まだ記録がありません</p>
            <Link href="/readings" className="mt-4 bg-[#6AAF5A] text-white px-6 py-3 rounded-2xl text-sm font-bold">
              音読をはじめる
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map((date) => (
              <div key={date}>
                <p className="text-xs font-bold text-[#9A8070] mb-2 px-1">
                  {date === today ? '今日 · ' : ''}{formatDate(date)}
                </p>
                {grouped[date].map((session) => {
                  const text = getTextById(session.readingTextId);
                  const stamps = session.stampIds
                    .map((id) => STAMP_DEFINITIONS.find((d) => d.type === id))
                    .filter(Boolean);
                  return (
                    <div key={session.id} className="bg-white rounded-3xl shadow-sm overflow-hidden mb-3">
                      <div className="bg-[#EDE0CC] px-5 py-3">
                        {text && <p className="text-base font-bold text-[#4A3728] truncate">{text.title}</p>}
                        {text && (
                          <div className="flex gap-3 text-xs text-[#9A8070] mt-0.5">
                            {text.subject && <span>{text.subject}</span>}
                            {text.page && <span>{text.page}ページ</span>}
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <StatBox value={`${Math.round(session.progressRate * 100)}%`} label="読めた" color="#6AAF5A" bg="#D9EDDA" />
                          <StatBox value={formatDuration(session.durationSeconds)} label="時間" color="#F5A623" bg="#FDF3CC" />
                          <StatBox value={session.completed ? '完了' : '途中'} label="最後まで" color={session.completed ? '#6AAF5A' : '#9A8070'} bg={session.completed ? '#D9EDDA' : '#F0EDE8'} />
                        </div>
                        {stamps.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {stamps.map((s) => s && (
                              <span key={s.type} className="flex items-center gap-1 text-xs bg-[#FDF3CC] text-[#8A6A20] border border-[#F5D98A] rounded-full px-3 py-1 font-medium">
                                {s.emoji} {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="space-y-2 pt-2 border-t border-[#FAF7F2]">
                          {(['parentComment', 'teacherComment'] as const).map((field) => (
                            <div key={field}>
                              <label className="block text-xs font-medium text-[#9A8070] mb-1">
                                {field === 'parentComment' ? '保護者コメント' : '先生コメント'}
                              </label>
                              <textarea
                                value={session[field]}
                                onChange={(e) => handleComment(session.id, field, e.target.value)}
                                placeholder="コメントを入力"
                                rows={2}
                                className="w-full text-sm border border-[#EDE8DF] rounded-2xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#6AAF5A]/30 bg-[#FAF7F2]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ value, label, color, bg }: { value: string; label: string; color: string; bg: string }) {
  return (
    <div className="text-center rounded-2xl py-2.5" style={{ backgroundColor: bg }}>
      <p className="text-base font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-[#9A8070] mt-0.5">{label}</p>
    </div>
  );
}
