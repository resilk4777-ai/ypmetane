'use client';

import type { ReadingSession, ReadingText } from '@/types/reading';

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
                <StampCircle level={level} cfg={cfg} />
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

// ── スタンプSVG ──
function StampCircle({ level, cfg }: { level: ResultLevel; cfg: ResultConfig }) {
  if (level === 'perfect') {
    return (
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        {/* 波形外枠 */}
        <path d={wavePath(48, 48, 44, 12)} fill="none" stroke={cfg.stampBorder} strokeWidth="2.5" opacity="0.8"/>
        <path d={wavePath(48, 48, 38, 12)} fill={cfg.stampBg} stroke={cfg.stampBorder} strokeWidth="1.5" opacity="0.5"/>
        {/* 顔 */}
        <circle cx="48" cy="46" r="22" fill="#FFE0DC" stroke={cfg.stampBorder} strokeWidth="2"/>
        {/* 王冠 */}
        <path d="M36 36 L40 30 L48 34 L56 30 L60 36 L58 40 H38 Z" fill="#F5C842" stroke="#D4A020" strokeWidth="1"/>
        <circle cx="38" cy="34" r="2" fill="#F5C842"/>
        <circle cx="58" cy="34" r="2" fill="#F5C842"/>
        {/* 目・口 */}
        <ellipse cx="42" cy="46" rx="3" ry="3.5" fill={cfg.stampColor} opacity="0.8"/>
        <ellipse cx="54" cy="46" rx="3" ry="3.5" fill={cfg.stampColor} opacity="0.8"/>
        <path d="M40 53 Q48 59 56 53" stroke={cfg.stampColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* テキスト */}
        <path id="topArc" d="M 18 48 A 30 30 0 0 1 78 48" fill="none"/>
        <text fontSize="9" fontWeight="bold" fill={cfg.stampColor}>
          <textPath href="#topArc" startOffset="15%">カンペキ！</textPath>
        </text>
      </svg>
    );
  }

  if (level === 'good') {
    return (
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="48" r="44" fill="none" stroke={cfg.stampBorder} strokeWidth="2.5" opacity="0.7"/>
        <circle cx="48" cy="48" r="38" fill={cfg.stampBg} stroke={cfg.stampBorder} strokeWidth="1.5" opacity="0.4"/>
        <circle cx="48" cy="47" r="22" fill="#C8F0CC" stroke={cfg.stampBorder} strokeWidth="2"/>
        {/* 目・口 */}
        <ellipse cx="42" cy="44" rx="3" ry="3.5" fill={cfg.stampColor} opacity="0.9"/>
        <ellipse cx="54" cy="44" rx="3" ry="3.5" fill={cfg.stampColor} opacity="0.9"/>
        <path d="M40 52 Q48 58 56 52" stroke={cfg.stampColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* ほっぺ */}
        <circle cx="37" cy="50" r="4" fill="#F0A0A0" opacity="0.5"/>
        <circle cx="59" cy="50" r="4" fill="#F0A0A0" opacity="0.5"/>
        {/* テキスト */}
        <path id="topArcG" d="M 12 48 A 36 36 0 0 1 84 48" fill="none"/>
        <text fontSize="8.5" fontWeight="bold" fill={cfg.stampColor}>
          <textPath href="#topArcG" startOffset="8%">がんばったね！</textPath>
        </text>
        <path id="botArcG" d="M 84 48 A 36 36 0 0 1 12 48" fill="none"/>
        <text fontSize="7" fill={cfg.stampColor} opacity="0.7">
          <textPath href="#botArcG" startOffset="25%">★　★　★</textPath>
        </text>
      </svg>
    );
  }

  // try
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      <circle cx="48" cy="48" r="44" fill="none" stroke={cfg.stampBorder} strokeWidth="3" opacity="0.7" strokeDasharray="6 3"/>
      <circle cx="48" cy="47" r="24" fill="#FFE8E8" stroke={cfg.stampBorder} strokeWidth="2"/>
      {/* 目・口（少し困り顔） */}
      <ellipse cx="42" cy="44" rx="3" ry="3" fill={cfg.stampColor} opacity="0.8"/>
      <ellipse cx="54" cy="44" rx="3" ry="3" fill={cfg.stampColor} opacity="0.8"/>
      <path d="M41 53 Q48 50 55 53" stroke={cfg.stampColor} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* ほっぺ */}
      <circle cx="37" cy="49" r="4" fill="#F0B0B0" opacity="0.5"/>
      <circle cx="59" cy="49" r="4" fill="#F0B0B0" opacity="0.5"/>
      {/* テキスト */}
      <path id="topArcT" d="M 12 48 A 36 36 0 0 1 84 48" fill="none"/>
      <text fontSize="8.5" fontWeight="bold" fill={cfg.stampColor}>
        <textPath href="#topArcT" startOffset="10%">がんばろう！</textPath>
      </text>
    </svg>
  );
}

// 波形パス生成
function wavePath(cx: number, cy: number, r: number, waves: number): string {
  const points: string[] = [];
  for (let i = 0; i <= waves * 2; i++) {
    const angle = (i / (waves * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r - 5;
    const x = cx + rr * Math.cos(angle);
    const y = cy + rr * Math.sin(angle);
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  return points.join(' ') + ' Z';
}
