import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'codigos.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Arquivo codigos.csv não encontrado na raiz do projeto!');
    process.exit(1);
  }

  console.log('📂 Lendo arquivo CSV...');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📊 Encontrados ${records.length} códigos. Importando...`);

  let inseridos = 0;
  let duplicados = 0;

  for (const record of records) {
    // Forçamos o record a ser tratado como um objeto genérico com chave string
    const item = record as Record<string, any>;
    const codigoStr = item.codigo?.toUpperCase();
    if (!codigoStr) continue;

    try {
      await prisma.codigo.create({
        data: {
          codigo: codigoStr,
          status: false,
        },
      });
      inseridos++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        duplicados++;
      } else {
        console.error(`Erro ao inserir o código ${codigoStr}:`, error.message);
      }
    }
  }

  console.log('-----------------------------------');
  console.log(`✅ Importação concluída!`);
  console.log(`📥 Inseridos com sucesso: ${inseridos}`);
  console.log(`⚠️ Ignorados (já existiam): ${duplicados}`);
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });