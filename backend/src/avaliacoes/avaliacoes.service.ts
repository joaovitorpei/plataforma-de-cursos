import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  create(createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.prisma.avaliacao.create({ data: createAvaliacaoDto });
  }

  findAll() {
    return this.prisma.avaliacao.findMany();
  }

  findOne(id: number) {
    return this.prisma.avaliacao.findUnique({ where: { idAvaliacao: id } });
  }

  update(id: number, updateAvaliacaoDto: UpdateAvaliacaoDto) {
    return this.prisma.avaliacao.update({
      where: { idAvaliacao: id },
      data: updateAvaliacaoDto,
    });
  }

  remove(id: number) {
    return this.prisma.avaliacao.delete({ where: { idAvaliacao: id } });
  }
}
