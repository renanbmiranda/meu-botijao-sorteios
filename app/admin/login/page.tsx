'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Não foi possível entrar.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Área restrita</span>
          <h1 className="mt-3 text-3xl font-bold">Painel administrativo</h1>
          <p className="mt-2 text-sm text-slate-400">Entre para gerenciar os bilhetes e lotes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Usuário
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            />
          </label>

          {error && <p className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-center text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-center text-sm text-slate-400 hover:text-emerald-400">
          Voltar ao balcão
        </Link>
      </section>
    </main>
  );
}