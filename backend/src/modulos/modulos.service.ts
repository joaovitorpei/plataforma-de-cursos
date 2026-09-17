import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  create(createModuloDto: CreateModuloDto) {
    return this.prisma.modulo.create({ data: createModuloDto });
  }

  findAll() {
    return this.prisma.modulo.findMany();
  }

  findOne(id: number) {
    return this.prisma.modulo.findUnique({ where: { idModulo: id } });
  }

  update(id: number, updateModuloDto: UpdateModuloDto) {
    return this.prisma.modulo.update({
      where: { idModulo: id },
      data: updateModuloDto,
    });
  }

  remove(id: number) {
    return this.prisma.modulo.delete({ where: { idModulo: id } });
  }
}
