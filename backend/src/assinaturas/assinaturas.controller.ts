import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssinaturasService } from './assinaturas.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Perfis } from '../auth/perfis.decorator';
import { Perfil } from '../generated/prisma/enums';
import { Logado } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';

@ApiTags('assinaturas')
@ApiBearerAuth('token')
@Perfis(Perfil.USER, Perfil.ADMIN)
@Controller('assinaturas')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova assinatura' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(
    @Body() createAssinaturaDto: CreateAssinaturaDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.assinaturasService.create(createAssinaturaDto, logado);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as assinaturas' })
  findAll(@Logado() logado: UsuarioLogado) {
    return this.assinaturasService.findAll(logado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma assinatura pelo ID' })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.assinaturasService.findOne(+id, logado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma assinatura' })
  update(
    @Param('id') id: string,
    @Body() updateAssinaturaDto: UpdateAssinaturaDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.assinaturasService.update(+id, updateAssinaturaDto, logado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma assinatura' })
  remove(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.assinaturasService.remove(+id, logado);
  }
}
