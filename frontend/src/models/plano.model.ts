import { z } from 'zod';

/** Tabela Planos. O preço vem como texto: o Prisma serializa Decimal assim. */
export interface IPlano {
  idPlano: number;
  nome: string;
  descricao: string | null;
  preco: string;
  duracaoMeses: number;
}

export const planoSchema = z.object({
  nome: z.string().min(2, 'O nome é obrigatório'),
  descricao: z.string().optional(),
  preco: z.coerce.number().min(0, 'O preço não pode ser negativo'),
  duracaoMeses: z.coerce.number().int().min(1, 'A duração mínima é 1 mês'),
});

export type PlanoEntrada = z.infer<typeof planoSchema>;
