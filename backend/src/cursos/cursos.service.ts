import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

/** Só o nome — nada de e-mail ou qualquer outro dado do instrutor. */
const INSTRUTOR = { instrutor: { select: { nomeCompleto: true } } } as const;

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  create(createCursoDto: CreateCursoDto) {
    const { dataPublicacao, ...dados } = createCursoDto;
    return this.prisma.curso.create({
      data: {
        ...dados,
        // o JSON traz a data como texto ("2026-09-17"); o Prisma espera Date
        dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : undefined,
      },
    });
  }

  /**
   * O nome do instrutor vem junto. Sem isso a tela do aluno mostraria "—":
   * `GET /usuarios` é restrito a professores, então o aluno não teria como
   * descobrir de quem é o curso — e isso é informação de catálogo, pública
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

  update(id: number, updateCursoDto: UpdateCursoDto) {
    const { dataPublicacao, ...dados } = updateCursoDto;
    return this.prisma.curso.update({
      where: { idCurso: id },
      data: {
        ...dados,
        dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.curso.delete({ where: { idCurso: id } });
  }
}
