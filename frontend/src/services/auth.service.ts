import { requisitar } from './http';
import type { IUsuario, Perfil } from '../models';

export interface RespostaLogin {
  access_token: string;
}

/** POST /auth/login — rota pública que devolve o JWT. */
export function entrar(email: string, senha: string): Promise<RespostaLogin> {
  return requisitar<RespostaLogin>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

/**
 * POST /usuarios — também é público, é a rota de cadastro.
 * A API devolve o usuário criado já sem a senha.
 */
export function cadastrar(
  nomeCompleto: string,
  email: string,
  senha: string,
  perfil: Perfil,
): Promise<IUsuario> {
  return requisitar<IUsuario>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({ nomeCompleto, email, senha, perfil }),
  });
}

/** GET /usuarios/:id — protegida; usada para saber o nome de quem está logado. */
export function perfil(idUsuario: number): Promise<IUsuario> {
  return requisitar<IUsuario>(`/usuarios/${idUsuario}`);
}
