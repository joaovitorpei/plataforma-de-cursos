import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';

@Injectable()
export class MatriculasService {
  constructor(private prisma: PrismaService) {}

  create(createMatriculaDto: CreateMatriculaDto) {
    const { dataConclusao, ...dados } = createMatriculaDto;
    return this.prisma.matricula.create({
      data: {
        ...dados,
        // a dataMatricula é preenchida pelo banco com a data de hoje
        dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.matricula.findMany();
  }

  findOne(id: number) {
    return this.prisma.matricula.findUnique({ where: { idMatricula: id } });
  }

  update(id: number, updateMatriculaDto: UpdateMatriculaDto) {
    const { dataConclusao, ...dados } = updateMatriculaDto;
    return this.prisma.matricula.update({
      where: { idMatricula: id },
      data: {
        ...dados,
        dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.matricula.delete({ where: { idMatricula: id } });
  }
}
