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
          <Botao variante="perigo" onClick={aoConfirmar} disabled={ocupado}>
            {ocupado ? 'Excluindo…' : 'Excluir'}
          </Botao>
        </>
      }
    >
      <p className="texto-secundario">{descricao}</p>
      <p className="texto-terciario" style={{ marginTop: 'var(--e-2)' }}>
        Esta ação não pode ser desfeita.
      </p>
    </Modal>
  );
}
