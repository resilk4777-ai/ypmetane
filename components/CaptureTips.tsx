'use client';

const TIPS = [
  { icon: '☀️', text: '明るい場所で撮ってください' },
  { icon: '📐', text: '文字がまっすぐ入るように' },
  { icon: '🚫', text: '影が入らないように' },
  { icon: '🔍', text: 'まずは横書きの文章から試してください' },
];

export default function CaptureTips() {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
      <p className="text-xs font-semibold text-amber-700 mb-3">撮影のコツ</p>
      <ul className="space-y-2">
        {TIPS.map((tip) => (
          <li key={tip.text} className="flex items-center gap-2 text-xs text-amber-700">
            <span className="shrink-0">{tip.icon}</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
