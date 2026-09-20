'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LockKeyhole, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
    <main className="brand-atmosphere brand-grid min-h-screen text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/15 bg-slate-950/65">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/30">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Área restrita</span>
          <CardTitle className="mt-2 text-3xl">Painel administrativo</CardTitle>
          <CardDescription className="mt-2">Entre para gerenciar os bilhetes e lotes.</CardDescription>
        </CardHeader>
        <CardContent>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Usuário
            <Input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="mt-1"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Senha
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-1"
            />
          </label>

          {error && <p className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-center text-sm text-rose-300">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            variant="success"
            size="lg"
            className="w-full"
          >
            {loading ? 'Entrando...' : <><LogIn className="h-4 w-4" /> Entrar no painel</>}
          </Button>
        </form>

        <Link href="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" /> Voltar ao balcão
        </Link>
        </CardContent>
      </Card>
    </main>
  );
}