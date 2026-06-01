'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'ホーム', icon: HomeIcon },
  { href: '/cards', label: '記録', icon: RecordIcon },
  { href: '/readings', label: '文章', icon: BookIcon },
  { href: '/stamps', label: 'スタンプ', icon: StampIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto bg-white border-t border-[#EDE8DF] shadow-lg">
        <div className="flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center gap-1 py-3 active:scale-95 transition-all"
              >
                <Icon active={active} />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: active ? '#6AAF5A' : '#B0A090' }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#6AAF5A' : '#B0A090';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? c : 'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function RecordIcon({ active }: { active: boolean }) {
  const c = active ? '#6AAF5A' : '#B0A090';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  const c = active ? '#6AAF5A' : '#B0A090';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}

function StampIcon({ active }: { active: boolean }) {
  const c = active ? '#6AAF5A' : '#B0A090';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
