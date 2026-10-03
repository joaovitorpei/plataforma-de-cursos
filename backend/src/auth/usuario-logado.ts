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

/** Atalho usado nos services para decidir se pode mexer em registro alheio. */
export function ehAdmin(usuario: UsuarioLogado): boolean {
  return usuario.perfil === Perfil.ADMIN;
}
