import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.service';
import type { UsuarioLogado } from './usuario-logado';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não definida');

    super({
      // Lê o token do cabeçalho "Authorization: Bearer <token>".
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Só roda se a assinatura e o prazo do token estiverem válidos.
  // O que for retornado aqui fica disponível como req.user no controller.
  validate({ sub, email, perfil }: JwtPayload): UsuarioLogado {
    return { idUsuario: sub, email, perfil };
  }
}
