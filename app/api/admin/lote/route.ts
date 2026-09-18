import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { prefixo = 'GLP', quantidade = 50 } = await request.json();

    if (quantidade <= 0 || quantidade > 1000) {
      return NextResponse.json({ error: 'A quantidade deve ser entre 1 e 1000 por lote.' }, { status: 400 });
    }

    // Busca o último código com o mesmo prefixo para continuar a sequência
    const ultimoCodigo = await prisma.codigo.findFirst({
      where: { codigo: { startsWith: prefixo } },
      orderBy: { createdAt: 'desc' },
    });

    let proximoNumero = 1;
    if (ultimoCodigo) {
      const match = ultimoCodigo.codigo.match(/(\d+)$/);
      if (match) {
        proximoNumero = parseInt(match[1], 10) + 1;
      }
    }

    const novosCodigos = [];
    for (let i = 0; i < quantidade; i++) {
      const numeroAtual = proximoNumero + i;
      // Formata com 2 dígitos se for menor que 100 (ex: 01, 02...), ou mantém o tamanho ideal
      const numeroFormatado = numeroAtual < 100 ? numeroAtual.toString().padStart(2, '0') : numeroAtual.toString();
      const codigoStr = `${prefixo.toUpperCase()}-${numeroFormatado}`;
      
      novosCodigos.push({
        codigo: codigoStr,
        status: false,
      });
    }

    let inseridos = 0;
    for (const item of novosCodigos) {
      try {
        await prisma.codigo.create({
          data: item,
        });
        inseridos++;
      } catch (e) {
        // Ignora duplicados se houver conflito
      }
    }

    return NextResponse.json({
      success: true,
      message: `${inseridos} canhotos gerados com sucesso!`,
      loteGerado: novosCodigos.map(i => i.codigo),
    });
  } catch (error) {
    console.error('Erro ao gerar lote:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar lote.' }, { status: 500 });
  }
}