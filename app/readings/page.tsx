'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/EmptyState';
import { getReadingTexts, deleteReadingText } from '@/lib/storage';
import type { ReadingText } from '@/types/reading';

export default function ReadingsPage() {
  const [texts, setTexts] = useState<ReadingText[]>([]);

  useEffect(() => {
    setTexts(getReadingTexts());
  }, []);

  function handleDelete(id: string) {
    if (!confirm('この文章を削除しますか？')) return;
    deleteReadingText(id);
    setTexts(getReadingTexts());
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        title="文章一覧"
        backHref="/"
        right={
          <Link
            href="/capture"
            className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[#6AAF5A] shadow-sm active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Link>
        }
      />

      <div className="flex-1 px-4 py-3">
        {texts.length === 0 ? (
          <EmptyState
            icon="📄"
            title="文章がまだ登録されていません"
            description="「＋」ボタンから音読する文章を登録してください"
            action={
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Link href="/capture" className="bg-[#6AAF5A] text-white px-6 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-all text-center shadow-sm">
                  📷 写真から登録する
                </Link>
                <Link href="/readings/new" className="bg-white text-[#4A3728] px-6 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-all text-center shadow-sm border border-[#EDE8DF]">
                  ✏️ 入力して登録する
                </Link>
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {texts.map((text) => (
              <div key={text.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <Link href={`/practice?id=${text.id}`} className="block px-5 py-4 active:bg-[#FAF7F2] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#4A3728] truncate">{text.title}</p>
                        {text.sourceType === 'photo' && (
                          <span className="shrink-0 text-xs bg-[#D9EDDA] text-[#4A7C40] rounded-full px-2 py-0.5 font-medium">
                            写真
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-[#9A8070]">
                        {text.subject && <span>{text.subject}</span>}
                        {text.page && <span>{text.page}ページ</span>}
                      </div>
                      <p className="text-sm text-[#9A8070] mt-2 line-clamp-2 leading-relaxed">
                        {text.body}
                      </p>
                    </div>
                    <div className="shrink-0 bg-[#EDE0CC] text-[#4A3728] rounded-2xl px-3 py-2 text-xs font-bold">
                      練習する
                    </div>
                  </div>
                </Link>
                <div className="border-t border-[#FAF7F2] flex">
                  <Link href={`/readings/new?edit=${text.id}`} className="flex-1 py-2.5 text-xs text-[#9A8070] text-center hover:bg-[#FAF7F2] transition-colors font-medium">
                    編集
                  </Link>
                  <button onClick={() => handleDelete(text.id)} className="flex-1 py-2.5 text-xs text-red-400 text-center hover:bg-red-50 transition-colors font-medium">
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
