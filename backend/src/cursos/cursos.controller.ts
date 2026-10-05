import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfis } from '../auth/perfis.decorator';
import { Logado } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { Perfil } from '../generated/prisma/enums';

@ApiTags('cursos')
@ApiBearerAuth('token')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo curso' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(
    @Body() createCursoDto: CreateCursoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.cursosService.create(createCursoDto, logado);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos' })
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um curso pelo ID' })
  findOne(@Param('id') id: string) {
    return this.cursosService.findOne(+id);
  }

  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um curso' })
  update(
    @Param('id') id: string,
    @Body() updateCursoDto: UpdateCursoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.cursosService.update(+id, updateCursoDto, logado);
  }

  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um curso' })
  remove(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.cursosService.remove(+id, logado);
  }
}
