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
    <header className="cabecalho-pagina">
      <div>
        <h1>{titulo}</h1>
        {descricao ? <p>{descricao}</p> : null}
      </div>
      {acao ? <div className="linha">{acao}</div> : null}
    </header>
  );
}
