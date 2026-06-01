'use client';

import type { ReadingSession } from '@/types/reading';
import type { ReadingText } from '@/types/reading';
import { formatDate, formatDuration } from '@/lib/date';
import { STAMP_DEFINITIONS } from '@/types/stamp';

interface ReadingCardProps {
  session: ReadingSession;
  text?: ReadingText;
  showCommentFields?: boolean;
  onCommentChange?: (field: 'parentComment' | 'teacherComment', value: string) => void;
}

export default function ReadingCard({
  session,
  text,
  showCommentFields,
  onCommentChange,
}: ReadingCardProps) {
  const stamps = session.stampIds
    .map((id) => STAMP_DEFINITIONS.find((d) => d.type === id))
    .filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      {/* カードヘッダー */}
      <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
        <p className="text-xs text-amber-600 font-medium">{formatDate(session.date)}</p>
        {text && (
          <p className="text-base font-bold text-gray-800 mt-0.5 truncate">{text.title}</p>
        )}
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* 基本情報 */}
        {text && (
          <div className="flex gap-4 text-sm text-gray-600">
            {text.subject && <span>{text.subject}</span>}
            {text.page && <span>{text.page}ページ</span>}
          </div>
        )}

        {/* 統計 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-sky-50 rounded-xl py-2">
            <p className="text-lg font-bold text-sky-600">
              {Math.round(session.progressRate * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">読めた割合</p>
          </div>
          <div className="text-center bg-emerald-50 rounded-xl py-2">
            <p className="text-lg font-bold text-emerald-600">
              {formatDuration(session.durationSeconds)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">かかった時間</p>
          </div>
          <div className="text-center bg-amber-50 rounded-xl py-2">
            <p className="text-lg font-bold text-amber-600">
              {session.completed ? '完了' : '途中'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">最後まで</p>
          </div>
        </div>

        {/* スタンプ */}
        {stamps.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {stamps.map((s) => s && (
              <span
                key={s.type}
                className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1"
              >
                {s.emoji} {s.name}
              </span>
            ))}
          </div>
        )}

        {/* コメント欄 */}
        {showCommentFields && (
          <div className="space-y-3 pt-2 border-t border-gray-50">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                保護者コメント
              </label>
              <textarea
                value={session.parentComment}
                onChange={(e) => onCommentChange?.('parentComment', e.target.value)}
                placeholder="コメントを入力してください"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                先生コメント
              </label>
              <textarea
                value={session.teacherComment}
                onChange={(e) => onCommentChange?.('teacherComment', e.target.value)}
                placeholder="コメントを入力してください"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
