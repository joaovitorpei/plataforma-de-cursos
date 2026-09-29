import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ContextoAuth } from './contexto';
import type { IUsuario } from '../models';
import {
  auth,
  gravarToken,
  lerConteudo,
  lerToken,
  limparToken,
  registrarPerdaDeSessao,
  tokenExpirado,
} from '../services';

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<IUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(() => {
    limparToken();
    setUsuario(null);
  }, []);

  /** Com o token em mãos, busca o usuário para ter o nome na interface. */
  const carregarPerfil = useCallback(async (token: string) => {
    const conteudo = lerConteudo(token);
    if (!conteudo) throw new Error('Token inválido');
    const dados = await auth.perfil(conteudo.sub);
    setUsuario(dados);
  }, []);

  // Ao abrir o app, tenta reaproveitar a sessão guardada no navegador.
  useEffect(() => {
    const token = lerToken();

    if (!token || tokenExpirado(token)) {
      limparToken();
      setCarregando(false);
      return;
    }

    carregarPerfil(token)
      .catch(() => limparToken())
      .finally(() => setCarregando(false));
  }, [carregarPerfil]);

  // Se qualquer requisição levar 401, a sessão cai aqui também.
  useEffect(() => {
    registrarPerdaDeSessao(() => setUsuario(null));
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const { access_token } = await auth.entrar(email, senha);
      gravarToken(access_token);
      await carregarPerfil(access_token);
    },
    [carregarPerfil],
  );

  const cadastrar = useCallback(
    async (nome: string, email: string, senha: string) => {
      await auth.cadastrar(nome, email, senha);
      // Cadastrou, já entra: evita pedir a senha duas vezes seguidas.
      await entrar(email, senha);
    },
    [entrar],
  );

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: usuario !== null,
      carregando,
      entrar,
      cadastrar,
      sair,
    }),
    [usuario, carregando, entrar, cadastrar, sair],
  );

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}
