export type OcrStatus =
  | 'idle'
  | 'preprocessing'
  | 'recognizing'
  | 'postprocessing'
  | 'done'
  | 'error';

export interface OcrWord {
  text: string;
  confidence: number;
}

export interface OcrLine {
  text: string;
  words: OcrWord[];
  confidence: number;
}

export interface OcrResult {
  status: OcrStatus;
  text: string;
  lines: OcrLine[];
  confidence: number;
  errorMessage?: string;
}

export interface OcrProgressEvent {
  status: OcrStatus;
  progress: number; // 0〜1
  message: string;
}

/** OCRプロバイダーの抽象インターフェース（将来的な差し替えのため） */
export interface OcrProvider {
  recognize(
    imageData: ImageData | HTMLCanvasElement | string,
    onProgress?: (event: OcrProgressEvent) => void
  ): Promise<OcrResult>;
}
