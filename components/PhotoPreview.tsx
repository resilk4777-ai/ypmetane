'use client';

import Image from 'next/image';

interface PhotoPreviewProps {
  previewUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
}

export default function PhotoPreview({ previewUrl, onConfirm, onRetake }: PhotoPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* プレビュー画像 */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="撮影した写真"
          className="w-full h-auto max-h-[60vh] object-contain"
        />
      </div>

      {/* ヒント */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 leading-relaxed">
        文字がはっきり写っていますか？影・ぼやけ・傾きがあると読み取りにくくなります。
      </div>

      {/* ボタン */}
      <button
        onClick={onConfirm}
        className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
      >
        この写真で進む
      </button>
      <button
        onClick={onRetake}
        className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3.5 font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
      >
        撮り直す
      </button>
    </div>
  );
}
