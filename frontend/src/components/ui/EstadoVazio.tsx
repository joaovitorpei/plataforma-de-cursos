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
      <p className="vazio-titulo">{titulo}</p>
      {descricao ? <p className="texto-secundario">{descricao}</p> : null}
      {acao ? <div style={{ marginTop: 'var(--e-4)' }}>{acao}</div> : null}
    </div>
  );
}
