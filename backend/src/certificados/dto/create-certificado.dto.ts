import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCertificadoDto {
  @ApiProperty({
    example: 1,
    description: 'ID do usuário que recebeu o certificado',
  })
  @IsInt()
  idUsuario: number;

  @ApiProperty({ example: 1, description: 'ID do curso concluído' })
  @IsInt()
  idCurso: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da trilha, quando o certificado é de uma trilha inteira',
  })
  @IsOptional()
  @IsInt()
  idTrilha?: number;

  @ApiProperty({
    example: 'CERT-2026-0001',
    description: 'Código único usado para validar o certificado',
  })
  @IsString()
  @IsNotEmpty()
  codigoVerificacao: string;
}
