'use client';

import Link from 'next/link';

interface AppHeaderProps {
  title: string;
  backHref?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ title, backHref, right }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#FAF7F2]">
      <div className="flex items-center h-14 px-4 max-w-md mx-auto">
        <div className="w-10">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center justify-center w-9 h-9 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
          )}
        </div>
        <h1 className="flex-1 text-center text-base font-bold text-[#4A3728] truncate px-2">
          {title}
        </h1>
        <div className="w-10 flex justify-end">{right}</div>
      </div>
    </header>
  );
}
