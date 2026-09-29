import { useCallback, useState } from 'react';

import { mensagemDeErro } from '../utils/erro';

/**
 * Fluxo de exclusão com confirmação: guarda o registro escolhido, chama a API
 * e recarrega a lista. Usado por todas as telas de listagem.
 */
export function useExclusao<T>(
  excluir: (registro: T) => Promise<void>,
  aoConcluir: () => void | Promise<void>,
) {
  const [alvo, setAlvo] = useState<T | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const confirmar = useCallback(async () => {
    if (!alvo) return;
    setExcluindo(true);
    setErro(null);
    try {
      await excluir(alvo);
      setAlvo(null);
      await aoConcluir();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao));
      setAlvo(null);
    } finally {
      setExcluindo(false);
    }
  }, [alvo, excluir, aoConcluir]);

  return {
    alvo,
    excluindo,
    erro,
    pedirConfirmacao: setAlvo,
    cancelar: () => setAlvo(null),
    confirmar,
  };
}
