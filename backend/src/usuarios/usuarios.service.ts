import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // biblioteca para gerar o hash da senha
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // A senha nunca é salva como o usuário digitou: guardamos só o hash.
    const senha = await this.gerarHash(createUsuarioDto.senha);
    return this.prisma.usuario.create({
      data: { ...createUsuarioDto, senha },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { idUsuario: id } });
  }

  // Usado pelo AuthService durante o login.
  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { senha, ...dados } = updateUsuarioDto;
    return this.prisma.usuario.update({
      where: { idUsuario: id },
      data: {
        ...dados,
        // Se a senha vier no PATCH, ela também precisa virar hash.
        ...(senha && { senha: await this.gerarHash(senha) }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { idUsuario: id } });
  }

  private async gerarHash(senha: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(senha, salt);
  }
}
