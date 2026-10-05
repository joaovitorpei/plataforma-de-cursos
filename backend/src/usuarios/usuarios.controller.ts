import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Perfis } from '../auth/perfis.decorator';
import { Logado, ehAdmin, ehEquipe } from '../auth/usuario-logado';
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
   * Criação de conta pelo administrador — é por aqui que nascem as contas de
   * professor. O aluno que se inscreve sozinho usa POST /auth/cadastrar, que
   * é público e sempre cria USER.
   */
  @Perfis(Perfil.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Criar conta com perfil definido (administrador)',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Restrito ao administrador.' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * Lista usuários. O professor também precisa disto — é com esta lista que
   * ele escolhe o aluno ao lançar matrícula, avaliação ou certificado.
   *
   * O `?perfil=` filtra por tipo de conta, e é o que faz o campo "Aluno" de um
   * formulário mostrar só alunos, e o campo "Instrutor" só professores.
   */
  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
  @Get()
  @ApiOperation({
    summary: 'Listar usuários, opcionalmente filtrando por perfil',
  })
  @ApiQuery({
    name: 'perfil',
    required: false,
    enum: Perfil,
    description: 'Deixe em branco para trazer todos.',
  })
  @ApiResponse({ status: 403, description: 'Restrito à equipe da plataforma.' })
  findAll(@Query('perfil') perfil?: string) {
    return this.usuariosService.findAll(perfil);
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
    if (ehEquipe(logado) || logado.idUsuario === id) return;
    throw new ForbiddenException('Você só pode acessar o seu próprio cadastro');
  }
}
