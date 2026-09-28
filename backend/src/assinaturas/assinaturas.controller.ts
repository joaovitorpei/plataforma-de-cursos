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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('assinaturas')
@Controller('assinaturas')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova assinatura' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createAssinaturaDto: CreateAssinaturaDto) {
    return this.assinaturasService.create(createAssinaturaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as assinaturas' })
  findAll() {
    return this.assinaturasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma assinatura pelo ID' })
  findOne(@Param('id') id: string) {
    return this.assinaturasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma assinatura' })
  update(
    @Param('id') id: string,
    @Body() updateAssinaturaDto: UpdateAssinaturaDto,
  ) {
    return this.assinaturasService.update(+id, updateAssinaturaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma assinatura' })
  remove(@Param('id') id: string) {
    return this.assinaturasService.remove(+id);
  }
}
