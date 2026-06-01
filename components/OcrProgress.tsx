'use client';

interface OcrProgressProps {
  progress: number; // 0〜1
  message: string;
}

export default function OcrProgress({ progress, message }: OcrProgressProps) {
  const pct = Math.min(100, Math.round(progress * 100));

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-8">
      {/* アイコン */}
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full border-4 border-sky-100 border-t-sky-400 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-3xl">📄</span>
      </div>

      {/* メッセージ */}
      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-800">{message || '文字を読み取っています'}</p>
        <p className="text-sm text-gray-500">少しお待ちください</p>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-xs">
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{pct}%</p>
      </div>
    </div>
  );
}
