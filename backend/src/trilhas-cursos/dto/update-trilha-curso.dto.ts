import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTrilhaCursoDto } from './create-trilha-curso.dto';

/**
 * idTrilha e idCurso formam a chave primária: identificam o registro e vão na
 * URL. O que sobra para atualizar é a ordem do curso dentro da trilha.
 */
export class UpdateTrilhaCursoDto extends PartialType(
  OmitType(CreateTrilhaCursoDto, ['idTrilha', 'idCurso'] as const),
) {}
