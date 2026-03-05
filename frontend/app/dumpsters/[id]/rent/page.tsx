'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import type { Dumpster, Rental } from '../../../../lib/types';

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

function onlyDigits(s: string) {
  return s.replace(/\D/g, '');
}

function formatCep(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export default function RentDumpsterPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [dumpster, setDumpster] = useState<Dumpster | null>(null);

  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');

  const [searchingCep, setSearchingCep] = useState(false);

  const cepDigits = useMemo(() => onlyDigits(cep), [cep]);

  const canSubmit = useMemo(() => {
    if (!dumpster) return false;
    if (dumpster.isRented) return false;
    if (submitting) return false;

    return (
      cepDigits.length === 8 &&
      street.trim().length > 0 &&
      district.trim().length > 0 &&
      city.trim().length > 0
    );
  }, [dumpster, submitting, cepDigits, street, district, city]);

  async function loadDumpster() {
    if (!id || Number.isNaN(id)) {
      toast.error('ID inválido.');
      router.push('/dumpsters');
      return;
    }

    setLoading(true);
    try {
      const d = await api<Dumpster>(`/dumpsters/${id}`);
      setDumpster(d);

      if (d.isRented) {
        toast.info('Esta caçamba já está alugada. Finalize o aluguel atual para alugar novamente.');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao carregar caçamba.');
      router.push('/dumpsters');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDumpster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchViaCep(cleanCep: string) {
    setSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Falha ao consultar ViaCEP.');
      const data = (await res.json()) as ViaCepResponse;

      if (data.erro) {
        toast.error('CEP não encontrado.');
        return;
      }

      const logradouro = data.logradouro?.trim() ?? '';
      const bairro = data.bairro?.trim() ?? '';
      const localidade = data.localidade?.trim() ?? '';

      setStreet(logradouro);
      setDistrict(bairro);
      setCity(localidade);

      toast.success('Endereço carregado pelo ViaCEP.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao consultar ViaCEP.');
    } finally {
      setSearchingCep(false);
    }
  }

  useEffect(() => {
    if (cepDigits.length === 8) {
      fetchViaCep(cepDigits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigits]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dumpster) return;

    if (dumpster.isRented) {
      toast.error('Esta caçamba já está alugada.');
      return;
    }

    setSubmitting(true);
    try {
      await api<Rental>('/rentals', {
        method: 'POST',
        body: JSON.stringify({
          dumpsterId: dumpster.id,
          cep: cepDigits,
          street: street.trim(),
          district: district.trim(),
          city: city.trim(),
        }),
      });

      toast.success('Aluguel realizado com sucesso.');
      router.push(`/dumpsters/${dumpster.id}/rentals`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao realizar aluguel.');
    } finally {
      setSubmitting(false);
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

  if (!dumpster) return null;

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Alugar caçamba</h1>
            <p className="text-sm text-neutral-500">
              Serial <span className="font-mono">{dumpster.serial}</span> •{' '}
              <span className={dumpster.isRented ? 'text-amber-700' : 'text-emerald-700'}>
                {dumpster.isRented ? 'Alugada' : 'Disponível'}
              </span>
            </p>
          </div>

          <Link
            href={`/dumpsters/${dumpster.id}`}
            className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Voltar
          </Link>
        </header>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {dumpster.isRented && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Esta caçamba já está alugada. Você pode ver o histórico e finalizar o aluguel atual.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-neutral-500 mb-2">CEP</label>
              <input
                className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                placeholder="99999-999"
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                disabled={submitting}
                inputMode="numeric"
              />
              <div className="mt-2 text-xs text-neutral-400">
                {searchingCep
                  ? 'Consultando ViaCEP...'
                  : 'Digite o CEP e o sistema preenche automaticamente o endereço.'}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Rua</label>
                <input
                  className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                  placeholder="Logradouro"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-2">Bairro</label>
                <input
                  className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                  placeholder="Bairro"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-2">Cidade</label>
                <input
                  className="w-full rounded-full bg-neutral-100 px-5 py-3 outline-none border border-transparent focus:border-emerald-300"
                  placeholder="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Confirmando...' : 'Confirmar aluguel'}
              </button>

              <Link
                href={`/dumpsters/${dumpster.id}/rentals`}
                className="rounded-full border px-6 py-2.5 text-sm font-semibold hover:bg-neutral-50"
              >
                Ver histórico
              </Link>
            </div>
          </form>
        </div>

        <footer className="text-xs text-neutral-400">
          Endpoints: <code>GET /api/dumpsters/{id}</code> • <code>POST /api/rentals</code> • ViaCEP
        </footer>
      </div>
    </main>
  );
}