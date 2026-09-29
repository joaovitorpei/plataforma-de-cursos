import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'perigo' | 'texto';
type Tamanho = 'pequeno' | 'normal' | 'grande';

/** Classe do Bootstrap para cada variante nossa. */
const VARIANTE: Record<Variante, string> = {
  primario: 'btn-primary',
  secundario: 'btn-outline-secondary',
  perigo: 'btn-outline-danger',
  texto: 'btn-link text-decoration-none',
};

const TAMANHO: Record<Tamanho, string> = {
  pequeno: 'btn-sm',
  normal: '',
  grande: 'btn-lg',
};

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
  const classes = ['btn', VARIANTE[variante], TAMANHO[tamanho], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...resto}>
      {children}
    </button>
  );
}
