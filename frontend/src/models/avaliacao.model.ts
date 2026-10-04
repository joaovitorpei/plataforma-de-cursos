import { z } from 'zod';

/** Tabela Avaliacoes. A dataAvaliacao é preenchida pelo banco. */
export interface IAvaliacao {
  idAvaliacao: number;
  idUsuario: number;
  idCurso: number;
  nota: number;
  comentario: string | null;
  dataAvaliacao: string;
}

export const avaliacaoSchema = z.object({
  idUsuario: z.coerce.number().int().positive('Selecione o aluno'),
  idCurso: z.coerce.number().int().positive('Selecione o curso'),
  nota: z.coerce
    .number()
    .int()
    .min(1, 'A nota vai de 1 a 5')
    .max(5, 'A nota vai de 1 a 5'),
  comentario: z.string().optional(),
});

export type AvaliacaoEntrada = z.infer<typeof avaliacaoSchema>;
