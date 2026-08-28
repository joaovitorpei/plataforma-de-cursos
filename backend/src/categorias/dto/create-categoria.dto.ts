import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Programação', description: 'Nome da categoria (único)' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({
    example: 'Cursos de desenvolvimento de software e lógica de programação',
    description: 'Descrição da categoria',
  })
  @IsOptional()
  @IsString()
  descricao?: string;
}
