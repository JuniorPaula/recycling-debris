'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-emerald-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    toast.info('Você saiu do sistema.');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/dumpsters" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-600 grid place-items-center text-white font-black">
            R
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-wide">
              <span className="text-red-500">RECICLA</span>{' '}
              <span className="text-emerald-700">ENTULHOS</span>
            </div>
            <div className="text-xs text-neutral-500">Gerenciamento de caçambas</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}