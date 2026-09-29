import type { ReactNode } from 'react';

type Cor = 'neutro' | 'marca' | 'ok' | 'erro' | 'aviso' | 'destaque';

const COR: Record<Cor, string> = {
  neutro: 'text-bg-light border',
  marca: 'text-bg-primary',
  ok: 'text-bg-success',
  erro: 'text-bg-danger',
  aviso: 'text-bg-warning',
  destaque: 'text-bg-info',
};

export function Selo({ cor = 'neutro', children }: { cor?: Cor; children: ReactNode }) {
  return <span className={`badge rounded-pill ${COR[cor]}`}>{children}</span>;
}
