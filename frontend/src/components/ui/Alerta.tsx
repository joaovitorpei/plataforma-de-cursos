import type { ReactNode } from 'react';

type Tipo = 'erro' | 'ok' | 'aviso' | 'info';

/** Cada tipo nosso vira uma cor do Bootstrap, com o ícone correspondente. */
const ESTILO: Record<Tipo, { classe: string; icone: string }> = {
  erro: { classe: 'alert-danger', icone: 'bi-exclamation-triangle-fill' },
  ok: { classe: 'alert-success', icone: 'bi-check-circle-fill' },
  aviso: { classe: 'alert-warning', icone: 'bi-exclamation-circle-fill' },
  info: { classe: 'alert-info', icone: 'bi-info-circle-fill' },
};

export function Alerta({
  tipo = 'info',
  children,
}: {
  tipo?: Tipo;
  children: ReactNode;
}) {
  const { classe, icone } = ESTILO[tipo];

  return (
    <div
      className={`alert ${classe} d-flex align-items-start gap-2 mb-0`}
      role={tipo === 'erro' ? 'alert' : 'status'}
    >
      <i className={`bi ${icone} flex-shrink-0`} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
