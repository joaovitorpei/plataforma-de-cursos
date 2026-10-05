import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ehAdmin } from './usuario-logado';
import type { UsuarioLogado } from './usuario-logado';

/**
 * "Este curso é meu?"
 *
 * O dono de um curso é o instrutor dele — `Cursos.ID_Instrutor`. E a posse
 * desce em cadeia pelo conteúdo:
 *
 *     Curso   -> ID_Instrutor diz o dono
 *     Módulo  -> pertence a um curso -> mesmo dono
 *     Aula    -> pertence a um módulo -> pertence a um curso -> mesmo dono
 *
 * O administrador passa por cima de tudo: é o dono da plataforma.
 *
 * Categorias e trilhas ficam de fora de propósito — são taxonomia
 * compartilhada, não têm um professor responsável.
 */

const RECADO =
  'Este conteúdo pertence a outro professor. ' +
  'Você só pode editar os cursos em que é o instrutor.';

/** Barra quem não é o instrutor do curso (nem administrador). */
export async function exigirDonoDoCurso(
  prisma: PrismaService,
  idCurso: number,
  logado: UsuarioLogado,
): Promise<void> {
  if (ehAdmin(logado)) return;

  const curso = await prisma.curso.findUnique({
    where: { idCurso },
    select: { idInstrutor: true },
  });
  if (!curso) throw new NotFoundException('O curso informado não existe');

  if (curso.idInstrutor !== logado.idUsuario) {
    throw new ForbiddenException(RECADO);
  }
}

/** Mesma regra, partindo de um módulo: sobe até o curso. */
export async function exigirDonoDoModulo(
  prisma: PrismaService,
  idModulo: number,
  logado: UsuarioLogado,
): Promise<void> {
  if (ehAdmin(logado)) return;

  const modulo = await prisma.modulo.findUnique({
    where: { idModulo },
    select: { idCurso: true },
  });
  if (!modulo) throw new NotFoundException('O módulo informado não existe');

  await exigirDonoDoCurso(prisma, modulo.idCurso, logado);
}

/** Mesma regra, partindo de uma aula: sobe pelo módulo até o curso. */
export async function exigirDonoDaAula(
  prisma: PrismaService,
  idAula: number,
  logado: UsuarioLogado,
): Promise<void> {
  if (ehAdmin(logado)) return;

  const aula = await prisma.aula.findUnique({
    where: { idAula },
    select: { idModulo: true },
  });
  if (!aula) throw new NotFoundException('A aula informada não existe');

  await exigirDonoDoModulo(prisma, aula.idModulo, logado);
}
