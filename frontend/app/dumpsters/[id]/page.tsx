'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import type { Dumpster } from '../../../lib/types';

export default function EditDumpsterPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dumpster, setDumpster] = useState<Dumpster | null>(null);

  const [serial, setSerial] = useState('');
  const [color, setColor] = useState('');

  const canSave = useMemo(() => {
    return !saving && serial.trim().length > 0 && color.trim().length > 0;
  }, [saving, serial, color]);

  async function load() {
    if (!id || Number.isNaN(id)) {
      toast.error('ID inválido.');
      router.push('/dumpsters');
      return;
    }

    setLoading(true);
    try {
      const d = await api<Dumpster>(`/dumpsters/${id}`);
      setDumpster(d);
      setSerial(d.serial ?? '');
      setColor(d.color ?? '');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao carregar caçamba.');
      router.push('/dumpsters');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const updated = await api<Dumpster>(`/dumpsters/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          serial: serial.trim(),
          color: color.trim(),
        }),
      });

      setDumpster(updated);
      toast.success('Caçamba atualizada com sucesso.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao atualizar caçamba.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border p-6 shadow-sm">Carregando...</div>
        </div>
      </main>
    );
  }

  if (!dumpster) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Editar caçamba</h1>
            <p className="text-sm text-neutral-500">
              <span className={dumpster.isRented ? 'text-amber-700' : 'text-emerald-700'}>
                {dumpster.isRented ? 'Alugada' : 'Disponível'}
              </span>
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
          <form onSubmit={onSave} className="space-y-5">
            <div>
              <label className="block text-xs text-neutral-500 mb-2">Número de série</label>
              <input
                className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Ex: CA-0001"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-2">Cor</label>
              <input
                className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ex: Verde"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>

              <Link
                href={`/dumpsters/${dumpster.id}/rent`}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm ${
                  dumpster.isRented
                    ? 'bg-amber-700 cursor-not-allowed pointer-events-none'
                    : 'bg-cyan-600 hover:opacity-95'
                }`}
                title={dumpster.isRented ? 'Caçamba já está alugada' : 'Alugar caçamba'}
              >
                Alugar
              </Link>

              <Link
                href={`/dumpsters/${dumpster.id}/rentals`}
                className="rounded-full border px-6 py-2.5 text-sm font-semibold hover:bg-neutral-50"
              >
                Histórico
              </Link>
            </div>

            {dumpster.isRented && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Esta caçamba está alugada. Para alugar novamente, finalize o aluguel atual.
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}