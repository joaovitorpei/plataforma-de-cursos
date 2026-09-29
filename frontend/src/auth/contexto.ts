import { createContext } from 'react';
import type { IUsuario } from '../models';

export interface EstadoAuth {
  usuario: IUsuario | null;
  autenticado: boolean;
  /** true enquanto a sessão guardada está sendo conferida no carregamento. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

export const ContextoAuth = createContext<EstadoAuth | null>(null);
