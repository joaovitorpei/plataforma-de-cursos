import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Cadastro feito pela própria pessoa, na tela de login.
 *
 * Repare no que **não** tem aqui: o campo `perfil`. Quem se inscreve sozinho
 * vira aluno, e ponto — não existe nem como pedir outra coisa. Professor e
 * dono são criados pelo administrador, com o CreateUsuarioDto.
 */
export class CadastroDto {
  @ApiProperty({ example: 'Pedro Aluno', description: 'Nome completo' })
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @ApiProperty({ example: 'pedro@email.com', description: 'E-mail (único)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6, description: 'Senha' })
  @IsString()
  @MinLength(6)
  senha: string;
}
