import { Injectable } from '@nestjs/common';

import { exigirDonoDoCurso, exigirDonoDoModulo } from '../auth/dono-do-curso';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  /** Só dá para pendurar módulo em curso seu. */
  async create(createModuloDto: CreateModuloDto, logado: UsuarioLogado) {
    await exigirDonoDoCurso(this.prisma, createModuloDto.idCurso, logado);
    return this.prisma.modulo.create({ data: createModuloDto });
  }

  findAll() {
    return this.prisma.modulo.findMany();
  }

  findOne(id: number) {
    return this.prisma.modulo.findUnique({ where: { idModulo: id } });
  }

  async update(
    id: number,
    updateModuloDto: UpdateModuloDto,
    logado: UsuarioLogado,
  ) {
    await exigirDonoDoModulo(this.prisma, id, logado);

    // Mover o módulo para outro curso exige ser dono do destino também.
    if (updateModuloDto.idCurso !== undefined) {
      await exigirDonoDoCurso(this.prisma, updateModuloDto.idCurso, logado);
    }

    return this.prisma.modulo.update({
      where: { idModulo: id },
      data: updateModuloDto,
    });
  }

  async remove(id: number, logado: UsuarioLogado) {
    await exigirDonoDoModulo(this.prisma, id, logado);
    return this.prisma.modulo.delete({ where: { idModulo: id } });
  }
}
