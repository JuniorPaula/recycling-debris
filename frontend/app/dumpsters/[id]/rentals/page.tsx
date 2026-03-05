'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import type { Dumpster, Rental } from '../../../../lib/types';

function fmtDate(isoOrDate: string | Date | null | undefined) {
  if (!isoOrDate) return '-';
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function DumpsterRentalsPage() {
  const router = useRouter();
  const params = useParams();
  const dumpsterId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [finishingId, setFinishingId] = useState<number | null>(null);

  const [dumpster, setDumpster] = useState<Dumpster | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);

  const openRental = useMemo(() => rentals.find((r) => !r.endDate), [rentals]);

  async function load() {
    if (!dumpsterId || Number.isNaN(dumpsterId)) {
      toast.error('ID inválido.');
      router.push('/dumpsters');
      return;
    }

    setLoading(true);
    try {
      const d = await api<Dumpster>(`/dumpsters/${dumpsterId}`);
      setDumpster(d);

      const list = await api<Rental[]>(`/rentals/dumpster/${dumpsterId}`);
      setRentals(list);
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao carregar histórico.');
      router.push(`/dumpsters/${dumpsterId}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dumpsterId]);

  async function finishRental(rentalId: number) {
    setFinishingId(rentalId);
    try {
      await api<Rental>(`/rentals/${rentalId}/finish`, { method: 'PATCH' });
      toast.success('Aluguel finalizado.');
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao finalizar aluguel.');
    } finally {
      setFinishingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border p-6 shadow-sm">Carregando...</div>
        </div>
      </main>
    );
  }

  if (!dumpster) return null;

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Histórico de aluguéis</h1>
            <p className="text-sm text-neutral-500">
              Serial <span className="font-mono">{dumpster.serial}</span> •{' '}
              <span className={dumpster.isRented ? 'text-amber-700' : 'text-emerald-700'}>
                {dumpster.isRented ? 'Alugada' : 'Disponível'}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/dumpsters/${dumpster.id}`}
              className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Voltar
            </Link>

            <Link
              href={`/dumpsters/${dumpster.id}/rent`}
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                dumpster.isRented
                  ? 'bg-neutral-400 cursor-not-allowed pointer-events-none'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
              title={dumpster.isRented ? 'Caçamba já está alugada' : 'Alugar caçamba'}
            >
              Alugar
            </Link>
          </div>
        </header>

        {openRental && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Existe um aluguel em aberto (ID <span className="font-mono">{openRental.id}</span>).{' '}
            Você pode finalizar aqui mesmo.
          </div>
        )}

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="text-sm font-semibold">Registros</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left px-6 py-3">ID</th>
                  <th className="text-left px-6 py-3">CEP</th>
                  <th className="text-left px-6 py-3">Endereço</th>
                  <th className="text-left px-6 py-3">Início</th>
                  <th className="text-left px-6 py-3">Fim</th>
                  <th className="text-right px-6 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {rentals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-neutral-500">
                      Nenhum aluguel encontrado para esta caçamba.
                    </td>
                  </tr>
                ) : (
                  rentals.map((r) => {
                    const isOpen = !r.endDate;
                    return (
                      <tr key={r.id} className="border-t">
                        <td className="px-6 py-4 font-mono">{r.id}</td>
                        <td className="px-6 py-4 font-mono">{r.cep}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{r.street}</div>
                          <div className="text-xs text-neutral-500">
                            {r.district} • {r.city}
                          </div>
                        </td>
                        <td className="px-6 py-4">{fmtDate(r.startDate)}</td>
                        <td className="px-6 py-4">{fmtDate(r.endDate)}</td>
                        <td className="px-6 py-4 text-right">
                          {isOpen ? (
                            <button
                              onClick={() => finishRental(r.id)}
                              disabled={finishingId === r.id}
                              className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              title="Finalizar aluguel"
                            >
                              {finishingId === r.id ? 'Finalizando...' : 'Finalizar'}
                            </button>
                          ) : (
                            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-neutral-600">
                              Finalizado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}