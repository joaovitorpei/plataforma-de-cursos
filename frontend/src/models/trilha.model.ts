import { z } from 'zod';

/** Tabela Trilhas. */
export interface ITrilha {
  idTrilha: number;
  titulo: string;
  descricao: string | null;
  idCategoria: number;
}

export const trilhaSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  idCategoria: z.coerce.number().int().positive('Selecione a categoria'),
});

export type TrilhaEntrada = z.infer<typeof trilhaSchema>;
