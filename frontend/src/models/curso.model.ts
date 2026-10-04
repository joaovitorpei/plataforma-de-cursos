import { z } from 'zod';

import { opcional } from './comum';

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

  /** Vem junto da API: o nome de quem ministra, para o catálogo. */
  instrutor?: { nomeCompleto: string };
}

export const cursoSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  idInstrutor: z.coerce.number().int().positive('Selecione o instrutor'),
  idCategoria: z.coerce.number().int().positive('Selecione a categoria'),
  nivel: z.string().optional(),
  dataPublicacao: opcional(z.string()),
  totalAulas: opcional(z.coerce.number().int().min(0, 'Não pode ser negativo')),
  totalHoras: opcional(z.coerce.number().int().min(0, 'Não pode ser negativo')),
});

export type CursoEntrada = z.infer<typeof cursoSchema>;
