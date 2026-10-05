import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Perfil } from '../generated/prisma/enums';

/**
 * Quem está logado nesta requisição. É o que o JwtStrategy.validate() devolve,
 * montado a partir do conteúdo do token — sem ida ao banco.
 */
export interface UsuarioLogado {
  idUsuario: number;
  email: string;
  perfil: Perfil;
}

/**
 * Entrega o usuário logado direto no parâmetro do controller:
 *
 *   create(@Body() dto: CreateMatriculaDto, @Logado() logado: UsuarioLogado)
 *
 * É mais legível do que `@Req() req` e depois `req.user`, e já vem tipado.
 */
export const Logado = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): UsuarioLogado => {
    const requisicao = contexto
      .switchToHttp()
      .getRequest<{ user: UsuarioLogado }>();
    return requisicao.user;
  },
);

/** Só o dono da plataforma. Usado no que é financeiro. */
export function ehAdmin(usuario: UsuarioLogado): boolean {
  return usuario.perfil === Perfil.ADMIN;
}

/**
 * Quem trabalha na plataforma — professor ou dono.
 *
 * É este o atalho usado na regra de dono: o professor precisa enxergar as
 * matrículas, o progresso e as avaliações de todos os alunos para acompanhar
 * as turmas. O aluno continua vendo só o que é dele.
 */
export function ehEquipe(usuario: UsuarioLogado): boolean {
  return usuario.perfil === Perfil.ADMIN || usuario.perfil === Perfil.INSTRUTOR;
}
