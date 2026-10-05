import { createContext } from 'react';
import type { IUsuario } from '../models';

export interface EstadoAuth {
  usuario: IUsuario | null;
  autenticado: boolean;
  /**
   * Atalhos para a tela decidir o que mostrar. Quem decide de verdade é a API.
   *   ehAdmin  - só o dono (financeiro, contas da equipe)
   *   ehEquipe - professor ou dono (catálogo, acompanhamento dos alunos)
   */
  ehAdmin: boolean;
  ehEquipe: boolean;
  /** true enquanto a sessão guardada está sendo conferida no carregamento. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  /** Cadastro público: cria sempre uma conta de aluno. */
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

export const ContextoAuth = createContext<EstadoAuth | null>(null);
