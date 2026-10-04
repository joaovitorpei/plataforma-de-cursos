import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { Perfil } from '../../generated/prisma/enums';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'João Vitor peixoto',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @ApiProperty({
    example: 'joao@email.com',
    description: 'Email do usuário (único)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({
    enum: Perfil,
    default: Perfil.USER,
    description:
      'Tipo de conta. USER é aluno; ADMIN é professor/administrador, que ' +
      'mantém o catálogo. Quando não informado, vale USER.',
  })
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;
}
