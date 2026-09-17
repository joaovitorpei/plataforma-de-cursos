import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrilhasService } from './trilhas.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('trilhas')
@Controller('trilhas')
export class TrilhasController {
  constructor(private readonly trilhasService: TrilhasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar uma nova trilha' })
  @ApiResponse({ status: 201, description: 'Trilha criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createTrilhaDto: CreateTrilhaDto) {
    return this.trilhasService.create(createTrilhaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as trilhas' })
  findAll() {
    return this.trilhasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma trilha pelo ID' })
  findOne(@Param('id') id: string) {
    return this.trilhasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma trilha' })
  update(@Param('id') id: string, @Body() updateTrilhaDto: UpdateTrilhaDto) {
    return this.trilhasService.update(+id, updateTrilhaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma trilha' })
  remove(@Param('id') id: string) {
    return this.trilhasService.remove(+id);
  }
}
