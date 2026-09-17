import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulasService {
  constructor(private prisma: PrismaService) {}

  create(createAulaDto: CreateAulaDto) {
    return this.prisma.aula.create({ data: createAulaDto });
  }

  findAll() {
    return this.prisma.aula.findMany();
  }

  findOne(id: number) {
    return this.prisma.aula.findUnique({ where: { idAula: id } });
  }

  update(id: number, updateAulaDto: UpdateAulaDto) {
    return this.prisma.aula.update({
      where: { idAula: id },
      data: updateAulaDto,
    });
  }

  remove(id: number) {
    return this.prisma.aula.delete({ where: { idAula: id } });
  }
}
