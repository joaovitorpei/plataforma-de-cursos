import type { ReactNode } from 'react';

type Tipo = 'erro' | 'ok' | 'aviso' | 'info';

const ICONE: Record<Tipo, string> = {
  erro: '⚠',
  ok: '✓',
  aviso: '!',
  info: 'i',
};

export function Alerta({
  tipo = 'info',
  children,
}: {
  tipo?: Tipo;
  children: ReactNode;
}) {
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <span aria-hidden="true">{ICONE[tipo]}</span>
      <span>{children}</span>
    </div>
  );
}
