import { z } from 'zod';

import { opcional } from './comum';

export const TIPOS_CONTEUDO = ['Video', 'Texto', 'Quiz'] as const;
export type TipoConteudo = (typeof TIPOS_CONTEUDO)[number];

/** Tabela Aulas. */
export interface IAula {
  idAula: number;
  idModulo: number;
  titulo: string;
  tipoConteudo: string;
  urlConteudo: string | null;
  duracaoMinutos: number | null;
  ordem: number;
}

export const aulaSchema = z.object({
  idModulo: z.coerce.number().int().positive('Selecione o módulo'),
  titulo: z.string().min(2, 'O título é obrigatório'),
  tipoConteudo: z.string().min(1, 'Selecione o tipo de conteúdo'),
  urlConteudo: z.string().optional(),
  duracaoMinutos: opcional(z.coerce.number().int().min(0, 'Não pode ser negativo')),
  ordem: z.coerce.number().int().min(1, 'A ordem começa em 1'),
});

export type AulaEntrada = z.infer<typeof aulaSchema>;
