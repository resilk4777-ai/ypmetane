'use client';

interface BottomActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export default function BottomActionButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: BottomActionButtonProps) {
  const base =
    'w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';
  const variants = {
    primary: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
}
