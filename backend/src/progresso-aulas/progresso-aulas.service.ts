import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';

@Injectable()
export class ProgressoAulasService {
  constructor(private prisma: PrismaService) {}

  create(createProgressoAulaDto: CreateProgressoAulaDto) {
    const { dataConclusao, ...dados } = createProgressoAulaDto;
    return this.prisma.progressoAula.create({
      data: { ...dados, dataConclusao: new Date(dataConclusao) },
    });
  }

  findAll() {
    return this.prisma.progressoAula.findMany();
  }

  /**
   * A tabela tem chave primária composta (@@id([idUsuario, idAula])). O Prisma
   * junta os dois campos em um único filtro chamado `idUsuario_idAula`.
   */
  findOne(idUsuario: number, idAula: number) {
    return this.prisma.progressoAula.findUnique({
      where: { idUsuario_idAula: { idUsuario, idAula } },
    });
  }

  update(
    idUsuario: number,
    idAula: number,
    updateProgressoAulaDto: UpdateProgressoAulaDto,
  ) {
    const { dataConclusao, ...dados } = updateProgressoAulaDto;
    return this.prisma.progressoAula.update({
      where: { idUsuario_idAula: { idUsuario, idAula } },
      data: {
        ...dados,
        dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined,
      },
    });
  }

  remove(idUsuario: number, idAula: number) {
    return this.prisma.progressoAula.delete({
      where: { idUsuario_idAula: { idUsuario, idAula } },
    });
  }
}
