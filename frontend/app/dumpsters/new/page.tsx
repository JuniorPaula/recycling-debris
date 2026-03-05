'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Dumpster } from '../../../lib/types';
import { toast } from 'react-toastify';

export default function NewDumpsterPage() {
  const router = useRouter();

  const [serial, setSerial] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return serial.trim().length > 0 && color.trim().length > 0 && !loading;
  }, [serial, color, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api<Dumpster>('/dumpsters', {
        method: 'POST',
        body: JSON.stringify({
          serial: serial.trim(),
          color: color.trim(),
        }),
      });

      toast.success('Caçamba cadastrada com sucesso!');
      router.push('/dumpsters');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao cadastrar caçamba.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nova caçamba</h1>
            <p className="text-sm text-neutral-500">
              Cadastre uma caçamba com número de série único.
            </p>
          </div>

          <Link
            href="/dumpsters"
            className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Voltar
          </Link>
        </header>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-neutral-500 mb-2">
                Número de série
              </label>
              <input
                className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                placeholder="Ex: CA-0001"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
              <p className="mt-2 text-xs text-neutral-400">
                Deve ser único. Use um padrão consistente (ex: CA-0001).
              </p>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-2">Cor</label>
              <input
                className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                placeholder="Ex: Verde"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/dumpsters"
                className="rounded-full border px-5 py-2.5 text-sm hover:bg-neutral-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>

        <footer className="text-xs text-neutral-400">
          Endpoint: <code>POST /api/dumpsters</code>
        </footer>
      </div>
    </main>
  );
}