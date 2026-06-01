'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  backHref?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ title, backHref, right }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
        <div className="w-10">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={22} className="text-gray-600" />
            </Link>
          )}
        </div>
        <h1 className="flex-1 text-center text-base font-semibold text-gray-800 truncate px-2">
          {title}
        </h1>
        <div className="w-10 flex justify-end">{right}</div>
      </div>
    </header>
  );
}
