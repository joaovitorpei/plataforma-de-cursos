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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfis } from '../auth/perfis.decorator';
import { Perfil } from '../generated/prisma/enums';

@ApiTags('trilhas')
@ApiBearerAuth('token')
@Controller('trilhas')
export class TrilhasController {
  constructor(private readonly trilhasService: TrilhasService) {}

  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
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

  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma trilha' })
  update(@Param('id') id: string, @Body() updateTrilhaDto: UpdateTrilhaDto) {
    return this.trilhasService.update(+id, updateTrilhaDto);
  }

  @Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma trilha' })
  remove(@Param('id') id: string) {
    return this.trilhasService.remove(+id);
  }
}
