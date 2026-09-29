import type { ReactNode } from 'react';

export function Cartao({
  children,
  interativo = false,
  className = '',
}: {
  children: ReactNode;
  interativo?: boolean;
  className?: string;
}) {
  const classes = ['cartao', interativo ? 'cartao-interativo' : '', className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
