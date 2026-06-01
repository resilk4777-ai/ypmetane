'use client';

interface OcrResultEditorProps {
  title: string;
  subject: string;
  page: string;
  body: string;
  onTitleChange: (v: string) => void;
  onSubjectChange: (v: string) => void;
  onPageChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSave: () => void;
  onRetake: () => void;
  isSaving: boolean;
  error: string;
}

export default function OcrResultEditor({
  title,
  subject,
  page,
  body,
  onTitleChange,
  onSubjectChange,
  onPageChange,
  onBodyChange,
  onSave,
  onRetake,
  isSaving,
  error,
}: OcrResultEditorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
        <p className="text-xs text-sky-700 leading-relaxed">
          読み取りにまちがいがある場合は、ここで直してください。
          ふりがな・記号など不要な部分は削除してOKです。
        </p>
      </div>

      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="例：国語　光村図書"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
        />
      </div>

      {/* ページ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          ページ番号
        </label>
        <input
          type="text"
          value={page}
          onChange={(e) => onPageChange(e.target.value)}
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
          onChange={(e) => onBodyChange(e.target.value)}
          rows={10}
          placeholder="ここに読み取った文章が表示されます"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">
          {body.length} 文字
        </p>
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-60 shadow-sm"
      >
        {isSaving ? '保存しています...' : '音読文章として保存する'}
      </button>

      {/* 撮り直し */}
      <button
        onClick={onRetake}
        className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3.5 font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
      >
        写真を撮り直す
      </button>
    </div>
  );
}
