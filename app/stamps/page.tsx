'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import StampCard from '@/components/StampCard';
import { getStamps } from '@/lib/storage';
import { STAMP_DEFINITIONS } from '@/types/stamp';
import type { Stamp } from '@/types/stamp';

export default function StampsPage() {
  const [stamps, setStamps] = useState<Stamp[]>([]);

  useEffect(() => {
    setStamps(getStamps());
  }, []);

  const acquiredTypes = new Set(stamps.map((s) => s.type));
  const totalAcquired = acquiredTypes.size;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="スタンプ帳" backHref="/" />

      <div className="px-5 pt-5 pb-3">
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {totalAcquired} / {STAMP_DEFINITIONS.length} 種類のスタンプを集めました
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              音読を続けてスタンプを集めよう
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {STAMP_DEFINITIONS.map((def) => {
            const acquired = acquiredTypes.has(def.type);
            const latestStamp = acquired
              ? stamps
                  .filter((s) => s.type === def.type)
                  .sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime())[0]
              : undefined;

            return (
              <StampCard
                key={def.type}
                definition={def}
                acquired={acquired}
                acquiredAt={latestStamp?.acquiredAt}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
