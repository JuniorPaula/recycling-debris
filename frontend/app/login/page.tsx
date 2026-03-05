'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

function TrashLogo() {
  return (
    <svg width="90" height="90" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path
        d="M32 36h56v64c0 6-5 11-11 11H43c-6 0-11-5-11-11V36Z"
        fill="#4E8A63"
      />
      <path
        d="M26 30c0-4 3-7 7-7h54c4 0 7 3 7 7v6H26v-6Z"
        fill="#4E8A63"
      />
      <path d="M44 48h8v52h-8V48Zm24 0h8v52h-8V48Z" fill="#F5F7F6" opacity="0.9" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && pass.trim().length > 0 && !loading;
  }, [email, pass, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      localStorage.setItem('auth_token', 'dev-token');
      localStorage.setItem('auth_email', email.trim());

      router.push('/dumpsters');
    } catch {
      setError('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <TrashLogo />
        </div>

        <div className="mt-2 mb-4 text-xl font-extrabold tracking-wide">
          <span className="text-red-600">RECICLA</span>{' '}
          <span className="text-green-700">ENTULHOS</span>
        </div>


        <form onSubmit={onSubmit} className="mt-8 space-y-4 text-left">
          <div className="mt-3">
            <h1 className="mt-8 text-green-700 font-semibold text-lg">
              Entre com sua conta
            </h1>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-green-700 mb-2 pl-5">Usuário</label>
            <input
              className="w-full rounded-full bg-gray-100 px-5 py-3 outline-none ring-0 border border-transparent focus:border-green-400/40"
              placeholder="E-mail de acesso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="mt-3">
            <label className="block text-xs text-green-700 mb-2 pl-5">Senha</label>
            <input
              type="password"
              className="w-full rounded-full bg-gray-100 px-5 py-3 outline-none ring-0 border border-transparent focus:border-green-400/40"
              placeholder="********"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-brand-green px-10 py-3 text-white font-semibold shadow-soft disabled:opacity-60 disabled:cursor-not-allowed hover:bg-brand-greenDark transition"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              <span className="text-white/90 text-lg tracking-wide group-hover:translate-x-0.5 transition">
                &raquo;&raquo;
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}