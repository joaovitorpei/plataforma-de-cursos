import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCursoDto {
  @ApiProperty({ example: 'NestJS do zero', description: 'Título do curso' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({
    example: 'Construindo uma API REST com NestJS e Prisma',
    description: 'Descrição do curso',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 1, description: 'ID do usuário que é o instrutor' })
  @IsInt()
  idInstrutor: number;

  @ApiProperty({ example: 1, description: 'ID da categoria do curso' })
  @IsInt()
  idCategoria: number;

  @ApiPropertyOptional({
    example: 'Iniciante',
    description: 'Nível do curso (Iniciante, Intermediário, Avançado)',
  })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiPropertyOptional({
    example: '2026-09-17',
    description: 'Data de publicação no formato AAAA-MM-DD',
  })
  @IsOptional()
  @IsDateString()
  dataPublicacao?: string;

  @ApiPropertyOptional({ example: 24, description: 'Total de aulas do curso' })
  @IsOptional()
  @IsInt()
  totalAulas?: number;

  @ApiPropertyOptional({ example: 12, description: 'Carga horária em horas' })
  @IsOptional()
  @IsInt()
  totalHoras?: number;
}
