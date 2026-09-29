import type { ReactNode } from 'react';

export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="vazio">
      <p className="h5 mb-1">{titulo}</p>
      {descricao ? <p className="text-body-secondary mb-0">{descricao}</p> : null}
      {acao ? <div className="mt-3">{acao}</div> : null}
    </div>
  );
}
