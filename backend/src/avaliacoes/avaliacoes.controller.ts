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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('avaliacoes')
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Avaliar um curso' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(createAvaliacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  findAll() {
    return this.avaliacoesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma avaliação pelo ID' })
  findOne(@Param('id') id: string) {
    return this.avaliacoesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma avaliação' })
  update(
    @Param('id') id: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
  ) {
    return this.avaliacoesService.update(+id, updateAvaliacaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma avaliação' })
  remove(@Param('id') id: string) {
    return this.avaliacoesService.remove(+id);
  }
}
