import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Logado } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';

@ApiTags('matriculas')
@ApiBearerAuth('token')
@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  @ApiOperation({ summary: 'Matricular um usuário em um curso' })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(
    @Body() createMatriculaDto: CreateMatriculaDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.matriculasService.create(createMatriculaDto, logado);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas' })
  findAll(@Logado() logado: UsuarioLogado) {
    return this.matriculasService.findAll(logado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID' })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.matriculasService.findOne(+id, logado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma matrícula' })
  update(
    @Param('id') id: string,
    @Body() updateMatriculaDto: UpdateMatriculaDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.matriculasService.update(+id, updateMatriculaDto, logado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  remove(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.matriculasService.remove(+id, logado);
  }
}
