import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Perfil } from '../generated/prisma/enums';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: number;
  email: string;
  perfil: Perfil;
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
    // O perfil entra no token para o guard não precisar consultar o banco a
    // cada requisição. Como o token é assinado, ninguém consegue se promover
    // a ADMIN editando o conteúdo: a assinatura deixaria de bater.
    const payload: JwtPayload = {
      sub: usuario.idUsuario,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  /** Cadastro público: o perfil é fixado em USER aqui, não vem do corpo. */
  cadastrar(cadastroDto: CadastroDto) {
    return this.usuariosService.create({
      ...cadastroDto,
      perfil: Perfil.USER,
    });
  }
}
