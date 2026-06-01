'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import ReadingTextDisplay from '@/components/ReadingTextDisplay';
import ProgressBar from '@/components/ProgressBar';
import ErrorMessage from '@/components/ErrorMessage';
import { getReadingTextById, saveSession, getSettings } from '@/lib/storage';
import { splitIntoSegments, isSegmentMatched } from '@/lib/readingMatcher';
import { SpeechController, isSpeechRecognitionSupported } from '@/lib/speech';
import { playMicStart, playSegmentRead, resumeContext } from '@/lib/sound';
import { generateId, todayString } from '@/lib/date';
import type { ReadingText, TextSegment } from '@/types/reading';
import type { Settings } from '@/types/settings';

type PracticeState =
  | 'ready'
  | 'listening'
  | 'paused'
  | 'completed'
  | 'unsupported'
  | 'permission_denied'
  | 'error';

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const textId = searchParams.get('id');

  const [readingText, setReadingText] = useState<ReadingText | null>(null);
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [state, setState] = useState<PracticeState>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState<Settings>({ soundEnabled: true, effectsEnabled: true, fontSize: 'large', lineHeight: 'relaxed' });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');

  const speechRef = useRef<SpeechController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef(generateId());
  const accumulatedRef = useRef(0);

  // 初期化
  useEffect(() => {
    if (!textId) { router.replace('/readings'); return; }
    const text = getReadingTextById(textId);
    if (!text) { router.replace('/readings'); return; }

    const s = getSettings();
    setSettings(s);
    setReadingText(text);

    const segs = splitIntoSegments(text.body).map((t, i) => ({
      id: `seg-${i}`,
      text: t,
      state: 'unread' as const,
    }));
    setSegments(segs);

    if (!isSpeechRecognitionSupported()) {
      setState('unsupported');
    }

    return () => {
      speechRef.current?.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [textId, router]);

  const progressRate = segments.length === 0
    ? 0
    : segments.filter((s) => s.state === 'read').length / segments.length;

  const handleResult = useCallback((transcript: string, isFinal: boolean) => {
    if (!isFinal) {
      setInterimText(transcript);
      return;
    }
    setInterimText('');

    setSegments((prev) => {
      const updated = [...prev];
      let anyRead = false;

      for (let i = 0; i < updated.length; i++) {
        const seg = updated[i];
        if (seg.state === 'read') continue;

        if (isSegmentMatched(seg.text, transcript)) {
          updated[i] = { ...seg, state: 'read' };
          anyRead = true;
        } else if (seg.state === 'unread' || seg.state === 'current') {
          updated[i] = { ...seg, state: 'retry' };
        }
      }

      if (anyRead && settings.soundEnabled) {
        playSegmentRead();
      }

      // 全部読めたら完了
      const allRead = updated.every((s) => s.state === 'read');
      if (allRead) {
        setTimeout(() => setState('completed'), 200);
      }

      return updated;
    });
  }, [settings.soundEnabled]);

  function startListening() {
    resumeContext();
    if (settings.soundEnabled) playMicStart();

    speechRef.current = new SpeechController({
      onResult: handleResult,
      onStatusChange: (s) => {
        if (s === 'unsupported') setState('unsupported');
        else if (s === 'permission_denied') setState('permission_denied');
        else if (s === 'error') setState('error');
        else if (s === 'listening') setState('listening');
        else if (s === 'paused') setState('paused');
      },
      onError: (msg) => setErrorMsg(msg),
    });

    speechRef.current.start();
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setElapsedSeconds(
        accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
      );
    }, 1000);
  }

  function pauseListening() {
    speechRef.current?.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    accumulatedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
  }

  function resumeListening() {
    if (settings.soundEnabled) playMicStart();
    speechRef.current?.start();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(
        accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
      );
    }, 1000);
  }

  function stopAndSave(completed: boolean) {
    speechRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);

    const prog = segments.filter((s) => s.state === 'read').length / Math.max(segments.length, 1);

    saveSession({
      id: sessionIdRef.current,
      readingTextId: textId!,
      date: todayString(),
      durationSeconds: duration,
      completed,
      progressRate: prog,
      readSegments: segments.filter((s) => s.state === 'read').map((s) => s.id),
      stampIds: completed ? ['completed', 'well_read'] : prog >= 0.5 ? ['well_read'] : [],
      parentComment: '',
      teacherComment: '',
    });
  }

  function handleComplete() {
    stopAndSave(true);
    router.push(`/complete?sessionId=${sessionIdRef.current}&textId=${textId}`);
  }

  function handleQuit() {
    stopAndSave(false);
    router.push('/readings');
  }

  function handleReset() {
    speechRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    sessionIdRef.current = generateId();
    setState('ready');
    setSegments((prev) => prev.map((s) => ({ ...s, state: 'unread' })));
    setInterimText('');
  }

  // 完了検知
  useEffect(() => {
    if (state === 'completed' && readingText) {
      stopAndSave(true);
      router.push(`/complete?sessionId=${sessionIdRef.current}&textId=${textId}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!readingText) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        読み込み中...
      </div>
    );
  }

  const readCount = segments.filter((s) => s.state === 'read').length;
  const totalCount = segments.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((readCount / totalCount) * 100);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        title={readingText.title}
        backHref="/readings"
      />

      {/* テキスト情報 */}
      {(readingText.subject || readingText.page) && (
        <div className="flex gap-3 px-5 py-2 text-xs text-gray-500 border-b border-gray-50">
          {readingText.subject && <span>{readingText.subject}</span>}
          {readingText.page && <span>{readingText.page}ページ</span>}
        </div>
      )}

      {/* エラー */}
      {state === 'unsupported' && (
        <div className="px-4 pt-4">
          <ErrorMessage
            message="この端末またはブラウザでは声の聞き取りが使えない可能性があります。Chrome や Safari の最新版をお試しください。"
            onDismiss={() => setState('ready')}
          />
        </div>
      )}
      {state === 'permission_denied' && (
        <div className="px-4 pt-4">
          <ErrorMessage
            message="マイクが使えません。ブラウザの設定でマイクを許可してください。"
            onDismiss={() => setState('ready')}
          />
        </div>
      )}
      {state === 'error' && errorMsg && (
        <div className="px-4 pt-4">
          <ErrorMessage
            message={errorMsg}
            onDismiss={() => { setErrorMsg(''); setState('ready'); }}
          />
        </div>
      )}

      {/* 音声認識中インジケーター */}
      {state === 'listening' && (
        <div className="flex items-center gap-2 px-5 py-2 bg-sky-50 border-b border-sky-100">
          <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
          <span className="text-xs text-sky-600 font-medium">声を聞きとっています</span>
          {interimText && (
            <span className="text-xs text-sky-400 truncate max-w-48">「{interimText}」</span>
          )}
        </div>
      )}
      {state === 'paused' && (
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-50 border-b border-amber-100">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs text-amber-600 font-medium">一時停止中</span>
        </div>
      )}

      {/* プログレス */}
      <div className="px-5 py-3 border-b border-gray-50">
        <ProgressBar value={progressPct} label={`読めた部分 ${readCount}/${totalCount}`} />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>経過時間 {formatTime(elapsedSeconds)}</span>
          <span>{progressPct}% 読めました</span>
        </div>
      </div>

      {/* 本文表示 */}
      <div className="flex-1 overflow-y-auto">
        <ReadingTextDisplay segments={segments} settings={settings} />
      </div>

      {/* 色の凡例 */}
      <div className="flex gap-4 px-5 py-2 border-t border-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-emerald-500 rounded-full" />読めた
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-amber-400 rounded-full" />もう一度
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-300 rounded-full" />これから
        </span>
      </div>

      {/* ボタンエリア */}
      <div className="px-4 py-4 space-y-2 border-t border-gray-100 bg-white">
        {state === 'ready' && (
          <>
            <button
              onClick={startListening}
              className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
            >
              マイクをオンにする
            </button>
            <button
              onClick={handleQuit}
              className="w-full bg-gray-100 text-gray-500 rounded-2xl py-3 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
            >
              音読をやめる
            </button>
          </>
        )}

        {state === 'listening' && (
          <>
            <button
              onClick={pauseListening}
              className="w-full bg-amber-400 text-white rounded-2xl py-4 font-semibold text-base hover:bg-amber-500 active:scale-95 transition-all shadow-sm"
            >
              一時停止
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReset}
                className="bg-gray-100 text-gray-600 rounded-2xl py-3 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                もう一度読む
              </button>
              <button
                onClick={handleQuit}
                className="bg-gray-100 text-gray-500 rounded-2xl py-3 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                音読をやめる
              </button>
            </div>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={resumeListening}
              className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
            >
              音読を再開する
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReset}
                className="bg-gray-100 text-gray-600 rounded-2xl py-3 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                もう一度読む
              </button>
              <button
                onClick={handleQuit}
                className="bg-gray-100 text-gray-500 rounded-2xl py-3 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                音読をやめる
              </button>
            </div>
          </>
        )}

        {(state === 'unsupported' || state === 'permission_denied' || state === 'error') && (
          <>
            <button
              onClick={startListening}
              className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
            >
              もう一度試す
            </button>
            <button
              onClick={handleQuit}
              className="w-full bg-gray-100 text-gray-500 rounded-2xl py-3 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
            >
              もどる
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
