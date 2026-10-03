import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { E_PUBLICO } from './publico.decorator';

/**
 * Exige o token JWT. Está registrado como guard global no AppModule, então
 * vale para TODAS as rotas — menos as marcadas com @Publico().
 *
 * Também troca a mensagem padrão do Passport ("Unauthorized") por uma frase
 * em português que diz o que fazer.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(contexto: ExecutionContext) {
    // Rota marcada como pública passa direto, sem procurar token.
    const ehPublico = this.reflector.getAllAndOverride<boolean>(E_PUBLICO, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (ehPublico) return true;

    return super.canActivate(contexto);
  }

  handleRequest<TUser>(erro: unknown, usuario: TUser): TUser {
    if (erro || !usuario) {
      throw new UnauthorizedException(
        'Sessão expirada ou ausente. Entre novamente para continuar.',
      );
    }
    return usuario;
  }
}
