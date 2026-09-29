import type { ReactNode } from 'react';

type Cor = 'neutro' | 'marca' | 'ok' | 'erro' | 'aviso' | 'destaque';

export function Selo({
  cor = 'neutro',
  children,
}: {
  cor?: Cor;
  children: ReactNode;
}) {
  return (
    <span className={`selo${cor === 'neutro' ? '' : ` selo-${cor}`}`}>{children}</span>
  );
}
