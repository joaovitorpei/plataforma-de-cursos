import { z } from 'zod';

/** Tabela Categorias. */
export interface ICategoria {
  idCategoria: number;
  nome: string;
  descricao: string | null;
}

export const categoriaSchema = z.object({
  nome: z.string().min(2, 'O nome é obrigatório'),
  descricao: z.string().optional(),
});

export type CategoriaEntrada = z.infer<typeof categoriaSchema>;
