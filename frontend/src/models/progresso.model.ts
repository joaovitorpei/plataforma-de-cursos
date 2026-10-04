import { z } from 'zod';

export const STATUS_PROGRESSO = [
  'Concluido',
  'Em andamento',
  'Revisado',
] as const;

/** Tabela Progresso_Aulas — chave primária composta (idUsuario + idAula). */
export interface IProgressoAula {
  idUsuario: number;
  idAula: number;
  dataConclusao: string;
  status: string;
}

export const progressoSchema = z.object({
  idUsuario: z.coerce.number().int().positive('Selecione o aluno'),
  idAula: z.coerce.number().int().positive('Selecione a aula'),
  dataConclusao: z.string().min(1, 'Informe a data de conclusão'),
  status: z.string().min(1, 'Informe a situação'),
});

export type ProgressoEntrada = z.infer<typeof progressoSchema>;
