import { createContext } from 'react';
import type { IUsuario, Perfil } from '../models';

export interface EstadoAuth {
  usuario: IUsuario | null;
  autenticado: boolean;
  /** Atalho para a tela decidir o que mostrar. Quem decide de verdade é a API. */
  ehAdmin: boolean;
  /** true enquanto a sessão guardada está sendo conferida no carregamento. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (
    nome: string,
    email: string,
    senha: string,
    perfil: Perfil,
  ) => Promise<void>;
  sair: () => void;
}

export const ContextoAuth = createContext<EstadoAuth | null>(null);
