import { z } from 'zod';

/** Tabela Modulos. */
export interface IModulo {
  idModulo: number;
  idCurso: number;
  titulo: string;
  ordem: number;
}

export const moduloSchema = z.object({
  idCurso: z.coerce.number().int().positive('Selecione o curso'),
  titulo: z.string().min(2, 'O título é obrigatório'),
  ordem: z.coerce.number().int().min(1, 'A ordem começa em 1'),
});

export type ModuloEntrada = z.infer<typeof moduloSchema>;
