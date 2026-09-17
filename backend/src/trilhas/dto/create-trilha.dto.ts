import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrilhaDto {
  @ApiProperty({
    example: 'Desenvolvedor Back-end',
    description: 'Título da trilha',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({
    example: 'Sequência de cursos para se tornar dev back-end',
    description: 'Descrição da trilha',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 1, description: 'ID da categoria da trilha' })
  @IsInt()
  idCategoria: number;
}
