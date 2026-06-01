/**
 * OCR処理
 * - 現在は Tesseract.js (ブラウザ内OCR) を使用
 * - OcrProvider インターフェースを実装することで、将来的に
 *   Google Cloud Vision API や Gemini Vision API に差し替え可能
 */

import type { OcrResult, OcrProgressEvent, OcrProvider } from '@/types/ocr';
import { preprocessImage, isImageFile, MAX_IMAGE_SIZE_BYTES } from '@/lib/imagePreprocess';

// ─────────────────────────────────────────────
// Tesseract.js プロバイダー実装
// ─────────────────────────────────────────────

class TesseractProvider implements OcrProvider {
  async recognize(
    source: HTMLCanvasElement | string,
    onProgress?: (event: OcrProgressEvent) => void
  ): Promise<OcrResult> {
    // Dynamic import でバンドルを遅延読み込み
    const { createWorker } = await import('tesseract.js');

    onProgress?.({ status: 'recognizing', progress: 0.1, message: '準備しています' });

    const worker = await createWorker('jpn', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text') {
          onProgress?.({
            status: 'recognizing',
            progress: 0.2 + m.progress * 0.7,
            message: '文字を読み取っています',
          });
        }
      },
    });

    try {
      onProgress?.({ status: 'recognizing', progress: 0.2, message: '文字を確認しています' });

      const result = await worker.recognize(source);
      const { data } = result;

      onProgress?.({ status: 'postprocessing', progress: 0.95, message: '文章を整えています' });

      // blocks -> paragraphs -> lines の構造からフラットなline一覧を抽出
      const rawLines = (data.blocks ?? []).flatMap((block) =>
        (block.paragraphs ?? []).flatMap((para) =>
          (para.lines ?? []).map((line) => ({
            text: line.text.replace(/\n$/, ''),
            confidence: line.confidence,
            words: (line.words ?? []).map((w) => ({
              text: w.text,
              confidence: w.confidence,
            })),
          }))
        )
      );

      const lines = rawLines;
      const text = postProcessJapanese(data.text ?? '');

      onProgress?.({ status: 'done', progress: 1, message: '読み取り完了' });

      return {
        status: 'done',
        text,
        lines,
        confidence: data.confidence ?? 0,
      };
    } finally {
      await worker.terminate();
    }
  }
}

// ─────────────────────────────────────────────
// 日本語後処理
// ─────────────────────────────────────────────

function postProcessJapanese(raw: string): string {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    // 記号だけの行を除去
    .filter((line) => /[^\s\-_=|・　]+/.test(line))
    .join('\n');
}

// ─────────────────────────────────────────────
// パブリックAPI
// ─────────────────────────────────────────────

const provider: OcrProvider = new TesseractProvider();

/** 使用するプロバイダーを差し替え（将来の拡張用） */
export function setOcrProvider(p: OcrProvider): void {
  (recognizeTextFromImage as unknown as { _provider: OcrProvider })._provider = p;
}

export async function recognizeTextFromImage(
  file: File,
  onProgress?: (event: OcrProgressEvent) => void
): Promise<OcrResult> {
  // ファイル検証
  if (!isImageFile(file)) {
    return {
      status: 'error',
      text: '',
      lines: [],
      confidence: 0,
      errorMessage: '画像ファイルを選んでください',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      status: 'error',
      text: '',
      lines: [],
      confidence: 0,
      errorMessage: '写真が大きすぎます。別の写真をお試しください',
    };
  }

  try {
    onProgress?.({ status: 'preprocessing', progress: 0.05, message: '写真を確認しています' });

    const { canvas } = await preprocessImage(file);

    const result = await provider.recognize(canvas, onProgress);
    return result;
  } catch (err) {
    console.error('[OCR] error:', err);
    return {
      status: 'error',
      text: '',
      lines: [],
      confidence: 0,
      errorMessage: '文字をうまく読み取れませんでした。写真を明るい場所で撮り直してください',
    };
  }
}
