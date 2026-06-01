'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import PhotoPicker from '@/components/PhotoPicker';
import PhotoPreview from '@/components/PhotoPreview';
import OcrProgress from '@/components/OcrProgress';
import OcrResultEditor from '@/components/OcrResultEditor';
import CaptureTips from '@/components/CaptureTips';
import ErrorMessage from '@/components/ErrorMessage';
import { createPreviewUrl, revokePreviewUrl } from '@/lib/imagePreprocess';
import { recognizeTextFromImage } from '@/lib/ocr';
import { saveReadingText } from '@/lib/storage';
import { generateId } from '@/lib/date';
import type { OcrProgressEvent } from '@/types/ocr';
import Link from 'next/link';

type CaptureStep =
  | 'pick'       // 写真選択
  | 'preview'    // プレビュー確認
  | 'processing' // 読み取り中
  | 'edit'       // 結果確認・編集
  | 'saved';     // 保存完了

export default function CapturePage() {
  const router = useRouter();
  const [step, setStep] = useState<CaptureStep>('pick');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrProgress, setOcrProgress] = useState<OcrProgressEvent>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [pickError, setPickError] = useState('');
  const [ocrError, setOcrError] = useState('');

  // 編集フォーム
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedTextId, setSavedTextId] = useState('');

  const prevUrlRef = useRef('');

  // 写真選択
  const handleFileSelected = useCallback((file: File) => {
    setPickError('');
    if (prevUrlRef.current) revokePreviewUrl(prevUrlRef.current);
    const url = createPreviewUrl(file);
    prevUrlRef.current = url;
    setSelectedFile(file);
    setPreviewUrl(url);
    setStep('preview');
  }, []);

  // プレビューからOCR開始
  const handleStartOcr = useCallback(async () => {
    if (!selectedFile) return;
    setStep('processing');
    setOcrError('');
    setOcrProgress({ status: 'preprocessing', progress: 0.05, message: '写真を確認しています' });

    const result = await recognizeTextFromImage(selectedFile, (evt) => {
      setOcrProgress(evt);
    });

    if (result.status === 'error') {
      setOcrError(result.errorMessage ?? '文字をうまく読み取れませんでした');
      setStep('pick');
      return;
    }

    // 結果を編集フォームにセット
    setBody(result.text);
    if (!title) setTitle('');
    setStep('edit');
  }, [selectedFile, title]);

  // 撮り直し
  const handleRetake = useCallback(() => {
    if (prevUrlRef.current) revokePreviewUrl(prevUrlRef.current);
    prevUrlRef.current = '';
    setSelectedFile(null);
    setPreviewUrl('');
    setOcrError('');
    setPickError('');
    setBody('');
    setStep('pick');
  }, []);

  // 保存
  const handleSave = useCallback(async () => {
    if (!body.trim()) {
      setFormError('音読する文章を入力してください');
      return;
    }
    if (!title.trim()) {
      setFormError('タイトルを入力してください');
      return;
    }

    setFormError('');
    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const id = generateId();
      saveReadingText({
        id,
        title: title.trim(),
        subject: subject.trim(),
        page: page.trim(),
        body: body.trim(),
        sourceType: 'photo',
        createdAt: now,
        updatedAt: now,
      });
      setSavedTextId(id);
      setStep('saved');
    } catch {
      setFormError('保存できませんでした。もう一度お試しください');
    } finally {
      setIsSaving(false);
    }
  }, [body, title, subject, page]);

  // ステップタイトルマップ
  const stepTitles: Record<CaptureStep, string> = {
    pick: '写真から文章を登録',
    preview: '写真の確認',
    processing: '文字を読み取っています',
    edit: '読む文章を確認',
    saved: '保存しました',
  };

  const backHref: Partial<Record<CaptureStep, string>> = {
    pick: '/',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        title={stepTitles[step]}
        backHref={backHref[step]}
      />

      <div className="flex-1 px-4 py-5">
        {/* ───── STEP: pick ───── */}
        {step === 'pick' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              教科書やプリントのページを撮って、読む文章を登録できます。
              読み取り後に、文字を確認して直せます。
            </p>

            {pickError && (
              <ErrorMessage
                message={pickError}
                onDismiss={() => setPickError('')}
              />
            )}
            {ocrError && (
              <ErrorMessage
                message={ocrError}
                onDismiss={() => setOcrError('')}
              />
            )}

            <PhotoPicker
              onFileSelected={handleFileSelected}
              onError={setPickError}
            />

            <CaptureTips />

            <div className="pt-2">
              <Link
                href="/readings/new"
                className="block w-full text-center text-sm text-gray-500 py-3 hover:text-sky-500 transition-colors"
              >
                文字を入力して登録する場合はこちら
              </Link>
            </div>
          </div>
        )}

        {/* ───── STEP: preview ───── */}
        {step === 'preview' && previewUrl && (
          <PhotoPreview
            previewUrl={previewUrl}
            onConfirm={handleStartOcr}
            onRetake={handleRetake}
          />
        )}

        {/* ───── STEP: processing ───── */}
        {step === 'processing' && (
          <OcrProgress
            progress={ocrProgress.progress}
            message={ocrProgress.message}
          />
        )}

        {/* ───── STEP: edit ───── */}
        {step === 'edit' && (
          <OcrResultEditor
            title={title}
            subject={subject}
            page={page}
            body={body}
            onTitleChange={setTitle}
            onSubjectChange={setSubject}
            onPageChange={setPage}
            onBodyChange={setBody}
            onSave={handleSave}
            onRetake={handleRetake}
            isSaving={isSaving}
            error={formError}
          />
        )}

        {/* ───── STEP: saved ───── */}
        {step === 'saved' && (
          <div className="flex flex-col items-center text-center py-12 gap-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
              <span className="text-4xl">✅</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">保存しました</h2>
              <p className="text-sm text-gray-500">音読文章として登録されました</p>
            </div>
            <div className="w-full space-y-3 pt-4">
              <button
                onClick={() => router.push(`/practice?id=${savedTextId}`)}
                className="w-full bg-sky-500 text-white rounded-2xl py-4 font-semibold text-base hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
              >
                この文章で音読をはじめる
              </button>
              <button
                onClick={handleRetake}
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-4 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                続けて写真から登録する
              </button>
              <Link
                href="/"
                className="block w-full text-center text-sm text-gray-500 py-3 hover:text-sky-500 transition-colors"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
