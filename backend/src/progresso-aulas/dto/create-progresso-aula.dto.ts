import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProgressoAulaDto {
  @ApiProperty({ example: 1, description: 'ID do usuário que assistiu a aula' })
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID da aula assistida' })
  @IsInt()
  idAula: number;

  @ApiProperty({
    example: '2026-09-17',
    description: 'Data em que a aula foi concluída (AAAA-MM-DD)',
  })
  @IsDateString()
  dataConclusao: string;

  @ApiProperty({ example: 'Concluido', description: 'Situação da aula' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
