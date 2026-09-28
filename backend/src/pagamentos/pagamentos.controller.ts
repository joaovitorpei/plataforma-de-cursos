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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('pagamentos')
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
  create(@Body() createPagamentoDto: CreatePagamentoDto) {
    return this.pagamentosService.create(createPagamentoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  findAll() {
    return this.pagamentosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID' })
  findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um pagamento' })
  update(
    @Param('id') id: string,
    @Body() updatePagamentoDto: UpdatePagamentoDto,
  ) {
    return this.pagamentosService.update(+id, updatePagamentoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pagamento' })
  remove(@Param('id') id: string) {
    return this.pagamentosService.remove(+id);
  }
}
