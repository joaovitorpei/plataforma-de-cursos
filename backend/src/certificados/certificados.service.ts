import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { exigirDono, filtroDoDono } from '../auth/propriedade';
import { ehEquipe } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

/** Status do progresso que conta como aula vencida. */
const CONCLUIDO = 'Concluido';

@Injectable()
export class CertificadosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Professor e dono emitem para quem quiserem.
   *
   * O aluno emite o **próprio** certificado, e só depois de terminar o curso:
   * é preciso ter progresso "Concluido" em todas as aulas. É o fluxo de uma
   * plataforma de verdade — ninguém pede diploma antes de assistir.
   */
  async create(
    createCertificadoDto: CreateCertificadoDto,
    logado: UsuarioLogado,
  ) {
    if (!ehEquipe(logado)) {
      exigirDono(createCertificadoDto.idUsuario, logado);

      const concluiu = await this.concluiuOCurso(
        createCertificadoDto.idUsuario,
        createCertificadoDto.idCurso,
      );
      if (!concluiu) {
        throw new ForbiddenException(
          'Você ainda não concluiu todas as aulas deste curso',
        );
      }
    }

    return this.prisma.certificado.create({ data: createCertificadoDto });
  }

  /** Cada aluno vê só os seus; a equipe vê todos. */
  findAll(logado: UsuarioLogado) {
    return this.prisma.certificado.findMany({ where: filtroDoDono(logado) });
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { idCertificado: id },
    });
    if (!certificado) throw new NotFoundException('Registro não encontrado');

    exigirDono(certificado.idUsuario, logado);
    return certificado;
  }

  update(id: number, updateCertificadoDto: UpdateCertificadoDto) {
    return this.prisma.certificado.update({
      where: { idCertificado: id },
      data: updateCertificadoDto,
    });
  }

  remove(id: number) {
    return this.prisma.certificado.delete({ where: { idCertificado: id } });
  }

  /**
   * Terminou o curso?
   *
   * Conta as aulas do curso e as que esta pessoa marcou como concluídas. Se
   * cobriu todas, terminou. Curso sem aula nenhuma não conta como concluído —
   * senão daria certificado de um curso vazio.
   *
   * Usado também pela tela, via GET /certificados/elegibilidade/:idCurso, para
   * decidir se mostra o botão de emitir.
   */
  async concluiuOCurso(idUsuario: number, idCurso: number): Promise<boolean> {
    const aulas = await this.prisma.aula.findMany({
      where: { modulo: { idCurso } },
      select: { idAula: true },
    });
    if (aulas.length === 0) return false;

    const concluidas = await this.prisma.progressoAula.count({
      where: {
        idUsuario,
        status: CONCLUIDO,
        idAula: { in: aulas.map((aula) => aula.idAula) },
      },
    });

    return concluidas >= aulas.length;
  }

  /** Quanto falta para o certificado — a tela usa para mostrar o progresso. */
  async elegibilidade(idUsuario: number, idCurso: number) {
    const aulas = await this.prisma.aula.findMany({
      where: { modulo: { idCurso } },
      select: { idAula: true },
    });

    const concluidas =
      aulas.length === 0
        ? 0
        : await this.prisma.progressoAula.count({
            where: {
              idUsuario,
              status: CONCLUIDO,
              idAula: { in: aulas.map((aula) => aula.idAula) },
            },
          });

    const jaTem = await this.prisma.certificado.findFirst({
      where: { idUsuario, idCurso },
      select: { idCertificado: true },
    });

    return {
      totalAulas: aulas.length,
      aulasConcluidas: concluidas,
      concluiu: aulas.length > 0 && concluidas >= aulas.length,
      jaEmitido: jaTem !== null,
    };
  }
}
