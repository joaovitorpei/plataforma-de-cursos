import { Injectable, NotFoundException } from '@nestjs/common';

import { exigirDono, filtroDoDono } from '../auth/propriedade';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';

@Injectable()
export class MatriculasService {
  constructor(private prisma: PrismaService) {}

  create(createMatriculaDto: CreateMatriculaDto, logado: UsuarioLogado) {
    // Um aluno só matricula a si mesmo; o administrador matricula qualquer um.
    exigirDono(createMatriculaDto.idUsuario, logado);

    const { dataConclusao, ...dados } = createMatriculaDto;
    return this.prisma.matricula.create({
      data: {
        ...dados,
        // a dataMatricula é preenchida pelo banco com a data de hoje
        dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined,
      },
    });
  }

  findAll(logado: UsuarioLogado) {
    return this.prisma.matricula.findMany({ where: filtroDoDono(logado) });
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const matricula = await this.prisma.matricula.findUnique({
      where: { idMatricula: id },
    });
    if (!matricula) throw new NotFoundException('Registro não encontrado');

    exigirDono(matricula.idUsuario, logado);
    return matricula;
  }

  async update(
    id: number,
    updateMatriculaDto: UpdateMatriculaDto,
    logado: UsuarioLogado,
  ) {
    // Carrega antes para saber de quem é — e de quebra já valida o id.
    await this.findOne(id, logado);

    const { dataConclusao, ...dados } = updateMatriculaDto;
    return this.prisma.matricula.update({
      where: { idMatricula: id },
      data: {
        ...dados,
        dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined,
      },
    });
  }

  async remove(id: number, logado: UsuarioLogado) {
    await this.findOne(id, logado);
    return this.prisma.matricula.delete({ where: { idMatricula: id } });
  }

  /** Usado pelas aulas: o conteúdo só abre para quem está matriculado. */
  async estaMatriculado(idUsuario: number, idCurso: number): Promise<boolean> {
    const matricula = await this.prisma.matricula.findFirst({
      where: { idUsuario, idCurso },
      select: { idMatricula: true },
    });
    return matricula !== null;
  }
}
