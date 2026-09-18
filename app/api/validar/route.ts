import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Valida e resgata um código
export async function POST(request: Request) {
  try {
    let body: { codigo?: unknown; cliente?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const { codigo, cliente } = body;

    if (typeof codigo !== 'string' || !codigo.trim()) {
      return NextResponse.json({ error: 'Código não informado.' }, { status: 400 });
    }

    if (cliente !== undefined && cliente !== null && typeof cliente !== 'string') {
      return NextResponse.json({ error: 'Nome do cliente inválido.' }, { status: 400 });
    }

    const codigoLimpo = codigo.trim().toUpperCase();

    // Busca o código no banco
    const registro = await prisma.codigo.findUnique({
      where: { codigo: codigoLimpo },
    });

    if (!registro) {
      return NextResponse.json({ error: 'Código inválido ou não encontrado.' }, { status: 400 });
    }

    if (registro.status) {
      return NextResponse.json(
        { error: `Este código já foi resgatado anteriormente por ${registro.cliente || 'outro cliente'}.` },
        { status: 400 }
      );
    }

    // Atualiza o código como utilizado (resgatado)
    const atualizado = await prisma.codigo.updateMany({
      where: { id: registro.id, status: false },
      data: {
        status: true,
        cliente: cliente && cliente.trim() ? cliente.trim() : 'Cliente Balcão',
      },
    });

    if (atualizado.count === 0) {
      return NextResponse.json(
        { error: 'Este código já foi resgatado por outro atendimento.' },
        { status: 409 }
      );
    }

    const registroAtualizado = await prisma.codigo.findUniqueOrThrow({
      where: { id: registro.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Código validado e resgatado com sucesso!',
      data: registroAtualizado,
    });
  } catch (error) {
    console.error('Erro na API de validação:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}