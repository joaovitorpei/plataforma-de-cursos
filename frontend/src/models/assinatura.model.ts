import { z } from 'zod';

/** Tabela Assinaturas. */
export interface IAssinatura {
  idAssinatura: number;
  idUsuario: number;
  idPlano: number;
  dataInicio: string;
  dataFim: string;
}

export const assinaturaSchema = z
  .object({
    idUsuario: z.coerce.number().int().positive('Selecione o assinante'),
    idPlano: z.coerce.number().int().positive('Selecione o plano'),
    dataInicio: z.string().min(1, 'Informe a data de início'),
    dataFim: z.string().min(1, 'Informe a data de fim'),
  })
  .refine((v) => v.dataFim >= v.dataInicio, {
    message: 'A data de fim não pode ser anterior ao início',
    path: ['dataFim'],
  });

export type AssinaturaEntrada = z.infer<typeof assinaturaSchema>;
