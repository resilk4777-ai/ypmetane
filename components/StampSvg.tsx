'use client';

export type StampLevel = 'perfect' | 'good' | 'try' | 'rest';

interface StampSvgProps {
  level: StampLevel;
  size?: number;
}

export default function StampSvg({ level, size = 64 }: StampSvgProps) {
  if (level === 'good')    return <GoodStamp    size={size} />;
  if (level === 'perfect') return <PerfectStamp size={size} />;
  if (level === 'try')     return <TryStamp     size={size} />;
  return <RestStamp size={size} />;
}

// ─────────────────────────────────────────────
//  共通：顔パーツ
// ─────────────────────────────────────────────
function Face({
  cx, cy, r,
  skinColor = '#FFD9B0',
  hairColor = '#7B4F2E',
  eyeColor  = '#3A2010',
  cheekColor = '#F0A0A0',
  hasCrown  = false,
  crownColor = '#F5C842',
  mouthCurve = 8,   // 正:笑顔, 負:困り顔
}: {
  cx: number; cy: number; r: number;
  skinColor?: string; hairColor?: string; eyeColor?: string;
  cheekColor?: string; hasCrown?: boolean; crownColor?: string;
  mouthCurve?: number;
}) {
  const hr  = r * 0.85;  // 顔円
  const eyeR = r * 0.12;
  const ey   = cy - r * 0.04;          // 目のY位置
  const ex   = r * 0.32;               // 目のX距離
  const ckR  = r * 0.2;                // ほっぺ半径
  const ckX  = r * 0.52;
  const ckY  = cy + r * 0.16;

  // 髪トップ
  const hairTopY = cy - hr * 0.72;

  return (
    <g>
      {/* 髪（後ろ） */}
      <ellipse cx={cx} cy={hairTopY} rx={hr * 0.72} ry={hr * 0.55} fill={hairColor}/>
      {/* 横髪ふくらみ */}
      <ellipse cx={cx - hr * 0.78} cy={cy - hr * 0.12} rx={hr * 0.28} ry={hr * 0.32} fill={hairColor}/>
      <ellipse cx={cx + hr * 0.78} cy={cy - hr * 0.12} rx={hr * 0.28} ry={hr * 0.32} fill={hairColor}/>

      {/* 顔（肌） */}
      <circle cx={cx} cy={cy} r={hr} fill={skinColor}/>

      {/* 王冠 */}
      {hasCrown && (
        <>
          <path
            d={`M${cx - hr * 0.55} ${cy - hr * 0.82}
               L${cx - hr * 0.32} ${cy - hr * 1.12}
               L${cx}              ${cy - hr * 0.88}
               L${cx + hr * 0.32} ${cy - hr * 1.12}
               L${cx + hr * 0.55} ${cy - hr * 0.82} Z`}
            fill={crownColor} stroke="#D4A020" strokeWidth={hr * 0.04}
          />
          <circle cx={cx - hr * 0.32} cy={cy - hr * 1.12} r={hr * 0.07} fill="white" opacity="0.8"/>
          <circle cx={cx}             cy={cy - hr * 0.88}  r={hr * 0.07} fill="white" opacity="0.8"/>
          <circle cx={cx + hr * 0.32} cy={cy - hr * 1.12} r={hr * 0.07} fill="white" opacity="0.8"/>
        </>
      )}

      {/* 目 */}
      <ellipse cx={cx - ex} cy={ey} rx={eyeR} ry={eyeR * 1.15} fill={eyeColor}/>
      <ellipse cx={cx + ex} cy={ey} rx={eyeR} ry={eyeR * 1.15} fill={eyeColor}/>
      {/* 目のハイライト */}
      <circle cx={cx - ex + eyeR * 0.5} cy={ey - eyeR * 0.5} r={eyeR * 0.35} fill="white" opacity="0.9"/>
      <circle cx={cx + ex + eyeR * 0.5} cy={ey - eyeR * 0.5} r={eyeR * 0.35} fill="white" opacity="0.9"/>

      {/* ほっぺ */}
      <ellipse cx={cx - ckX} cy={ckY} rx={ckR * 1.1} ry={ckR * 0.7} fill={cheekColor} opacity="0.55"/>
      <ellipse cx={cx + ckX} cy={ckY} rx={ckR * 1.1} ry={ckR * 0.7} fill={cheekColor} opacity="0.55"/>

      {/* 口 */}
      <path
        d={`M${cx - r * 0.3} ${cy + r * 0.22}
           Q${cx} ${cy + r * 0.22 + mouthCurve * r * 0.01} ${cx + r * 0.3} ${cy + r * 0.22}`}
        stroke={eyeColor} strokeWidth={r * 0.07} strokeLinecap="round" fill="none"
      />
    </g>
  );
}

// ─────────────────────────────────────────────
//  がんばったね！ (緑)
// ─────────────────────────────────────────────
function GoodStamp({ size }: { size: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const ro = s * 0.47;  // 外円
  const ri = s * 0.38;  // 内円(顔)
  const c1 = '#4AAE5A', c2 = '#6FC87A', bg = '#E8F8EC';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display:'block' }}>
      {/* 外リング背景 */}
      <circle cx={cx} cy={cy} r={ro} fill={bg} stroke={c1} strokeWidth={s * 0.04}/>
      {/* 内側点線リング */}
      <circle cx={cx} cy={cy} r={ro * 0.82} fill="none" stroke={c2} strokeWidth={s * 0.015} strokeDasharray={`${s*0.025} ${s*0.018}`}/>
      {/* ★ デコ */}
      {[30, 90, 150, 210, 270, 330].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const r2 = ro * 0.91;
        return <text key={deg} x={cx + r2 * Math.cos(a) - s*0.018} y={cy + r2 * Math.sin(a) + s*0.018}
                  fontSize={s * 0.06} fill={c1} opacity="0.7">★</text>;
      })}
      {/* 曲線テキスト */}
      <path id={`arc-g-${s}`} d={`M${cx - ro*0.72},${cy} A${ro*0.72},${ro*0.72} 0 1 1 ${cx + ro*0.72},${cy}`} fill="none"/>
      <text fontWeight="bold" fill={c1} fontSize={s * 0.1}>
        <textPath href={`#arc-g-${s}`} startOffset="8%">がんばったね！</textPath>
      </text>
      {/* 顔 */}
      <Face cx={cx} cy={cy + s*0.03} r={ri} skinColor="#FFE0B8" hairColor="#7B4F2E"
            eyeColor="#3A2010" cheekColor="#F09090" mouthCurve={10}/>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  がんばろう！ (オレンジ)
// ─────────────────────────────────────────────
function TryStamp({ size }: { size: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const ro = s * 0.47;
  const ri = s * 0.38;
  const c1 = '#C84040', c2 = '#E07070', bg = '#FFF0EE';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display:'block' }}>
      <circle cx={cx} cy={cy} r={ro} fill={bg} stroke={c1} strokeWidth={s * 0.04} strokeDasharray={`${s*0.04} ${s*0.025}`}/>
      <circle cx={cx} cy={cy} r={ro * 0.82} fill="none" stroke={c2} strokeWidth={s * 0.015}/>
      {/* 曲線テキスト */}
      <path id={`arc-t-${s}`} d={`M${cx - ro*0.72},${cy} A${ro*0.72},${ro*0.72} 0 1 1 ${cx + ro*0.72},${cy}`} fill="none"/>
      <text fontWeight="bold" fill={c1} fontSize={s * 0.1}>
        <textPath href={`#arc-t-${s}`} startOffset="12%">がんばろう！</textPath>
      </text>
      {/* 顔（困り顔） */}
      <Face cx={cx} cy={cy + s*0.03} r={ri} skinColor="#FFE0B8" hairColor="#A0522D"
            eyeColor="#3A2010" cheekColor="#F0A0A0" mouthCurve={-4}/>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  カンペキ！ (青)
// ─────────────────────────────────────────────
function PerfectStamp({ size }: { size: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const ro = s * 0.47;
  const ri = s * 0.36;
  const c1 = '#2B7BC7', c2 = '#5BA8F0', bg = '#EBF4FF';

  // ギザギザ（スカラップ）外枠
  const waves = 14;
  const wavePoints: string[] = [];
  for (let i = 0; i <= waves * 4; i++) {
    const angle = (i / (waves * 4)) * Math.PI * 2 - Math.PI / 2;
    const wR = i % 2 === 0 ? ro : ro * 0.87;
    wavePoints.push(`${cx + wR * Math.cos(angle)},${cy + wR * Math.sin(angle)}`);
  }
  const wavePath = 'M ' + wavePoints.join(' L ') + ' Z';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display:'block' }}>
      {/* スカラップ外枠 */}
      <path d={wavePath} fill={bg} stroke={c1} strokeWidth={s * 0.025} strokeLinejoin="round"/>
      {/* 内リング */}
      <circle cx={cx} cy={cy} r={ro * 0.78} fill="none" stroke={c2} strokeWidth={s * 0.015}/>
      {/* 曲線テキスト */}
      <path id={`arc-p-${s}`} d={`M${cx - ro*0.68},${cy} A${ro*0.68},${ro*0.68} 0 1 1 ${cx + ro*0.68},${cy}`} fill="none"/>
      <text fontWeight="bold" fill={c1} fontSize={s * 0.105}>
        <textPath href={`#arc-p-${s}`} startOffset="16%">カンペキ！</textPath>
      </text>
      {/* ✦ デコ */}
      {[-60, 0, 60].map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const r2 = ro * 0.6;
        return <text key={deg} x={cx + r2 * Math.cos(a) - s*0.02} y={cy + r2 * Math.sin(a) + s*0.02}
                  fontSize={s * 0.08} fill={c2} opacity="0.6">✦</text>;
      })}
      {/* 顔 (王冠あり) */}
      <Face cx={cx} cy={cy + s*0.05} r={ri} skinColor="#FFE0B8" hairColor="#7B4F2E"
            eyeColor="#3A2010" cheekColor="#F09090" hasCrown={true} crownColor="#F5C842"
            mouthCurve={14}/>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  おやすみ (グレー)
// ─────────────────────────────────────────────
function RestStamp({ size }: { size: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const ro = s * 0.46;
  const c1 = '#BBBBBB', bg = '#F5F5F5';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display:'block' }}>
      <circle cx={cx} cy={cy} r={ro} fill={bg} stroke={c1} strokeWidth={s * 0.03}/>
      <circle cx={cx} cy={cy} r={ro * 0.8} fill="#FFFFFF" stroke={c1} strokeWidth={s*0.015} strokeDasharray={`${s*0.02} ${s*0.015}`}/>
      {/* グレー顔 */}
      <circle cx={cx} cy={cy + s*0.02} r={ro * 0.55} fill="#E0E0E0"/>
      <ellipse cx={cx - s*0.11} cy={cy - s*0.02} rx={s*0.04} ry={s*0.045} fill="#999"/>
      <ellipse cx={cx + s*0.11} cy={cy - s*0.02} rx={s*0.04} ry={s*0.045} fill="#999"/>
      <path d={`M${cx-s*0.1} ${cy+s*0.08} Q${cx} ${cy+s*0.11} ${cx+s*0.1} ${cy+s*0.08}`}
        stroke="#999" strokeWidth={s*0.03} strokeLinecap="round" fill="none"/>
    </svg>
  );
}
