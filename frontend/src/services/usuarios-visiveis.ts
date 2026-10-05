import type { IUsuario, Perfil } from '../models';
import { requisitar } from './http';
import { usuarioService } from './recursos';
import { lerConteudo, lerToken } from './token';

/**
 * As listas de usuários que alimentam os seletores das telas.
 *
 * Duas regras moram aqui:
 *
 * 1. **Quem pode ver quem.** `GET /usuarios` é da equipe (professor e dono).
 *    O aluno leva 403 — então, para ele, a lista é só ele mesmo. Isso é o que
 *    faz o campo "Aluno" de um estudante vir com uma opção só, que é
 *    exatamente o que a API permitiria.
 *
 * 2. **Qual perfil cabe em cada campo.** Um curso é dado por um professor, uma
 *    matrícula é de um aluno. Pedir a lista certa evita oferecer escolha que a
 *    API recusaria — ou pior, que ela aceitaria sem fazer sentido.
 */

/** Quem está logado é da equipe? Sai do próprio token, sem ir à API. */
function souDaEquipe(): boolean {
  const token = lerToken();
  const perfil = token ? lerConteudo(token)?.perfil : undefined;
  return perfil === 'ADMIN' || perfil === 'INSTRUTOR';
}

async function soEuMesmo(): Promise<IUsuario[]> {
  const token = lerToken();
  const conteudo = token ? lerConteudo(token) : null;
  if (!conteudo) return [];

  return [await usuarioService.obter(conteudo.sub)];
}

/** Todos os usuários que esta pessoa pode enxergar. */
export async function listarUsuariosVisiveis(): Promise<IUsuario[]> {
  return souDaEquipe() ? usuarioService.listar() : soEuMesmo();
}

/** Só as contas de um perfil. O aluno continua vendo apenas a si mesmo. */
async function listarPorPerfil(perfil: Perfil): Promise<IUsuario[]> {
  if (!souDaEquipe()) return soEuMesmo();
  return requisitar<IUsuario[]>(`/usuarios?perfil=${perfil}`);
}

/** Para os campos "Aluno": matrícula, avaliação, progresso, certificado. */
export function listarAlunos(): Promise<IUsuario[]> {
  return listarPorPerfil('USER');
}

/**
 * Para o campo "Instrutor" do curso.
 *
 * Traz professores **e** administradores: o dono da plataforma também pode
 * dar aula, e sem isso ele não conseguiria se colocar como instrutor.
 */
export async function listarInstrutores(): Promise<IUsuario[]> {
  if (!souDaEquipe()) return soEuMesmo();

  const [professores, donos] = await Promise.all([
    requisitar<IUsuario[]>('/usuarios?perfil=INSTRUTOR'),
    requisitar<IUsuario[]>('/usuarios?perfil=ADMIN'),
  ]);

  return [...professores, ...donos].sort((a, b) =>
    a.nomeCompleto.localeCompare(b.nomeCompleto),
  );
}
