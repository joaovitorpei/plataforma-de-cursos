import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateAssinaturaDto {
  @ApiProperty({ example: 1, description: 'ID do usuário assinante' })
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do plano contratado' })
  @IsInt()
  idPlano: number;

  @ApiProperty({
    example: '2026-09-28',
    description: 'Início da assinatura (AAAA-MM-DD)',
  })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({
    example: '2027-09-28',
    description: 'Fim da assinatura (AAAA-MM-DD)',
  })
  @IsDateString()
  dataFim: string;
}
