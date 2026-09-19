'use client';

interface ReciboProps {
  codigo?: string;
  loteCodigos?: string[];
}

export function ReciboTermico({ codigo, loteCodigos }: ReciboProps) {
  if (loteCodigos && loteCodigos.length > 0) {
    return (
      <div className="lote-impressao-a4 hidden print:grid print:text-black print:bg-white font-mono text-xs leading-tight">
        {loteCodigos.map((cod, index) => (
          <div 
            key={index} 
            className="canhoto-lote flex flex-col items-center text-center"
          >
            <div className="font-bold text-sm tracking-wide">RAINHA</div>
            <div className="text-[10px] mb-1">Cidade: Vigia</div>
            <div className="border-t border-black w-full my-1"></div>
            
            <div className="text-[10px] uppercase font-semibold">Bilhete de Sorteio</div>
            <div className="text-xl font-extrabold my-1 font-mono tracking-wider">{cod}</div>
            
            <div className="border-t border-dashed border-gray-400 w-full my-1"></div>
            <div className="text-[9px]">Destaque este canhoto</div>
          </div>
        ))}
      </div>
    );
  }

  if (codigo) {
    return (
      <div className="hidden print:block print:w-[72mm] print:text-black print:bg-white print:p-3 font-mono text-xs leading-tight text-center">
        <div className="font-bold text-sm">RAINHA</div>
        <div className="text-[10px] mb-1">Cidade: Vigia</div>
        <div className="border-t border-black w-full my-1"></div>
        <div className="text-[10px] uppercase">Comprovante de Resgate</div>
        <div className="text-lg font-bold my-1">{codigo}</div>
        <div className="border-t border-dashed border-gray-400 w-full my-1"></div>
        <div className="text-[9px]">Obrigado pela preferência!</div>
      </div>
    );
  }

  return null;
}