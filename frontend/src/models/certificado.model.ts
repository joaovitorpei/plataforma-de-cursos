import { z } from 'zod';

import { opcional } from './comum';

/** Tabela Certificados. A dataEmissao é preenchida pelo banco. */
export interface ICertificado {
  idCertificado: number;
  idUsuario: number;
  idCurso: number;
  idTrilha: number | null;
  codigoVerificacao: string;
  dataEmissao: string;
}

export const certificadoSchema = z.object({
  idUsuario: z.coerce.number().int().positive('Selecione o aluno'),
  idCurso: z.coerce.number().int().positive('Selecione o curso'),
  idTrilha: opcional(z.coerce.number().int()),
  codigoVerificacao: z.string().min(4, 'O código é obrigatório'),
});

export type CertificadoEntrada = z.infer<typeof certificadoSchema>;
