import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProgressoAulasService } from './progresso-aulas.service';
import { CreateProgressoAulaDto } from './dto/create-progresso-aula.dto';
import { UpdateProgressoAulaDto } from './dto/update-progresso-aula.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('progresso-aulas')
@Controller('progresso-aulas')
export class ProgressoAulasController {
  constructor(private readonly progressoAulasService: ProgressoAulasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar o progresso de um usuário em uma aula' })
  @ApiResponse({
    status: 201,
    description: 'Progresso registrado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createProgressoAulaDto: CreateProgressoAulaDto) {
    return this.progressoAulasService.create(createProgressoAulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros de progresso' })
  findAll() {
    return this.progressoAulasService.findAll();
  }

  // A chave primária é composta, então a rota recebe os dois ids.
  @Get(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Buscar o progresso de um usuário em uma aula' })
  findOne(
    @Param('idUsuario') idUsuario: string,
    @Param('idAula') idAula: string,
  ) {
    return this.progressoAulasService.findOne(+idUsuario, +idAula);
  }

  @Patch(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Atualizar o progresso de um usuário em uma aula' })
  update(
    @Param('idUsuario') idUsuario: string,
    @Param('idAula') idAula: string,
    @Body() updateProgressoAulaDto: UpdateProgressoAulaDto,
  ) {
    return this.progressoAulasService.update(
      +idUsuario,
      +idAula,
      updateProgressoAulaDto,
    );
  }

  @Delete(':idUsuario/:idAula')
  @ApiOperation({ summary: 'Remover o progresso de um usuário em uma aula' })
  remove(
    @Param('idUsuario') idUsuario: string,
    @Param('idAula') idAula: string,
  ) {
    return this.progressoAulasService.remove(+idUsuario, +idAula);
  }
}
