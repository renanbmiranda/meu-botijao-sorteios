import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const total = await prisma.codigo.count();
    const resgatados = await prisma.codigo.count({ where: { status: true } });
    const disponiveis = total - resgatados;

    const ultimos = await prisma.codigo.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      stats: { total, resgatados, disponiveis },
      ultimos,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados do painel.' }, { status: 500 });
  }
}