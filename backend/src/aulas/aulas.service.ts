import { Injectable } from '@nestjs/common';

import { exigirDonoDaAula, exigirDonoDoModulo } from '../auth/dono-do-curso';
import { ehEquipe } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';

/** "todos" vale para a equipe — professor e dono veem o conteúdo de tudo. */
type CursosLiberados = Set<number> | 'todos';

@Injectable()
export class AulasService {
  constructor(private prisma: PrismaService) {}

  /** Só dá para pendurar aula em módulo de curso seu. */
  async create(createAulaDto: CreateAulaDto, logado: UsuarioLogado) {
    await exigirDonoDoModulo(this.prisma, createAulaDto.idModulo, logado);
    return this.prisma.aula.create({ data: createAulaDto });
  }

  /**
   * Todo mundo vê a lista de aulas — título, tipo, duração — para conhecer o
   * curso antes de entrar. Mas o `urlConteudo`, que é o conteúdo em si, só sai
   * para quem está matriculado no curso daquela aula.
   */
  async findAll(logado: UsuarioLogado) {
    const aulas = await this.prisma.aula.findMany({
      include: { modulo: { select: { idCurso: true } } },
      orderBy: [{ idModulo: 'asc' }, { ordem: 'asc' }],
    });

    const liberados = await this.cursosLiberados(logado);
    return aulas.map((aula) => this.aplicarAcesso(aula, liberados));
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const aula = await this.prisma.aula.findUnique({
      where: { idAula: id },
      include: { modulo: { select: { idCurso: true } } },
    });
    if (!aula) return null;

    const liberados = await this.cursosLiberados(logado);
    return this.aplicarAcesso(aula, liberados);
  }

  async update(
    id: number,
    updateAulaDto: UpdateAulaDto,
    logado: UsuarioLogado,
  ) {
    await exigirDonoDaAula(this.prisma, id, logado);

    // Mover a aula para outro módulo exige ser dono do destino também.
    if (updateAulaDto.idModulo !== undefined) {
      await exigirDonoDoModulo(this.prisma, updateAulaDto.idModulo, logado);
    }

    return this.prisma.aula.update({
      where: { idAula: id },
      data: updateAulaDto,
    });
  }

  async remove(id: number, logado: UsuarioLogado) {
    await exigirDonoDaAula(this.prisma, id, logado);
    return this.prisma.aula.delete({ where: { idAula: id } });
  }

  /** Em quais cursos esta pessoa já pode assistir. Uma consulta só. */
  private async cursosLiberados(
    logado: UsuarioLogado,
  ): Promise<CursosLiberados> {
    if (ehEquipe(logado)) return 'todos';

    const matriculas = await this.prisma.matricula.findMany({
      where: { idUsuario: logado.idUsuario },
      select: { idCurso: true },
    });
    return new Set(matriculas.map((matricula) => matricula.idCurso));
  }

  /**
   * Monta a resposta: tira a relação `modulo` (que só serviu para descobrir o
   * curso), acrescenta `idCurso` e `liberada` — que a tela usa para mostrar o
   * cadeado — e esconde o conteúdo de quem não está matriculado.
   */
  private aplicarAcesso(
    aula: { modulo: { idCurso: number }; urlConteudo: string | null } & Record<
      string,
      unknown
    >,
    liberados: CursosLiberados,
  ) {
    const { modulo, ...dados } = aula;
    const liberada = liberados === 'todos' || liberados.has(modulo.idCurso);

    return {
      ...dados,
      idCurso: modulo.idCurso,
      liberada,
      urlConteudo: liberada ? dados.urlConteudo : null,
    };
  }
}
