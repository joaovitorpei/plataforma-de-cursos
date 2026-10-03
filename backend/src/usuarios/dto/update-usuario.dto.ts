import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { Perfil } from '../../generated/prisma/enums';
import { CreateUsuarioDto } from './create-usuario.dto';

/**
 * Todos os campos do cadastro viram opcionais — é um PATCH, atualização
 * parcial. O `perfil` só existe aqui, e não no DTO de criação: quem se
 * cadastra nasce USER, e só um administrador promove alguém depois.
 */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ApiPropertyOptional({
    enum: Perfil,
    example: Perfil.USER,
    description: 'Perfil de acesso. Só administradores podem alterar.',
  })
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;
}
