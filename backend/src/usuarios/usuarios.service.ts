import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// A senha nunca sai da API: escolhemos explicitamente os campos retornados.
const camposPublicos = {
  id: true,
  nomeCompleto: true,
  email: true,
  dataCadastro: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { senha, ...resto } = createUsuarioDto;

    return this.prisma.usuario.create({
      data: { ...resto, senhaHash: await bcrypt.hash(senha, 10) },
      select: camposPublicos,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({ select: camposPublicos });
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: camposPublicos,
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { senha, ...resto } = updateUsuarioDto;

    return this.prisma.usuario.update({
      where: { id },
      // A senha só é reprocessada se vier no corpo da requisição.
      data: { ...resto, ...(senha && { senhaHash: await bcrypt.hash(senha, 10) }) },
      select: camposPublicos,
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id }, select: camposPublicos });
  }
}
