import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAvaliacaoDto {
  @ApiProperty({ example: 1, description: 'ID do usuário que avaliou' })
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do curso avaliado' })
  @IsInt()
  idCurso: number;

  @ApiProperty({
    example: 5,
    description: 'Nota de 1 a 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @ApiPropertyOptional({
    example: 'Curso muito bem explicado, recomendo.',
    description: 'Comentário sobre o curso',
  })
  @IsOptional()
  @IsString()
  comentario?: string;
}
