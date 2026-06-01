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
            className="text-sky-500 text-sm font-semibold hover:text-sky-600"
          >
            追加
          </Link>
        }
      />

      <div className="flex-1 px-4 py-4">
        {texts.length === 0 ? (
          <EmptyState
            icon="📄"
            title="文章がまだ登録されていません"
            description="「追加」ボタンから音読する文章を登録してください"
            action={
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Link
                  href="/capture"
                  className="bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all text-center"
                >
                  📷 写真から登録する
                </Link>
                <Link
                  href="/readings/new"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all text-center"
                >
                  ✏️ 入力して登録する
                </Link>
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {texts.map((text) => (
              <div key={text.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <Link href={`/practice?id=${text.id}`} className="block px-5 py-4 active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 truncate">{text.title}</p>
                        {text.sourceType === 'photo' && (
                          <span className="shrink-0 text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5">
                            写真
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        {text.subject && <span>{text.subject}</span>}
                        {text.page && <span>{text.page}ページ</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {text.body}
                      </p>
                    </div>
                    <div className="shrink-0 bg-sky-50 text-sky-500 rounded-xl px-3 py-1.5 text-xs font-medium">
                      練習する
                    </div>
                  </div>
                </Link>
                <div className="border-t border-gray-50 flex">
                  <Link
                    href={`/readings/new?edit=${text.id}`}
                    className="flex-1 py-2.5 text-xs text-gray-500 text-center hover:bg-gray-50 transition-colors"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(text.id)}
                    className="flex-1 py-2.5 text-xs text-red-400 text-center hover:bg-red-50 transition-colors"
                  >
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
