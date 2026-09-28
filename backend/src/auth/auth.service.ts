import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);

    // Compara a senha digitada com o hash salvo no banco. A mesma mensagem
    // serve para os dois casos: não entregamos se o e-mail existe ou não.
    const senhaConfere =
      usuario && (await bcrypt.compare(loginDto.senha, usuario.senha));
    if (!senhaConfere) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // O payload é o conteúdo do token. Nada de senha aqui: o JWT é assinado,
    // não criptografado, e qualquer um consegue ler o que está dentro dele.
    const payload: JwtPayload = {
      sub: usuario.idUsuario,
      email: usuario.email,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
