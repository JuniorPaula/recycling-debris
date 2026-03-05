'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Dumpster } from '../../lib/types';

export default function DumpstersPage() {
  const [serial, setSerial] = useState('');
  const [status, setStatus] = useState<'all' | 'available' | 'rented'>('all');

  const [data, setData] = useState<Dumpster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const qs = new URLSearchParams();
    if (serial.trim()) qs.set('serial', serial.trim());
    if (status !== 'all') qs.set('status', status);
    const s = qs.toString();
    return s ? `?${s}` : '';
  }, [serial, status]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api<Dumpster[]>(`/dumpsters${query}`);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao buscar caçambas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Caçambas</h1>
            <p className="text-sm text-muted-foreground">
              Filtre por serial ou status (alugada / disponível).
            </p>
          </div>

          <Link
            href="/dumpsters/new"
            className="rounded-md bg-green-700 px-4 py-2 text-white"
          >
            Nova caçamba
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Filtrar por serial..."
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />

          <select
            className="rounded-md border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="available">Disponível</option>
            <option value="rented">Alugada</option>
          </select>

          <button
            className="rounded-md border px-4 py-2"
            onClick={load}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3">Serial</th>
                <th className="text-left px-4 py-3">Cor</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4" colSpan={4}>
                    Carregando...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={4}>
                    Nenhuma caçamba encontrada.
                  </td>
                </tr>
              ) : (
                data.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-3">{d.serial}</td>
                    <td className="px-4 py-3">{d.color}</td>
                    <td className="px-4 py-3">
                      {d.isRented ? 'Alugada' : 'Disponível'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dumpsters/${d.id}`}
                        className="underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}