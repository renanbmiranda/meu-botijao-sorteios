'use client';

import { useState } from 'react';
import { ReciboTermico } from '@/components/ReciboTermico';

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Componente oculto que sai apenas na impressora térmica */}
      {resultado?.data && (
        <ReciboTermico
          codigo={resultado.data.codigo}
        />
      )}

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8 print:hidden">
        
        <div className="text-center mb-8">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
            Sistema de Sorteios
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">Rainha Sorteios</h1>
          <p className="text-slate-400 text-sm mt-1">Insira o código do bilhete para validar o prêmio</p>
        </div>

        <form onSubmit={handleValidar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Nome do Cliente (Opcional)</label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Código do Bilhete</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: GLP-1000"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-wider uppercase text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Verificar e Resgatar'}
          </button>
        </form>

        {resultado && (
          <div className={`mt-6 p-4 rounded-xl border text-sm ${
            resultado.success 
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}>
            <p className="font-medium text-center">{resultado.message || resultado.error}</p>
            
            {resultado.success && (
              <button
                onClick={handleImprimir}
                className="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded-lg transition border border-slate-600 flex items-center justify-center gap-2"
              >
                🖨️ Imprimir Comprovante Térmico
              </button>
            )}
          </div>
        )}

        <div className="mt-8 text-center border-t border-slate-700/60 pt-4">
          <a href="/admin" className="text-xs text-slate-400 hover:text-emerald-400 transition">
            Acessar Painel Administrativo →
          </a>
        </div>

      </div>
    </main>
  );
}