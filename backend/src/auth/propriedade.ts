import { ForbiddenException } from '@nestjs/common';

import { ehAdmin } from './usuario-logado';
import type { UsuarioLogado } from './usuario-logado';

/**
 * Regra de dono, usada pelos recursos que o aluno também pode mexer
 * (matrículas, avaliações, progresso, assinaturas e pagamentos).
 *
 * Um administrador passa sempre. Um aluno só passa quando o registro é dele.
 *
 * Por que isso fica no service e não num guard: o guard roda **antes** do
 * controller e não conhece o conteúdo do banco. Para saber de quem é a
 * matrícula 7 é preciso ir buscá-la — e quem fala com o banco é o service.
 */
export function exigirDono(
  idDonoDoRegistro: number,
  logado: UsuarioLogado,
): void {
  if (ehAdmin(logado)) return;
  if (logado.idUsuario === idDonoDoRegistro) return;

  throw new ForbiddenException(
    'Você só pode acessar ou alterar registros ligados à sua própria conta',
  );
}

/**
 * Filtro para as listagens: o administrador vê tudo, o aluno vê só o que é
 * dele. Devolve `undefined` para o admin, que no Prisma significa "sem filtro".
 */
export function filtroDoDono(
  logado: UsuarioLogado,
): { idUsuario: number } | undefined {
  return ehAdmin(logado) ? undefined : { idUsuario: logado.idUsuario };
}
