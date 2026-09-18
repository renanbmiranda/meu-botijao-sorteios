'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReciboTermico } from '@/components/ReciboTermico';

interface CodigoItem {
  id: string;
  codigo: string;
  cliente: string | null;
  status: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, resgatados: 0, disponiveis: 0 });
  const [ultimos, setUltimos] = useState<CodigoItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para geração de lote
  const [prefixo, setPrefixo] = useState('GLP');
  const [quantidade, setQuantidade] = useState(50);
  const [gerando, setGerando] = useState(false);
  const [loteRecente, setLoteRecente] = useState<string[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<CodigoItem | null>(null);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin/login');
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await fetch('/api/admin');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao carregar o painel.');
        }
        setStats(data.stats);
        setUltimos(data.ultimos);
      } catch (error) {
        console.error('Erro ao carregar painel', error);
      } finally {
        setLoading(false);
      }
    };

    void carregarDados();
  }, []);

  const handleGerarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    setGerando(true);
    try {
      const res = await fetch('/api/admin/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixo, quantidade }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLoteRecente(data.loteGerado);
        window.location.reload();
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setGerando(false);
    }
  };

  const imprimirLoteRecente = () => {
    if (loteRecente.length === 0) return;
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const dispararImpressaoIndividual = (item: CodigoItem) => {
    setLoteRecente([]); // limpa lote para imprimir só o cupom individual
    setItemSelecionado(item);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      {/* Elemento de Impressão Térmica Oculto */}
      <ReciboTermico
        codigo={itemSelecionado?.codigo}
        cliente={itemSelecionado?.cliente}
        data={itemSelecionado ? new Date(itemSelecionado.createdAt).toLocaleString('pt-BR') : undefined}
        loteCodigos={loteRecente}
      />

      <div className="max-w-5xl mx-auto print:hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-slate-400 text-sm">Gerenciamento, Sorteios e Impressão Térmica (GoldenTec GT-710)</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition">
              ← Voltar ao Balcão
            </Link>
            <button onClick={handleLogout} className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800 px-4 py-2 rounded-xl text-sm font-medium transition">
              Sair
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Códigos</p>
            <p className="text-3xl font-extrabold mt-2 text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow">
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Disponíveis / Não Usados</p>
            <p className="text-3xl font-extrabold mt-2 text-emerald-400">{stats.disponiveis}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Resgatados / Usados</p>
            <p className="text-3xl font-extrabold mt-2 text-amber-400">{stats.resgatados}</p>
          </div>
        </div>

        {/* Bloco de Gerador de Lotes */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Gerar Novo Lote de Bilhetes</h2>
          <form onSubmit={handleGerarLote} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Prefixo do Código</label>
              <input
                type="text"
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={gerando}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition shadow"
              >
                {gerando ? 'Gerando...' : 'Gerar Lote'}
              </button>
              {loteRecente.length > 0 && (
                <button
                  type="button"
                  onClick={imprimirLoteRecente}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1"
                  title="Imprimir lote gerado na GoldenTec"
                >
                  🖨️ Imprimir Lote
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela de Registros */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold">Últimos Bilhetes Registrados</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando dados...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                    <th className="p-4">Código</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Data de Criação</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {ultimos.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono font-medium text-emerald-400">{item.codigo}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.status ? 'Resgatado' : 'Disponível'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{item.cliente || '-'}</td>
                      <td className="p-4 text-slate-400">{new Date(item.createdAt).toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-right">
                        {item.status && (
                          <button
                            onClick={() => dispararImpressaoIndividual(item)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
                          >
                            🖨️ Reimprimir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}