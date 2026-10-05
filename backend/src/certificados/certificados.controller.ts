import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
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

@ApiTags('certificados')
@ApiBearerAuth('token')
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post()
  @ApiOperation({ summary: 'Emitir um novo certificado' })
  @ApiResponse({ status: 201, description: 'Certificado emitido com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(
    @Body() createCertificadoDto: CreateCertificadoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.certificadosService.create(createCertificadoDto, logado);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os certificados' })
  findAll(@Logado() logado: UsuarioLogado) {
    return this.certificadosService.findAll(logado);
  }

  /** Quanto falta para o aluno poder emitir o certificado deste curso. */
  @Get('elegibilidade/:idCurso')
  @ApiOperation({ summary: 'Conferir se já dá para emitir o certificado' })
  elegibilidade(
    @Param('idCurso') idCurso: string,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.certificadosService.elegibilidade(logado.idUsuario, +idCurso);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um certificado pelo ID' })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.certificadosService.findOne(+id, logado);
  }

  @Perfis(Perfil.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um certificado' })
  update(
    @Param('id') id: string,
    @Body() updateCertificadoDto: UpdateCertificadoDto,
  ) {
    return this.certificadosService.update(+id, updateCertificadoDto);
  }

  @Perfis(Perfil.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um certificado' })
  remove(@Param('id') id: string) {
    return this.certificadosService.remove(+id);
  }
}
