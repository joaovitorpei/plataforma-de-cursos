import type { ReactNode } from 'react';

export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <header className="d-flex justify-content-between align-items-start flex-wrap gap-3 border-bottom pb-3 mb-4">
      <div>
        <h1 className="h2 mb-0">{titulo}</h1>
        {descricao ? <p className="text-body-secondary mb-0 mt-1">{descricao}</p> : null}
      </div>
      {acao ? <div className="hstack gap-2">{acao}</div> : null}
    </header>
  );
}
