import type { IUsuario } from '../models';
import { usuarioService } from './recursos';
import { lerConteudo, lerToken } from './token';

/**
 * A lista de usuários que esta pessoa pode ver.
 *
 * `GET /usuarios` é restrito a professores — um aluno leva 403. Mas as telas
 * precisam de nomes para mostrar ("Ana Souza" em vez de "usuário 3"), e o
 * aluno só enxerga registros dele mesmo. Então:
 *
 *   professor -> a lista completa
 *   aluno     -> só ele mesmo
 *
 * O perfil sai do próprio token, sem consultar a API — assim nem chegamos a
 * fazer a requisição que daria 403.
 *
 * Efeito colateral bem-vindo: nos formulários, o campo "Aluno" de um estudante
 * vem com uma opção só, a dele. É exatamente o que a API permitiria mesmo.
 */
export async function listarUsuariosVisiveis(): Promise<IUsuario[]> {
  const token = lerToken();
  const conteudo = token ? lerConteudo(token) : null;
  if (!conteudo) return [];

  if (conteudo.perfil === 'ADMIN') {
    return usuarioService.listar();
  }

  const eu = await usuarioService.obter(conteudo.sub);
  return [eu];
}
