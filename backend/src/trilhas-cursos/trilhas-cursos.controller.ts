import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrilhasCursosService } from './trilhas-cursos.service';
import { CreateTrilhaCursoDto } from './dto/create-trilha-curso.dto';
import { UpdateTrilhaCursoDto } from './dto/update-trilha-curso.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfis } from '../auth/perfis.decorator';
import { Perfil } from '../generated/prisma/enums';

@ApiTags('trilhas-cursos')
@ApiBearerAuth('token')
@Controller('trilhas-cursos')
export class TrilhasCursosController {
  constructor(private readonly trilhasCursosService: TrilhasCursosService) {}

  @Perfis(Perfil.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Adicionar um curso a uma trilha' })
  @ApiResponse({ status: 201, description: 'Curso adicionado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createTrilhaCursoDto: CreateTrilhaCursoDto) {
    return this.trilhasCursosService.create(createTrilhaCursoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos das trilhas' })
  findAll() {
    return this.trilhasCursosService.findAll();
  }

  // A chave primária é composta, então a rota recebe os dois ids.
  @Get(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Buscar um curso dentro de uma trilha' })
  findOne(
    @Param('idTrilha') idTrilha: string,
    @Param('idCurso') idCurso: string,
  ) {
    return this.trilhasCursosService.findOne(+idTrilha, +idCurso);
  }

  @Perfis(Perfil.ADMIN)
  @Patch(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Atualizar a ordem de um curso na trilha' })
  update(
    @Param('idTrilha') idTrilha: string,
    @Param('idCurso') idCurso: string,
    @Body() updateTrilhaCursoDto: UpdateTrilhaCursoDto,
  ) {
    return this.trilhasCursosService.update(
      +idTrilha,
      +idCurso,
      updateTrilhaCursoDto,
    );
  }

  @Perfis(Perfil.ADMIN)
  @Delete(':idTrilha/:idCurso')
  @ApiOperation({ summary: 'Remover um curso de uma trilha' })
  remove(
    @Param('idTrilha') idTrilha: string,
    @Param('idCurso') idCurso: string,
  ) {
    return this.trilhasCursosService.remove(+idTrilha, +idCurso);
  }
}
