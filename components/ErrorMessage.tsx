'use client';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
      <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
      <p className="text-sm text-red-700 flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-300 hover:text-red-500 shrink-0">
          ✕
        </button>
      )}
    </div>
  );
}
