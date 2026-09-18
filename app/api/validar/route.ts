import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Valida e resgata um código
export async function POST(request: Request) {
  try {
    const { codigo, cliente } = await request.json();

    if (!codigo) {
      return NextResponse.json({ error: 'Código não informado.' }, { status: 400 });
    }

    const codigoLimpo = codigo.trim().toUpperCase();

    // Busca o código no banco
    const registro = await prisma.codigo.findUnique({
      where: { codigo: codigoLimpo },
    });

    if (!registro) {
      return NextResponse.json({ error: 'Código inválido ou não encontrado.' }, { status: 404 });
    }

    if (registro.status) {
      return NextResponse.json(
        { error: `Este código já foi resgatado anteriormente por ${registro.cliente || 'outro cliente'}.` },
        { status: 400 }
      );
    }

    // Atualiza o código como utilizado (resgatado)
    const atualizado = await prisma.codigo.update({
      where: { id: registro.id },
      data: {
        status: true,
        cliente: cliente ? cliente.trim() : 'Cliente Balcão',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Código validado e resgatado com sucesso!',
      data: atualizado,
    });
  } catch (error) {
    console.error('Erro na API de validação:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}