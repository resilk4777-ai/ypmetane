'use client';

import { useRef } from 'react';

interface PhotoPickerProps {
  onFileSelected: (file: File) => void;
  onError: (msg: string) => void;
}

export default function PhotoPicker({ onFileSelected, onError }: PhotoPickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError('画像ファイルを選んでください');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError('写真が大きすぎます。別の写真をお試しください');
      return;
    }
    onFileSelected(file);
    // input をリセットして同じファイルを再選択できるようにする
    e.target.value = '';
  }

  return (
    <div className="space-y-3">
      {/* カメラで撮影（スマホ向け） */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="w-full flex items-center gap-4 bg-sky-500 text-white rounded-2xl px-5 py-4 shadow-sm active:scale-95 transition-all hover:bg-sky-600"
      >
        <span className="text-2xl">📷</span>
        <div className="text-left">
          <p className="font-bold text-base">写真を撮る</p>
          <p className="text-xs text-sky-100 mt-0.5">カメラを起動して撮影</p>
        </div>
      </button>

      {/* ライブラリから選択 */}
      <button
        onClick={() => libraryInputRef.current?.click()}
        className="w-full flex items-center gap-4 bg-white border-2 border-sky-200 text-sky-700 rounded-2xl px-5 py-4 active:scale-95 transition-all hover:bg-sky-50"
      >
        <span className="text-2xl">🖼️</span>
        <div className="text-left">
          <p className="font-bold text-base">写真を選ぶ</p>
          <p className="text-xs text-sky-400 mt-0.5">写真ライブラリから選択</p>
        </div>
      </button>

      {/* 隠しinput: カメラ撮影用 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* 隠しinput: ライブラリ選択用（captureなし） */}
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
