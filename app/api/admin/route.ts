import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionFromRequest, isValidAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  if (!isValidAdminSession(getAdminSessionFromRequest(request))) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const paginaInformada = Number(searchParams.get('pagina') || '1');
    const pagina = Number.isInteger(paginaInformada) ? Math.max(1, paginaInformada) : 1;
    const busca = searchParams.get('busca')?.trim() || '';
    const porPagina = 50;
    const where = busca
      ? {
          OR: [
            { codigo: { contains: busca, mode: 'insensitive' as const } },
            { cliente: { contains: busca, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const total = await prisma.codigo.count();
    const resgatados = await prisma.codigo.count({ where: { status: true } });
    const disponiveis = total - resgatados;
    const totalFiltrado = await prisma.codigo.count({ where });

    const codigos = await prisma.codigo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    });

    return NextResponse.json({
      stats: { total, resgatados, disponiveis },
      codigos,
      paginacao: {
        pagina,
        porPagina,
        total: totalFiltrado,
        totalPaginas: Math.ceil(totalFiltrado / porPagina),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar dados do painel.' }, { status: 500 });
  }
}