import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionFromRequest, isValidAdminSession } from '@/lib/admin-auth';

export async function GET(request: Request) {
  if (!isValidAdminSession(getAdminSessionFromRequest(request))) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const total = await prisma.codigo.count();
    const resgatados = await prisma.codigo.count({ where: { status: true } });
    const disponiveis = total - resgatados;

    const ultimos = await prisma.codigo.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const todos = await prisma.codigo.findMany({
      orderBy: { createdAt: 'asc' },
      select: { codigo: true },
    });

    return NextResponse.json({
      stats: { total, resgatados, disponiveis },
      ultimos,
      todos,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar dados do painel.' }, { status: 500 });
  }
}