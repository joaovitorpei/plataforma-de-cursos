import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateTrilhaCursoDto {
  @ApiProperty({ example: 1, description: 'ID da trilha' })
  @IsInt()
  idTrilha: number;

  @ApiProperty({ example: 1, description: 'ID do curso que entra na trilha' })
  @IsInt()
  idCurso: number;

  @ApiProperty({ example: 1, description: 'Posição do curso dentro da trilha' })
  @IsInt()
  ordem: number;
}
