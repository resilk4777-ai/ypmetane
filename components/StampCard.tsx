'use client';

import type { StampDefinition } from '@/types/stamp';

interface StampCardProps {
  definition: StampDefinition;
  acquired: boolean;
  acquiredAt?: string;
}

export default function StampCard({ definition, acquired, acquiredAt }: StampCardProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
        acquired
          ? 'border-amber-200 bg-amber-50 shadow-sm'
          : 'border-gray-100 bg-gray-50 opacity-40'
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 ${
          acquired ? 'border-amber-300 bg-white shadow' : 'border-gray-200 bg-white'
        }`}
        style={acquired ? { boxShadow: `0 0 0 2px ${definition.color}33` } : {}}
      >
        {definition.emoji}
      </div>
      <p className="text-xs font-semibold text-gray-700 text-center leading-tight">
        {definition.name}
      </p>
      {acquired && acquiredAt && (
        <p className="text-xs text-gray-400">
          {new Date(acquiredAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}
