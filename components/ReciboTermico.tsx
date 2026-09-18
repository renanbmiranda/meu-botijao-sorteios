'use client';

interface ReciboProps {
  loteCodigos?: string[];
}

export function ReciboTermico({ loteCodigos }: ReciboProps) {
  if (!loteCodigos || loteCodigos.length === 0) return null;

  return (
    <div className="hidden print:block print:w-[72mm] print:text-black print:bg-white print:p-0 font-mono text-xs leading-tight">
      {loteCodigos.map((codigo, index) => (
        <div 
          key={index} 
          className="p-3 mb-2 border-b-2 border-dashed border-black page-break-after-always flex flex-col items-center text-center"
        >
          <div className="font-bold text-sm tracking-wide">RAINHA</div>
          <div className="text-[10px] mb-1">Cidade: Vigia</div>
          <div className="border-t border-black w-full my-1"></div>
          
          <div className="text-[10px] uppercase font-semibold">Bilhete de Sorteio</div>
          <div className="text-xl font-extrabold my-1 font-mono tracking-wider">{codigo}</div>
          
          <div className="border-t border-dashed border-gray-400 w-full my-1"></div>
          <div className="text-[9px]">Destaque este canhoto</div>
        </div>
      ))}
    </div>
  );
}