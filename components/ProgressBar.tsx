'use client';

interface ProgressBarProps {
  value: number;
  label?: string;
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-[#9A8070]">{label}</span>
          <span className="text-xs font-bold text-[#6AAF5A]">{clamped}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-[#EDE8DF] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6AAF5A] rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
