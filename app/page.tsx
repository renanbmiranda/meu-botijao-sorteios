'use client';

import { useState } from 'react';
import { ReciboTermico } from '@/components/ReciboTermico';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle2, Printer, ShieldCheck } from 'lucide-react';

interface ResultadoValidacao {
  codigo: string;
  cliente: string | null;
  createdAt: string;
}

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    data?: ResultadoValidacao;
  } | null>(null);

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) return;

    setLoading(true);
    setResultado(null);

    try {
      const res = await fetch('/api/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, cliente }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResultado({ error: data.error || 'Ocorreu um erro.' });
      } else {
        setResultado({ success: true, message: data.message, data: data.data });
        setCodigo('');
        setCliente('');
      }
    } catch {
      setResultado({ error: 'Falha na comunicação com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <main className="brand-atmosphere brand-grid min-h-screen text-white flex flex-col items-center justify-center p-4">
      {/* Componente oculto que sai apenas na impressora térmica */}
      {resultado?.data && (
        <ReciboTermico
          codigo={resultado.data.codigo}
        />
      )}

      <Card className="w-full max-w-md border-white/15 bg-slate-950/55 print:hidden">
        <CardHeader className="pb-3 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Rainha do Gás</span>
          <CardTitle className="mt-2 text-3xl">Validar bilhete</CardTitle>
          <CardDescription>Confirme o código para registrar o resgate do prêmio.</CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleValidar} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-300">Nome do cliente <span className="text-slate-500">(opcional)</span></label>
            <Input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-300">Código do bilhete</label>
            <Input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: GLP-1000"
              required
              className="text-lg font-mono tracking-wider uppercase"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="success"
            size="lg"
            className="w-full"
          >
            {loading ? 'Validando...' : <><CheckCircle2 className="h-4 w-4" /> Verificar e resgatar</>}
          </Button>
        </form>

        {resultado && (
          <div className={`mt-6 p-4 rounded-xl border text-sm ${
            resultado.success 
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}>
            <p className="font-medium text-center">{resultado.message || resultado.error}</p>
            
            {resultado.success && (
                <Button
                onClick={handleImprimir}
                  variant="secondary"
                  size="sm"
                  className="mt-3 w-full"
              >
                  <Printer className="h-4 w-4" /> Imprimir comprovante térmico
                </Button>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-4 text-center">
          <a href="/admin" className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-cyan-200">
            Acessar painel administrativo <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        </CardContent>
      </Card>
    </main>
  );
}