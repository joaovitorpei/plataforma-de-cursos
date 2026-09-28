import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePlanoDto {
  @ApiProperty({ example: 'Plano Anual', description: 'Nome do plano' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({
    example: 'Acesso a todos os cursos por 12 meses',
    description: 'Descrição do plano',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 299.9, description: 'Preço do plano em reais' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco: number;

  @ApiProperty({ example: 12, description: 'Duração do plano em meses' })
  @IsInt()
  @Min(1)
  duracaoMeses: number;
}
