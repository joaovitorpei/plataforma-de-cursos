import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateModuloDto {
  @ApiProperty({
    example: 1,
    description: 'ID do curso ao qual o módulo pertence',
  })
  @IsInt()
  idCurso: number;

  @ApiProperty({
    example: 'Introdução ao NestJS',
    description: 'Título do módulo',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 1, description: 'Posição do módulo dentro do curso' })
  @IsInt()
  ordem: number;
}
