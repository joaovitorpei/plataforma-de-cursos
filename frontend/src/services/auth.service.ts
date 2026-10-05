import { requisitar } from './http';
import type { IUsuario } from '../models';

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
/**
 * POST /auth/cadastrar — rota pública. Cria sempre uma conta de **aluno**:
 * o perfil nem é enviado, quem fixa é o backend. Contas de professor e de
 * administrador são criadas pelo admin, em POST /usuarios.
 */
export function cadastrar(
  nomeCompleto: string,
  email: string,
  senha: string,
): Promise<IUsuario> {
  return requisitar<IUsuario>('/auth/cadastrar', {
    method: 'POST',
    body: JSON.stringify({ nomeCompleto, email, senha }),
  });
}

/** GET /usuarios/:id — protegida; usada para saber o nome de quem está logado. */
export function perfil(idUsuario: number): Promise<IUsuario> {
  return requisitar<IUsuario>(`/usuarios/${idUsuario}`);
}
