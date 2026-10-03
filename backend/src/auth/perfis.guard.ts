import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Perfil } from '../generated/prisma/enums';
import { PERFIS_EXIGIDOS } from './perfis.decorator';
import type { UsuarioLogado } from './usuario-logado';

/**
 * Confere o perfil de quem está logado contra o que a rota exige.
 *
 * Roda depois do JwtAuthGuard, então aqui o `request.user` já existe — ele foi
 * preenchido pelo JwtStrategy a partir do conteúdo do token.
 *
 * A diferença entre os dois guards, que é o que o 401 e o 403 querem dizer:
 *   401 (JwtAuthGuard)  - "não sei quem você é"
 *   403 (PerfisGuard)   - "sei quem você é, e você não pode fazer isso"
 */
@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const exigidos = this.reflector.getAllAndOverride<Perfil[] | undefined>(
      PERFIS_EXIGIDOS,
      [contexto.getHandler(), contexto.getClass()],
    );

    // Rota sem @Perfis(): basta estar autenticado.
    if (!exigidos?.length) return true;

    const requisicao = contexto.switchToHttp().getRequest<{
      user?: UsuarioLogado;
    }>();
    const usuario = requisicao.user;

    if (!usuario || !exigidos.includes(usuario.perfil)) {
      throw new ForbiddenException(
        'Esta ação é restrita a administradores da plataforma',
      );
    }

    return true;
  }
}
