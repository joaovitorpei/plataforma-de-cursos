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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('certificados')
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post()
  @ApiOperation({ summary: 'Emitir um novo certificado' })
  @ApiResponse({ status: 201, description: 'Certificado emitido com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createCertificadoDto: CreateCertificadoDto) {
    return this.certificadosService.create(createCertificadoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os certificados' })
  findAll() {
    return this.certificadosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um certificado pelo ID' })
  findOne(@Param('id') id: string) {
    return this.certificadosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um certificado' })
  update(
    @Param('id') id: string,
    @Body() updateCertificadoDto: UpdateCertificadoDto,
  ) {
    return this.certificadosService.update(+id, updateCertificadoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um certificado' })
  remove(@Param('id') id: string) {
    return this.certificadosService.remove(+id);
  }
}
