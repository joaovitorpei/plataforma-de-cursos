import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { Botao } from './Botao';

/** Diálogo simples: fecha no Esc e no clique fora. */
export function Modal({
  titulo,
  aberto,
  aoFechar,
  children,
  acoes,
}: {
  titulo: string;
  aberto: boolean;
  aoFechar: () => void;
  children: ReactNode;
  acoes?: ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') aoFechar();
    }

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="modal-fundo"
      onClick={aoFechar}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <h3 className="modal-titulo">{titulo}</h3>
        {children}
        <div className="modal-acoes">
          {acoes ?? (
            <Botao variante="secundario" onClick={aoFechar}>
              Fechar
            </Botao>
          )}
        </div>
      </div>
    </div>
  );
}
