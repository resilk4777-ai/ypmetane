/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: (new () => SpeechRecognitionType) | undefined;
    webkitSpeechRecognition: (new () => SpeechRecognitionType) | undefined;
  }
}

type SpeechRecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechStatus =
  | 'idle'
  | 'listening'
  | 'paused'
  | 'stopped'
  | 'unsupported'
  | 'permission_denied'
  | 'error';

export interface SpeechHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onStatusChange: (status: SpeechStatus) => void;
  onError: (message: string) => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export class SpeechController {
  private recognition: SpeechRecognitionType | null = null;
  private handlers: SpeechHandlers;
  private _status: SpeechStatus = 'idle';
  private shouldRestart = false;

  constructor(handlers: SpeechHandlers) {
    this.handlers = handlers;
    this.init();
  }

  private init() {
    if (!isSpeechRecognitionSupported()) {
      this._status = 'unsupported';
      this.handlers.onStatusChange('unsupported');
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) return;

    this.recognition = new SR();
    this.recognition.lang = 'ja-JP';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        this.handlers.onResult(transcript, result.isFinal);
      }
    };

    this.recognition.onend = () => {
      if (this.shouldRestart && this._status === 'listening') {
        try {
          this.recognition?.start();
        } catch {
          // already started
        }
      } else if (this._status !== 'paused') {
        this._status = 'stopped';
        this.handlers.onStatusChange('stopped');
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        this._status = 'permission_denied';
        this.handlers.onStatusChange('permission_denied');
        this.handlers.onError('マイクの使用が許可されていません。ブラウザの設定でマイクを許可してください。');
      } else if (event.error === 'no-speech') {
        // 無音は無視
      } else if (event.error === 'aborted') {
        // 意図的な停止
      } else {
        this._status = 'error';
        this.handlers.onStatusChange('error');
        this.handlers.onError('声の聞き取りに問題が発生しました。もう一度お試しください。');
      }
    };
  }

  get status(): SpeechStatus {
    return this._status;
  }

  start() {
    if (!this.recognition) return;
    this.shouldRestart = true;
    this._status = 'listening';
    this.handlers.onStatusChange('listening');
    try {
      this.recognition.start();
    } catch {
      // already running
    }
  }

  pause() {
    if (!this.recognition) return;
    this.shouldRestart = false;
    this._status = 'paused';
    this.handlers.onStatusChange('paused');
    try {
      this.recognition.stop();
    } catch {
      // not running
    }
  }

  stop() {
    if (!this.recognition) return;
    this.shouldRestart = false;
    this._status = 'stopped';
    this.handlers.onStatusChange('stopped');
    try {
      this.recognition.stop();
    } catch {
      // not running
    }
  }

  destroy() {
    this.shouldRestart = false;
    try {
      this.recognition?.stop();
    } catch {
      // ignore
    }
    this.recognition = null;
  }
}
