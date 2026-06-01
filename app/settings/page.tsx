'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { getSettings, saveSettings, resetAllData } from '@/lib/storage';
import { isSpeechRecognitionSupported } from '@/lib/speech';
import type { Settings } from '@/types/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    effectsEnabled: true,
    fontSize: 'large',
    lineHeight: 'relaxed',
  });
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
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    resetAllData();
    setResetConfirm(false);
    window.location.href = '/';
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="設定" backHref="/" />

      <div className="flex-1 px-4 py-4 space-y-5">
        {/* 音声認識の対応状況 */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">マイク・音声認識</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  speechSupported ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              <div>
                <p className="text-sm text-gray-700">
                  {speechSupported
                    ? 'このブラウザでは声の聞き取りが使えます'
                    : 'このブラウザでは声の聞き取りが使えない可能性があります'}
                </p>
                {!speechSupported && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Chrome や Safari の最新版をお試しください
                  </p>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 leading-relaxed">
              マイクが使えない場合は、ブラウザのアドレスバー近くの「マイク」アイコンから許可を確認してください。
            </div>
          </div>
        </section>

        {/* 効果音・演出 */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">効果音・演出</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <ToggleRow
              label="効果音"
              description="音読開始・完了時の音"
              checked={settings.soundEnabled}
              onChange={(v) => update('soundEnabled', v)}
            />
            <ToggleRow
              label="成功演出"
              description="音読完了時の紙吹雪など"
              checked={settings.effectsEnabled}
              onChange={(v) => update('effectsEnabled', v)}
            />
          </div>
        </section>

        {/* 文字サイズ */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">本文の表示</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">文字サイズ</p>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => update('fontSize', size)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      settings.fontSize === size
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">行間</p>
              <div className="flex gap-2">
                {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                  <button
                    key={lh}
                    onClick={() => update('lineHeight', lh)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      settings.lineHeight === lh
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {lh === 'normal' ? '標準' : lh === 'relaxed' ? '広め' : 'ゆったり'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* データリセット */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">データ管理</h2>
          </div>
          <div className="px-5 py-4">
            {resetConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                  本当にすべてのデータを削除しますか？この操作は元に戻せません。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-semibold active:scale-95 transition-all"
                  >
                    削除する
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 text-sm font-semibold active:scale-95 transition-all"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleReset}
                className="w-full text-red-500 bg-red-50 rounded-xl py-3 text-sm font-medium hover:bg-red-100 active:scale-95 transition-all"
              >
                すべてのデータをリセット
              </button>
            )}
          </div>
        </section>

        {saved && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
            保存しました
          </div>
        )}
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          checked ? 'bg-sky-500' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
