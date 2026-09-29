import type { ReactNode } from 'react';

/** Card do Bootstrap. `interativo` acrescenta a elevação no hover. */
export function Cartao({
  children,
  interativo = false,
  className = '',
}: {
  children: ReactNode;
  interativo?: boolean;
  className?: string;
}) {
  const classes = ['card', interativo ? 'card-interativo' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="card-body">{children}</div>
    </div>
  );
}
