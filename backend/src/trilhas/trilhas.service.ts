import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

@Injectable()
export class TrilhasService {
  constructor(private prisma: PrismaService) {}

  create(createTrilhaDto: CreateTrilhaDto) {
    return this.prisma.trilha.create({ data: createTrilhaDto });
  }

  findAll() {
    return this.prisma.trilha.findMany();
  }

  findOne(id: number) {
    return this.prisma.trilha.findUnique({ where: { idTrilha: id } });
  }

  update(id: number, updateTrilhaDto: UpdateTrilhaDto) {
    return this.prisma.trilha.update({
      where: { idTrilha: id },
      data: updateTrilhaDto,
    });
  }

  remove(id: number) {
    return this.prisma.trilha.delete({ where: { idTrilha: id } });
  }
}
