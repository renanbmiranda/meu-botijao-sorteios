'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReciboTermico } from '@/components/ReciboTermico';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, LogOut, Printer, Search } from 'lucide-react';

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
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'disponiveis' | 'resgatados' | null>(null);
  const [atualizacao, setAtualizacao] = useState(0);
  
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
        const parametros = new URLSearchParams({ pagina: String(pagina) });
        if (buscaAplicada) parametros.set('busca', buscaAplicada);
        if (statusFiltro) parametros.set('status', statusFiltro);
        const res = await fetch(`/api/admin?${parametros.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao carregar o painel.');
        }
        setStats(data.stats);
        setUltimos(data.codigos);
        setTotalPaginas(data.paginacao.totalPaginas);
        setTotalFiltrado(data.paginacao.total);
      } catch (error) {
        console.error('Erro ao carregar painel', error);
      } finally {
        setLoading(false);
      }
    };

    void carregarDados();
  }, [pagina, buscaAplicada, statusFiltro, atualizacao]);

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
        setPagina(1);
        setAtualizacao((atual) => atual + 1);
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

  const pesquisarCodigos = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    setBuscaAplicada(busca.trim());
  };

  const filtrarPorStatus = (status: 'disponiveis' | 'resgatados') => {
    setPagina(1);
    setStatusFiltro((atual) => atual === status ? null : status);
  };

  return (
    <main className="admin-page brand-atmosphere min-h-screen text-white p-4 md:p-8">
      {/* Elemento de Impressão Térmica Oculto */}
      <ReciboTermico
        codigo={itemSelecionado?.codigo}
        loteCodigos={loteRecente}
      />

      <div className="admin-interface max-w-6xl mx-auto print:hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-cyan-100/60 text-sm">Gerenciamento de bilhetes e lotes</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link href="/"><ArrowLeft className="h-4 w-4" /> Voltar</Link></Button>
            <Button onClick={handleLogout} variant="danger" size="sm"><LogOut className="h-4 w-4" /> Sair</Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-white/10 bg-slate-950/55 p-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Códigos</p>
            <p className="text-3xl font-extrabold mt-2 text-white">{stats.total}</p>
          </Card>
          <Card className="border-emerald-300/20 bg-slate-950/55 p-6">
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Disponíveis / Não Usados</p>
            <button
              type="button"
              onClick={() => filtrarPorStatus('disponiveis')}
              aria-pressed={statusFiltro === 'disponiveis'}
              className="block w-full text-left"
            >
              <span className="block text-3xl font-extrabold mt-2 text-emerald-400">{stats.disponiveis}</span>
            </button>
          </Card>
          <Card className="border-amber-300/20 bg-slate-950/55 p-6">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Resgatados / Usados</p>
            <button
              type="button"
              onClick={() => filtrarPorStatus('resgatados')}
              aria-pressed={statusFiltro === 'resgatados'}
              className="block w-full text-left"
            >
              <span className="block text-3xl font-extrabold mt-2 text-amber-400">{stats.resgatados}</span>
            </button>
          </Card>
        </div>

        {/* Bloco de Gerador de Lotes */}
        <Card className="mb-8 border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-lg font-semibold mb-4">Gerar Novo Lote de Bilhetes</h2>
          <form onSubmit={handleGerarLote} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Prefixo do Código</label>
              <Input
                type="text"
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value)}
                required
                className="uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Quantidade</label>
              <Input
                type="number"
                min="1"
                max="500"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={gerando}
                variant="success"
                className="flex-1"
              >
                {gerando ? 'Gerando...' : 'Gerar Lote'}
              </Button>
              {loteRecente.length > 0 && (
                <Button
                  type="button"
                  onClick={imprimirLoteRecente}
                  variant="secondary"
                  title="Imprimir lote gerado em uma folha A4"
                >
                  <Printer className="h-4 w-4" /> Imprimir em A4
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Tabela de Registros */}
        <Card className="overflow-hidden border-white/10 bg-slate-950/65">
          <div className="p-6 border-b border-slate-800 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Códigos Gerados</h2>
              <p className="text-sm text-slate-400 mt-1">{totalFiltrado} código(s) encontrado(s), 50 por página</p>
            </div>
            <form onSubmit={pesquisarCodigos} className="flex gap-2 w-full md:w-auto">
              <Input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar código, lote ou cliente"
                className="w-full md:w-72"
              />
              <Button type="submit" variant="secondary"><Search className="h-4 w-4" /> Buscar</Button>
            </form>
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
                        <Button
                          onClick={() => dispararImpressaoIndividual(item)}
                          variant="outline"
                          size="sm"
                        >
                          <Printer className="h-3.5 w-3.5" /> Reimprimir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && totalPaginas > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <Button
                type="button"
                disabled={pagina === 1}
                onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
                variant="secondary"
                size="sm"
              >
                ← Anterior
              </Button>
              <span className="text-sm text-slate-400">Página {pagina} de {totalPaginas}</span>
              <Button
                type="button"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}
                variant="secondary"
                size="sm"
              >
                Próxima →
              </Button>
            </div>
          )}
        </Card>

      </div>
    </main>
  );
}