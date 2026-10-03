import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Logado } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';

@ApiTags('avaliacoes')
@ApiBearerAuth('token')
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Avaliar um curso' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(
    @Body() createAvaliacaoDto: CreateAvaliacaoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.avaliacoesService.create(createAvaliacaoDto, logado);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  findAll(@Logado() logado: UsuarioLogado) {
    return this.avaliacoesService.findAll(logado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma avaliação pelo ID' })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.avaliacoesService.findOne(+id, logado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma avaliação' })
  update(
    @Param('id') id: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.avaliacoesService.update(+id, updateAvaliacaoDto, logado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma avaliação' })
  remove(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.avaliacoesService.remove(+id, logado);
  }
}
