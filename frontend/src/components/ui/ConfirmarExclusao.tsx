import { Botao } from './Botao';
import { Modal } from './Modal';

/** Confirmação antes de apagar — excluir é irreversível. */
export function ConfirmarExclusao({
  aberto,
  descricao,
  ocupado = false,
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean;
  descricao: string;
  ocupado?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  return (
    <Modal
      titulo="Confirmar exclusão"
      aberto={aberto}
      aoFechar={aoCancelar}
      acoes={
        <>
          <Botao variante="secundario" onClick={aoCancelar} disabled={ocupado}>
            Cancelar
          </Botao>
          <button type="button" className="btn btn-danger" onClick={aoConfirmar} disabled={ocupado}>
            {ocupado ? 'Excluindo…' : 'Excluir'}
          </button>
        </>
      }
    >
      <p className="mb-1">{descricao}</p>
      <p className="text-body-secondary small mb-0">Esta ação não pode ser desfeita.</p>
    </Modal>
  );
}
