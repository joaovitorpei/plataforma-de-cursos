import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateMatriculaDto {
  @ApiProperty({
    example: 1,
    description: 'ID do usuário que está se matriculando',
  })
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do curso' })
  @IsInt()
  idCurso: number;

  @ApiPropertyOptional({
    example: '2026-09-17',
    description: 'Data em que o aluno concluiu o curso (AAAA-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dataConclusao?: string;
}
