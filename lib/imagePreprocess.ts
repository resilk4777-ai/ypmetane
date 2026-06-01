/**
 * 画像前処理ユーティリティ
 * 将来的にグレースケール化・傾き補正・トリミングを追加しやすくするための分離
 */

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_CANVAS_DIMENSION = 2400; // OCRに適した最大辺長

export interface PreprocessResult {
  canvas: HTMLCanvasElement;
  originalWidth: number;
  originalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
  previewUrl: string;
}

/**
 * File から canvas に画像を読み込み、必要に応じてリサイズする
 */
export async function preprocessImage(file: File): Promise<PreprocessResult> {
  const bitmap = await createImageBitmap(file);
  const { width: ow, height: oh } = bitmap;

  // リサイズ比率計算
  const scale = Math.min(1, MAX_CANVAS_DIMENSION / Math.max(ow, oh));
  const sw = Math.round(ow * scale);
  const sh = Math.round(oh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // 白背景を敷いてから描画（PNG透過対策）
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sw, sh);
  ctx.drawImage(bitmap, 0, 0, sw, sh);
  bitmap.close();

  const previewUrl = canvas.toDataURL('image/jpeg', 0.85);

  return { canvas, originalWidth: ow, originalHeight: oh, scaledWidth: sw, scaledHeight: sh, previewUrl };
}

/**
 * プレビュー用の DataURL を File から生成（前処理なし）
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * ObjectURL を解放する
 */
export function revokePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

/**
 * ファイルが画像かチェック
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
