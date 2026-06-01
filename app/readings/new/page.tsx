'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { getReadingTextById, saveReadingText } from '@/lib/storage';
import { generateId, todayString } from '@/lib/date';
import type { ReadingText } from '@/types/reading';
import { Suspense } from 'react';

function NewReadingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editId) {
      const text = getReadingTextById(editId);
      if (text) {
        setTitle(text.title);
        setSubject(text.subject);
        setPage(text.page);
        setBody(text.body);
      }
    }
  }, [editId]);

  function handleSave() {
    if (!body.trim()) {
      setError('音読する文章を入力してください');
      return;
    }
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    const now = new Date().toISOString();
    const existing = editId ? getReadingTextById(editId) : undefined;
    const text: ReadingText = {
      id: editId || generateId(),
      title: title.trim(),
      subject: subject.trim(),
      page: page.trim(),
      body: body.trim(),
      sourceType: existing?.sourceType ?? 'manual',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveReadingText(text);
    setSaved(true);

    setTimeout(() => {
      router.push(`/practice?id=${text.id}`);
    }, 500);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        title={editId ? '文章を編集' : '文章を登録'}
        backHref={editId ? '/readings' : '/'}
      />

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* タイトル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            タイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="例：ごんぎつね　第一章"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
          />
        </div>

        {/* 教科 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            教科・教材名
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="例：国語　光村図書"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
          />
        </div>

        {/* ページ番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ページ番号
          </label>
          <input
            type="text"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="例：42〜44"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
          />
        </div>

        {/* 本文 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            音読する文章 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setError(''); }}
            placeholder={'例：\nむかし、むかし、あるところに、おじいさんとおばあさんが いました。\nおじいさんは やまへ しばかりに、おばあさんは かわへ せんたくに いきました。'}
            rows={8}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            句読点や改行でフレーズが分かれます
          </p>
        </div>

        {/* 入力例ヒント */}
        {!body && (
          <div className="bg-sky-50 rounded-xl p-4">
            <p className="text-xs font-medium text-sky-700 mb-2">入力のヒント</p>
            <ul className="text-xs text-sky-600 space-y-1 list-disc list-inside">
              <li>教科書の文章をそのまま入力してください</li>
              <li>句読点（。、）はそのまま入力でOKです</li>
              <li>ひらがな・漢字どちらでも読めます</li>
              <li>将来的に写真から文字を読み取ることもできます</li>
            </ul>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-60 shadow-sm"
        >
          {saved ? '保存しました！' : '保存して練習画面へ'}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full bg-gray-100 text-gray-600 rounded-2xl py-4 font-semibold text-base hover:bg-gray-200 active:scale-95 transition-all"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default function NewReadingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>}>
      <NewReadingForm />
    </Suspense>
  );
}
