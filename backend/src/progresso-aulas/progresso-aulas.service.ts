import { Injectable } from '@nestjs/common';

import { exigirDono, filtroDoDono } from '../auth/propriedade';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';

/**
 * Aqui a regra de dono sai de graça: o id do usuário faz parte da própria
 * chave primária, e vai na URL. Não é preciso ir ao banco para saber de quem
 * é o registro — basta olhar o primeiro id da rota.
 */
@Injectable()
export class ProgressoAulasService {
  constructor(private prisma: PrismaService) {}

  create(
    createProgressoAulaDto: CreateProgressoAulaDto,
    logado: UsuarioLogado,
  ) {
    exigirDono(createProgressoAulaDto.idUsuario, logado);

    const { dataConclusao, ...dados } = createProgressoAulaDto;
    return this.prisma.progressoAula.create({
      data: { ...dados, dataConclusao: new Date(dataConclusao) },
    });
  }

  findAll(logado: UsuarioLogado) {
    return this.prisma.progressoAula.findMany({ where: filtroDoDono(logado) });
  }

  /**
   * A tabela tem chave primária composta (@@id([idUsuario, idAula])). O Prisma
   * junta os dois campos em um único filtro chamado `idUsuario_idAula`.
   */
  findOne(idUsuario: number, idAula: number, logado: UsuarioLogado) {
    exigirDono(idUsuario, logado);
    return this.prisma.progressoAula.findUnique({
      where: { idUsuario_idAula: { idUsuario, idAula } },
    });
  }

  update(
    idUsuario: number,
    idAula: number,
    updateProgressoAulaDto: UpdateProgressoAulaDto,
    logado: UsuarioLogado,
  ) {
    exigirDono(idUsuario, logado);

    const { dataConclusao, ...dados } = updateProgressoAulaDto;
    return this.prisma.progressoAula.update({
      where: { idUsuario_idAula: { idUsuario, idAula } },
      data: {
        ...dados,
        dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined,
      },
    });
  }

  remove(idUsuario: number, idAula: number, logado: UsuarioLogado) {
    exigirDono(idUsuario, logado);
    return this.prisma.progressoAula.delete({
      where: { idUsuario_idAula: { idUsuario, idAula } },
    });
  }
}
