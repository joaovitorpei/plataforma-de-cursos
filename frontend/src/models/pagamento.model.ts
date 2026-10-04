import { z } from 'zod';

export const METODOS_PAGAMENTO = [
  'Pix',
  'Cartao de Credito',
  'Boleto',
] as const;

/** Tabela Pagamentos. O valorPago vem como texto (Decimal do Prisma). */
export interface IPagamento {
  idPagamento: number;
  idAssinatura: number;
  valorPago: string;
  dataPagamento: string;
  metodoPagamento: string;
  idTransacaoGateway: string;
}

export const pagamentoSchema = z.object({
  idAssinatura: z.coerce.number().int().positive('Selecione a assinatura'),
  valorPago: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  metodoPagamento: z.string().min(1, 'Selecione o método'),
  idTransacaoGateway: z.string().min(3, 'Informe o código da transação'),
});

export type PagamentoEntrada = z.infer<typeof pagamentoSchema>;
