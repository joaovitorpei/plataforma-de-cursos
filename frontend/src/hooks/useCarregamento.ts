import { useCallback, useEffect, useRef, useState } from 'react';

import { mensagemDeErro } from '../utils/erro';

/**
 * Carrega dados da API cuidando dos três estados que toda tela precisa:
 * carregando, erro e dados. `recarregar` relê do banco — é o que faz a tela
 * refletir o que foi inserido direto no PostgreSQL.
 */
export function useCarregamento<T>(carregar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Guarda a função numa ref para o efeito não depender da identidade dela.
  const referencia = useRef(carregar);
  referencia.current = carregar;

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await referencia.current());
    } catch (excecao) {
      setErro(mensagemDeErro(excecao));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar, setDados };
}
