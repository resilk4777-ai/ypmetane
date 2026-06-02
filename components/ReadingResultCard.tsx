'use client';

import type { ReadingSession, ReadingText } from '@/types/reading';
import StampSvg from '@/components/StampSvg';

type ResultLevel = 'perfect' | 'good' | 'try';

interface ResultConfig {
  label: string;
  range: string;
  message: string;
  subMessage: string;
  stampColor: string;
  stampBorder: string;
  stampBg: string;
  progressColor: string;
  messageBg: string;
  mascot: string;
}

const RESULT_CONFIG: Record<ResultLevel, ResultConfig> = {
  perfect: {
    label: 'カンペキ！',
    range: '90〜100%',
    message: 'カンペキ！すばらしい！',
    subMessage: 'つぎの文章にもチャレンジしよう！',
    bottomMessage: 'すばらしい！よくがんばったね！',
    stampColor: '#D45A5A',
    stampBorder: '#F0908A',
    stampBg: '#FFF0EE',
    progressColor: '#5A9AE0',
    messageBg: '#FFF0EE',
    mascot: '⭐',
  } as ResultConfig & { bottomMessage: string },
  good: {
    label: 'がんばったね！',
    range: '60〜89%',
    message: 'とてもよく読めているよ！',
    subMessage: 'つぎもがんばってみよう！',
    bottomMessage: 'とてもよく読めているよ！',
    stampColor: '#3A9A4A',
    stampBorder: '#6FC87A',
    stampBg: '#E8F8EC',
    progressColor: '#6AAF5A',
    messageBg: '#EAF7EC',
    mascot: '📗',
  } as ResultConfig & { bottomMessage: string },
  try: {
    label: 'がんばろう！',
    range: '0〜59%',
    message: 'さいごまで読めるように、',
    subMessage: 'もうすこしがんばってみよう！',
    bottomMessage: 'もう少しでゴールだよ！',
    stampColor: '#C84A4A',
    stampBorder: '#E07070',
    stampBg: '#FFF0EE',
    progressColor: '#F5C842',
    messageBg: '#FFF8EE',
    mascot: '✏️',
  } as ResultConfig & { bottomMessage: string },
};

function getLevel(progressRate: number): ResultLevel {
  if (progressRate >= 0.9) return 'perfect';
  if (progressRate >= 0.6) return 'good';
  return 'try';
}

interface ReadingResultCardProps {
  session: ReadingSession;
  text?: ReadingText;
  childName?: string;
  onClose: () => void;
}

export default function ReadingResultCard({ session, text, childName, onClose }: ReadingResultCardProps) {
  const level = getLevel(session.progressRate);
  const cfg = RESULT_CONFIG[level] as ResultConfig & { bottomMessage: string };
  const pct = Math.round(session.progressRate * 100);
  const dateLabel = session.date.replace(/-/g, '/');

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#F0F4F8] rounded-t-3xl overflow-y-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ── カード本体 ── */}
        <div className="mx-4 mt-2 mb-4 bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <h2 className="text-lg font-black text-[#4A3728] text-center mb-5">音読カード</h2>

            {/* なまえ・きじ */}
            <div className="space-y-3 mb-4">
              <Row label="なまえ" value={childName || '　'} />
              <div className="border-t border-dashed border-[#EDE8DF]" />
              <Row label="きじ" value={text?.title || '　'} />
              <div className="border-t border-dashed border-[#EDE8DF]" />
            </div>

            {/* 読めたパーセント + スタンプ */}
            <div className="flex items-end justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-[#9A8070] mb-2">読めたパーセント</p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-black text-[#3D2B1F]">{pct}</span>
                  <span className="text-xl font-bold text-[#9A8070] mb-1">%</span>
                </div>
                {/* プログレスバー */}
                <div className="w-40 h-3 bg-[#EDE8DF] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: cfg.progressColor }}
                  />
                </div>
              </div>
              {/* スタンプ */}
              <div className="shrink-0 ml-4">
                <StampSvg level={level} size={96} />
              </div>
            </div>

            {/* ひとことメッセージ */}
            <div className="rounded-2xl px-4 py-3 mb-4 relative" style={{ backgroundColor: cfg.messageBg }}>
              <p className="text-xs font-bold text-[#9A8070] mb-1">ひとことメッセージ</p>
              <p className="text-sm font-medium text-[#4A3728] leading-relaxed">
                {cfg.message}<br />{cfg.subMessage}
              </p>
              <span className="absolute bottom-2 right-3 text-3xl">{cfg.mascot}</span>
            </div>

            {/* ひづけ */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#9A8070]">ひづけ</span>
              <span className="font-medium text-[#4A3728]">{dateLabel}</span>
            </div>
          </div>
        </div>

        {/* ── 下部バッジ ── */}
        <div className="mx-4 mb-6 text-center">
          <div
            className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: cfg.stampBg, color: cfg.stampColor }}
          >
            {cfg.range}
          </div>
          <p className="text-3xl font-black mb-2" style={{ color: cfg.stampColor }}>
            {cfg.label}
          </p>
          <p className="text-sm text-[#9A8070]">{cfg.bottomMessage}</p>
        </div>

        {/* 閉じるボタン */}
        <div className="px-4 pb-8">
          <button
            onClick={onClose}
            className="w-full bg-white border-2 border-[#EDE8DF] text-[#9A8070] rounded-3xl py-3.5 font-bold text-sm active:scale-95 transition-all"
          >
            とじる
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-[#9A8070] w-10 shrink-0">{label}</span>
      <span className="text-base font-bold text-[#4A3728]">{value}</span>
    </div>
  );
}

