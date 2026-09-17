import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModulosService } from './modulos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('modulos')
@Controller('modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo módulo' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.modulosService.create(createModuloDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os módulos' })
  findAll() {
    return this.modulosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um módulo pelo ID' })
  findOne(@Param('id') id: string) {
    return this.modulosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.modulosService.update(+id, updateModuloDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um módulo' })
  remove(@Param('id') id: string) {
    return this.modulosService.remove(+id);
  }
}
