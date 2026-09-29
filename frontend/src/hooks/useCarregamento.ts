import { useCallback, useEffect, useState } from 'react';

import { mensagemDeErro } from '../utils/erro';

/**
 * Carrega dados da API cuidando dos três estados que toda tela precisa:
 * carregando, erro e dados. `recarregar` relê do banco — é o que faz a tela
 * refletir o que foi inserido direto no PostgreSQL.
 *
 * `carregar` precisa ser estável: use uma função de módulo ou envolva em
 * useCallback. Uma função criada a cada render recarregaria sem parar.
 */
export function useCarregamento<T>(carregar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await carregar());
    } catch (excecao) {
      setErro(mensagemDeErro(excecao));
    } finally {
      setCarregando(false);
    }
  }, [carregar]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar, setDados };
}
