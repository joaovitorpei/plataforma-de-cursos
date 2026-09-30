import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Mesmo guard do Passport, só que com a mensagem em português.
 *
 * O `AuthGuard('jwt')` puro responde `{"message":"Unauthorized"}`, que aparece
 * na tela e no Swagger. Aqui trocamos por uma frase que diz o que fazer.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(erro: unknown, usuario: TUser): TUser {
    if (erro || !usuario) {
      throw new UnauthorizedException(
        'Sessão expirada ou ausente. Entre novamente para continuar.',
      );
    }
    return usuario;
  }
}
