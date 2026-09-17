import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';

@Injectable()
export class TrilhasCursosService {
  constructor(private prisma: PrismaService) {}

  create(createTrilhaCursoDto: CreateTrilhaCursoDto) {
    return this.prisma.trilhaCurso.create({ data: createTrilhaCursoDto });
  }

  findAll() {
    return this.prisma.trilhaCurso.findMany();
  }

  /**
   * Chave primária composta (@@id([idTrilha, idCurso])): o Prisma junta os dois
   * campos em um único filtro chamado `idTrilha_idCurso`.
   */
  findOne(idTrilha: number, idCurso: number) {
    return this.prisma.trilhaCurso.findUnique({
      where: { idTrilha_idCurso: { idTrilha, idCurso } },
    });
  }

  update(
    idTrilha: number,
    idCurso: number,
    updateTrilhaCursoDto: UpdateTrilhaCursoDto,
  ) {
    return this.prisma.trilhaCurso.update({
      where: { idTrilha_idCurso: { idTrilha, idCurso } },
      data: updateTrilhaCursoDto,
    });
  }

  remove(idTrilha: number, idCurso: number) {
    return this.prisma.trilhaCurso.delete({
      where: { idTrilha_idCurso: { idTrilha, idCurso } },
    });
  }
}
