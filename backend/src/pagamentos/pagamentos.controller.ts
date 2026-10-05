import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
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

@ApiTags('pagamentos')
@ApiBearerAuth('token')
@Perfis(Perfil.USER, Perfil.ADMIN)
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar um novo pagamento' })
  @ApiResponse({
    status: 201,
    description: 'Pagamento registrado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(
    @Body() createPagamentoDto: CreatePagamentoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.pagamentosService.create(createPagamentoDto, logado);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  findAll(@Logado() logado: UsuarioLogado) {
    return this.pagamentosService.findAll(logado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID' })
  findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.pagamentosService.findOne(+id, logado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um pagamento' })
  update(
    @Param('id') id: string,
    @Body() updatePagamentoDto: UpdatePagamentoDto,
    @Logado() logado: UsuarioLogado,
  ) {
    return this.pagamentosService.update(+id, updatePagamentoDto, logado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pagamento' })
  remove(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
    return this.pagamentosService.remove(+id, logado);
  }
}
