import { z } from 'zod';

export const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'] as const;
export type Nivel = (typeof NIVEIS)[number];

/** Tabela Cursos. */
export interface ICurso {
  idCurso: number;
  titulo: string;
  descricao: string | null;
  idInstrutor: number;
  idCategoria: number;
  nivel: string | null;
  dataPublicacao: string | null;
  totalAulas: number | null;
  totalHoras: number | null;
}

export const cursoSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  idInstrutor: z.coerce.number().int().positive('Selecione o instrutor'),
  idCategoria: z.coerce.number().int().positive('Selecione a categoria'),
  nivel: z.string().optional(),
  dataPublicacao: z.string().optional(),
  totalAulas: z.coerce.number().int().min(0, 'Não pode ser negativo').optional(),
  totalHoras: z.coerce.number().int().min(0, 'Não pode ser negativo').optional(),
});

export type CursoEntrada = z.infer<typeof cursoSchema>;
