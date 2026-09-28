import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePagamentoDto {
  @ApiProperty({ example: 1, description: 'ID da assinatura sendo paga' })
  @IsInt()
  idAssinatura: number;

  @ApiProperty({ example: 299.9, description: 'Valor efetivamente pago' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorPago: number;

  @ApiProperty({
    example: 'Cartao de Credito',
    description: 'Forma de pagamento (Cartao de Credito, Pix, Boleto)',
  })
  @IsString()
  @IsNotEmpty()
  metodoPagamento: string;

  @ApiProperty({
    example: 'TX-2026-000123',
    description: 'Identificador da transação no gateway de pagamento',
  })
  @IsString()
  @IsNotEmpty()
  idTransacaoGateway: string;
}
