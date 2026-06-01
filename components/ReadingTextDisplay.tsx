'use client';

import type { TextSegment } from '@/types/reading';
import type { Settings } from '@/types/settings';

interface ReadingTextDisplayProps {
  segments: TextSegment[];
  settings: Settings;
}

const stateStyles: Record<string, string> = {
  unread: 'text-[#3D2B1F]',
  current: 'text-[#3D2B1F] bg-[#FDF3CC] rounded px-0.5',
  read: 'text-[#4A7C40]',
  retry: 'text-[#D4875A]',
};

const fontSizeMap = {
  small: 'text-xl leading-loose',
  medium: 'text-2xl leading-loose',
  large: 'text-3xl leading-loose',
};

const lineHeightMap = {
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
};

export default function ReadingTextDisplay({ segments, settings }: ReadingTextDisplayProps) {
  const fontSize = fontSizeMap[settings.fontSize];
  const lineHeight = lineHeightMap[settings.lineHeight];

  return (
    <div
      className={`font-bold tracking-wider ${fontSize} ${lineHeight} p-4 select-none`}
      style={{ wordBreak: 'break-all' }}
    >
      {segments.map((seg) => (
        <span
          key={seg.id}
          className={`transition-colors duration-300 ${stateStyles[seg.state]}`}
        >
          {seg.text}
        </span>
      ))}
    </div>
  );
}
