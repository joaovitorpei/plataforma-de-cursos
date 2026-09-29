import { z } from 'zod';

/** Tabela Matriculas. A dataMatricula é preenchida pelo banco. */
export interface IMatricula {
  idMatricula: number;
  idUsuario: number;
  idCurso: number;
  dataMatricula: string;
  dataConclusao: string | null;
}

export const matriculaSchema = z.object({
  idUsuario: z.coerce.number().int().positive('Selecione o aluno'),
  idCurso: z.coerce.number().int().positive('Selecione o curso'),
  dataConclusao: z.string().optional(),
});

export type MatriculaEntrada = z.infer<typeof matriculaSchema>;
