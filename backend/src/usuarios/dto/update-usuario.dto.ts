import { PartialType } from '@nestjs/swagger';

import { CreateUsuarioDto } from './create-usuario.dto';

/**
 * Todos os campos do cadastro viram opcionais — é um PATCH, atualização
 * parcial. O `perfil` vem junto, mas trocar o perfil de uma conta já existente
 * continua sendo coisa de administrador: quem barra isso é o controller.
 */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
