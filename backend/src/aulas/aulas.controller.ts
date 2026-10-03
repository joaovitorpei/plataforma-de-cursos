import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AulasService } from './aulas.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
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

@ApiTags('aulas')
@ApiBearerAuth('token')
@Controller('aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Perfis(Perfil.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Cadastrar uma nova aula' })
  @ApiResponse({ status: 201, description: 'Aula criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulasService.create(createAulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as aulas' })
  findAll(@Logado() logado: UsuarioLogado) {
    return this.aulasService.findAll(logado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma aula pelo ID' })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.aulasService.findOne(+id, logado);
  }

  @Perfis(Perfil.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma aula' })
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    return this.aulasService.update(+id, updateAulaDto);
  }

  @Perfis(Perfil.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma aula' })
  remove(@Param('id') id: string) {
    return this.aulasService.remove(+id);
  }
}
