import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAulaDto {
  @ApiProperty({
    example: 1,
    description: 'ID do módulo ao qual a aula pertence',
  })
  @IsInt()
  idModulo: number;

  @ApiProperty({
    example: 'Criando o primeiro controller',
    description: 'Título da aula',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    example: 'Video',
    description: 'Tipo do conteúdo (Video, Texto, Quiz)',
  })
  @IsString()
  @IsNotEmpty()
  tipoConteudo: string;

  @ApiPropertyOptional({
    example: 'https://cdn.plataforma.com/aulas/1.mp4',
    description: 'Endereço do conteúdo da aula',
  })
  @IsOptional()
  @IsString()
  urlConteudo?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Duração da aula em minutos',
  })
  @IsOptional()
  @IsInt()
  duracaoMinutos?: number;

  @ApiProperty({ example: 1, description: 'Posição da aula dentro do módulo' })
  @IsInt()
  ordem: number;
}
