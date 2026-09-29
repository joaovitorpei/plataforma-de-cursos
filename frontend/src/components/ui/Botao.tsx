import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'perigo' | 'texto';
type Tamanho = 'pequeno' | 'normal' | 'grande';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  children: ReactNode;
}

export function Botao({
  variante = 'primario',
  tamanho = 'normal',
  className = '',
  type = 'button',
  children,
  ...resto
}: Props) {
  const classes = [
    'botao',
    `botao-${variante}`,
    tamanho !== 'normal' ? `botao-${tamanho}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...resto}>
      {children}
    </button>
  );
}
