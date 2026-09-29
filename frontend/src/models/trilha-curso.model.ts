import { z } from 'zod';

/** Tabela Trilhas_Cursos — chave primária composta (idTrilha + idCurso). */
export interface ITrilhaCurso {
  idTrilha: number;
  idCurso: number;
  ordem: number;
}

export const trilhaCursoSchema = z.object({
  idTrilha: z.coerce.number().int().positive('Selecione a trilha'),
  idCurso: z.coerce.number().int().positive('Selecione o curso'),
  ordem: z.coerce.number().int().min(1, 'A ordem começa em 1'),
});

export type TrilhaCursoEntrada = z.infer<typeof trilhaCursoSchema>;
