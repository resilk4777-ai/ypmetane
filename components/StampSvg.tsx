'use client';

export type StampLevel = 'perfect' | 'good' | 'try' | 'rest';

interface StampSvgProps {
  level: StampLevel;
  size?: number;
}

const STAMP_IMAGES: Record<Exclude<StampLevel, 'rest'>, string> = {
  good:    '/stamps/stamp-good.png',
  try:     '/stamps/stamp-try.png',
  perfect: '/stamps/stamp-perfect.png',
};

export default function StampSvg({ level, size = 64 }: StampSvgProps) {
  if (level === 'rest') {
    return <RestStamp size={size} />;
  }

  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STAMP_IMAGES[level]}
        alt={level === 'good' ? 'がんばったね！' : level === 'perfect' ? 'カンペキ！' : 'がんばろう！'}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

// おやすみ用（グレー・SVG）
function RestStamp({ size }: { size: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const ro = s * 0.46;
  const c1 = '#BBBBBB', bg = '#F5F5F5';
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={ro} fill={bg} stroke={c1} strokeWidth={s * 0.03}/>
      <circle cx={cx} cy={cy} r={ro * 0.78} fill="#FFF" stroke={c1} strokeWidth={s * 0.015}
        strokeDasharray={`${s * 0.02} ${s * 0.015}`}/>
      <circle cx={cx} cy={cy + s * 0.02} r={ro * 0.52} fill="#E8E8E8"/>
      <ellipse cx={cx - s * 0.1} cy={cy - s * 0.02} rx={s * 0.038} ry={s * 0.042} fill="#AAAAAA"/>
      <ellipse cx={cx + s * 0.1} cy={cy - s * 0.02} rx={s * 0.038} ry={s * 0.042} fill="#AAAAAA"/>
      <path d={`M${cx - s*0.09} ${cy + s*0.08} Q${cx} ${cy + s*0.115} ${cx + s*0.09} ${cy + s*0.08}`}
        stroke="#AAAAAA" strokeWidth={s * 0.028} strokeLinecap="round" fill="none"/>
    </svg>
  );
}
