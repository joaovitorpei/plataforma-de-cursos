import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { Botao } from './Botao';

/**
 * Modal do Bootstrap controlado pelo React: em vez de carregar o JS do
 * Bootstrap, aplicamos as classes `show` e o backdrop conforme o estado.
 * Fecha no Esc e no clique fora.
 */
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
    // Trava a rolagem do fundo enquanto o diálogo está aberto.
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.classList.remove('modal-open');
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        onClick={aoFechar}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          onClick={(evento) => evento.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5">{titulo}</h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={aoFechar}
              />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              {acoes ?? (
                <Botao variante="secundario" onClick={aoFechar}>
                  Fechar
                </Botao>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
