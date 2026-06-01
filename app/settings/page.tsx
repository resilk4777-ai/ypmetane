'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { getSettings, saveSettings, resetAllData } from '@/lib/storage';
import { isSpeechRecognitionSupported } from '@/lib/speech';
import type { Settings } from '@/types/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ soundEnabled: true, effectsEnabled: true, fontSize: 'large', lineHeight: 'relaxed' });
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return; }
    resetAllData();
    window.location.href = '/';
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <AppHeader title="設定" backHref="/" />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* マイク */}
        <Section title="マイク・音声認識">
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${speechSupported ? 'bg-[#6AAF5A]' : 'bg-red-400'}`} />
              <p className="text-sm text-[#4A3728]">
                {speechSupported ? 'このブラウザでは声の聞き取りが使えます' : '声の聞き取りが使えない可能性があります'}
              </p>
            </div>
            {!speechSupported && (
              <p className="text-xs text-[#9A8070] bg-[#FAF7F2] rounded-2xl p-3 leading-relaxed">
                Chrome や Safari の最新版をお試しください
              </p>
            )}
          </div>
        </Section>

        {/* 効果音 */}
        <Section title="効果音・演出">
          <ToggleRow label="効果音" desc="音読開始・完了時の音" checked={settings.soundEnabled} onChange={(v) => update('soundEnabled', v)} />
          <ToggleRow label="成功演出" desc="音読完了時の紙吹雪など" checked={settings.effectsEnabled} onChange={(v) => update('effectsEnabled', v)} />
        </Section>

        {/* 表示 */}
        <Section title="本文の表示">
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-[#4A3728] mb-2">文字サイズ</p>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((s) => (
                  <button key={s} onClick={() => update('fontSize', s)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${settings.fontSize === s ? 'bg-[#6AAF5A] text-white' : 'bg-[#FAF7F2] text-[#9A8070]'}`}>
                    {s === 'small' ? '小' : s === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#4A3728] mb-2">行間</p>
              <div className="flex gap-2">
                {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                  <button key={lh} onClick={() => update('lineHeight', lh)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${settings.lineHeight === lh ? 'bg-[#6AAF5A] text-white' : 'bg-[#FAF7F2] text-[#9A8070]'}`}>
                    {lh === 'normal' ? '標準' : lh === 'relaxed' ? '広め' : 'ゆったり'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* リセット */}
        <Section title="データ管理">
          <div className="px-5 py-4">
            {resetConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">すべてのデータを削除しますか？元に戻せません。</p>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="flex-1 bg-red-500 text-white rounded-2xl py-3 text-sm font-bold active:scale-95 transition-all">削除する</button>
                  <button onClick={() => setResetConfirm(false)} className="flex-1 bg-[#FAF7F2] text-[#9A8070] rounded-2xl py-3 text-sm font-bold active:scale-95 transition-all">キャンセル</button>
                </div>
              </div>
            ) : (
              <button onClick={handleReset} className="w-full text-red-500 bg-red-50 rounded-2xl py-3 text-sm font-medium hover:bg-red-100 active:scale-95 transition-all">
                すべてのデータをリセット
              </button>
            )}
          </div>
        </Section>
      </div>

      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#4A3728] text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
          保存しました
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 bg-[#FAF7F2] border-b border-[#EDE8DF]">
        <p className="text-xs font-bold text-[#9A8070] uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#FAF7F2] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#4A3728]">{label}</p>
        {desc && <p className="text-xs text-[#9A8070] mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-[#6AAF5A]' : 'bg-[#EDE8DF]'}`}
        role="switch" aria-checked={checked}>
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
