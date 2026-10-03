import { Injectable, NotFoundException } from '@nestjs/common';

import { exigirDono, filtroDoDono } from '../auth/propriedade';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  create(createAvaliacaoDto: CreateAvaliacaoDto, logado: UsuarioLogado) {
    // Ninguém avalia em nome de outra pessoa.
    exigirDono(createAvaliacaoDto.idUsuario, logado);
    return this.prisma.avaliacao.create({ data: createAvaliacaoDto });
  }

  findAll(logado: UsuarioLogado) {
    return this.prisma.avaliacao.findMany({ where: filtroDoDono(logado) });
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { idAvaliacao: id },
    });
    if (!avaliacao) throw new NotFoundException('Registro não encontrado');

    exigirDono(avaliacao.idUsuario, logado);
    return avaliacao;
  }

  async update(
    id: number,
    updateAvaliacaoDto: UpdateAvaliacaoDto,
    logado: UsuarioLogado,
  ) {
    await this.findOne(id, logado);
    return this.prisma.avaliacao.update({
      where: { idAvaliacao: id },
      data: updateAvaliacaoDto,
    });
  }

  async remove(id: number, logado: UsuarioLogado) {
    await this.findOne(id, logado);
    return this.prisma.avaliacao.delete({ where: { idAvaliacao: id } });
  }

  /** Todas as avaliações de um curso — usado na tela de detalhe do curso. */
  listarDoCurso(idCurso: number) {
    return this.prisma.avaliacao.findMany({ where: { idCurso } });
  }
}
