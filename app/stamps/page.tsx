'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { getStamps } from '@/lib/storage';
import { STAMP_DEFINITIONS } from '@/types/stamp';
import type { Stamp } from '@/types/stamp';

export default function StampsPage() {
  const [stamps, setStamps] = useState<Stamp[]>([]);

  useEffect(() => { setStamps(getStamps()); }, []);

  const acquiredTypes = new Set(stamps.map((s) => s.type));

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <AppHeader title="スタンプ帳" backHref="/" />

      <div className="px-4 pt-3 pb-2">
        <div className="bg-[#FDF3CC] rounded-3xl px-5 py-4 flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <p className="text-sm font-bold text-[#8A6A20]">
              {acquiredTypes.size} / {STAMP_DEFINITIONS.length} 種類のスタンプ
            </p>
            <p className="text-xs text-[#B89040] mt-0.5">音読を続けてスタンプを集めよう</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {STAMP_DEFINITIONS.map((def) => {
            const acquired = acquiredTypes.has(def.type);
            const latest = acquired
              ? stamps.filter((s) => s.type === def.type).sort((a, b) =>
                  new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime())[0]
              : undefined;
            return (
              <div
                key={def.type}
                className={`flex flex-col items-center gap-2 p-3 rounded-3xl border-2 transition-all ${
                  acquired ? 'border-[#F5D98A] bg-[#FFFBF0] shadow-sm' : 'border-[#EDE8DF] bg-white opacity-40'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl border-4 ${
                  acquired ? 'border-[#F5D98A] bg-white shadow-sm' : 'border-[#EDE8DF] bg-white'
                }`}>
                  {def.emoji}
                </div>
                <p className="text-xs font-bold text-[#4A3728] text-center leading-tight">{def.name}</p>
                {acquired && latest && (
                  <p className="text-[10px] text-[#9A8070]">
                    {new Date(latest.acquiredAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
