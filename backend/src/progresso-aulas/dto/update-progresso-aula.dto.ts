import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProgressoAulaDto } from './create-progresso-aula.dto';

/**
 * idUsuario e idAula formam a chave primária: eles identificam o registro e
 * por isso vão na URL, não no corpo. O OmitType tira os dois do DTO de update.
 */
export class UpdateProgressoAulaDto extends PartialType(
  OmitType(CreateProgressoAulaDto, ['idUsuario', 'idAula'] as const),
) {}
