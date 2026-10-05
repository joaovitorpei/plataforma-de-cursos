import { Injectable } from '@nestjs/common';

import { exigirDonoDoCurso } from '../auth/dono-do-curso';
import { ehAdmin } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

/** Só o nome — nada de e-mail ou qualquer outro dado do instrutor. */
const INSTRUTOR = { instrutor: { select: { nomeCompleto: true } } } as const;

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  /**
   * O professor cria curso para si mesmo — o `idInstrutor` é sobrescrito com
   * o dele, não importa o que venha no corpo. Só o administrador escolhe de
   * quem é o curso.
   */
  create(createCursoDto: CreateCursoDto, logado: UsuarioLogado) {
    const { dataPublicacao, ...dados } = createCursoDto;

    return this.prisma.curso.create({
      data: {
        ...dados,
        idInstrutor: ehAdmin(logado) ? dados.idInstrutor : logado.idUsuario,
        // o JSON traz a data como texto ("2026-09-17"); o Prisma espera Date
        dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : undefined,
      },
    });
  }

  /**
   * O nome do instrutor vem junto. Sem isso a tela do aluno mostraria "—":
   * `GET /usuarios` é restrito à equipe, então o aluno não teria como
   * descobrir de quem é o curso — e isso é informação de catálogo, visível
   * para quem está logado.
   */
  findAll() {
    return this.prisma.curso.findMany({ include: INSTRUTOR });
  }

  findOne(id: number) {
    return this.prisma.curso.findUnique({
      where: { idCurso: id },
      include: INSTRUTOR,
    });
  }

  async update(
    id: number,
    updateCursoDto: UpdateCursoDto,
    logado: UsuarioLogado,
  ) {
    await exigirDonoDoCurso(this.prisma, id, logado);

    const { dataPublicacao, ...dados } = updateCursoDto;

    // Passar o curso para outro professor é decisão do administrador.
    if (!ehAdmin(logado)) delete dados.idInstrutor;

    return this.prisma.curso.update({
      where: { idCurso: id },
      data: {
        ...dados,
        dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : undefined,
      },
    });
  }

  async remove(id: number, logado: UsuarioLogado) {
    await exigirDonoDoCurso(this.prisma, id, logado);
    return this.prisma.curso.delete({ where: { idCurso: id } });
  }
}
