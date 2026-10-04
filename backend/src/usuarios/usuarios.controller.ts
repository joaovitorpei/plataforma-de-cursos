import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Perfis } from '../auth/perfis.decorator';
import { Publico } from '../auth/publico.decorator';
import { Logado, ehAdmin } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { Perfil } from '../generated/prisma/enums';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiBearerAuth('token')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Cadastro — a única rota pública junto com o login.
   *
   * A pessoa escolhe aqui se é aluno (USER) ou professor (ADMIN). Foi uma
   * decisão de projeto: facilita a demonstração e o uso em sala. Vale saber
   * que, num sistema aberto ao público, essa escolha precisaria de alguma
   * trava — convite, código de instrutor ou aprovação — senão qualquer pessoa
   * se promoveria a administrador. A autorização em si continua valendo: um
   * USER realmente não consegue criar nem apagar nada do catálogo.
   */
  @Publico()
  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo usuário (aluno ou professor)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Perfis(Perfil.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários (administrador)' })
  @ApiResponse({ status: 403, description: 'Restrito a administradores.' })
  findAll() {
    return this.usuariosService.findAll();
  }

  /** O aluno enxerga o próprio cadastro; o administrador enxerga qualquer um. */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiResponse({
    status: 403,
    description: 'Só o próprio usuário ou um administrador.',
  })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    this.somenteDonoOuAdmin(+id, logado);
    return this.usuariosService.findOne(+id);
  }

  /** Mesma regra da busca. Trocar o perfil, porém, só o administrador pode. */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiResponse({
    status: 403,
    description: 'Só o próprio usuário ou um administrador.',
  })
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Logado() logado: UsuarioLogado,
  ) {
    this.somenteDonoOuAdmin(+id, logado);

    if (updateUsuarioDto.perfil !== undefined && !ehAdmin(logado)) {
      throw new ForbiddenException(
        'Somente um administrador pode alterar o perfil de um usuário',
      );
    }

    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Perfis(Perfil.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuário (administrador)' })
  @ApiResponse({ status: 403, description: 'Restrito a administradores.' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }

  /** Deixa passar o próprio usuário ou qualquer administrador. */
  private somenteDonoOuAdmin(id: number, logado: UsuarioLogado): void {
    if (ehAdmin(logado) || logado.idUsuario === id) return;
    throw new ForbiddenException('Você só pode acessar o seu próprio cadastro');
  }
}
