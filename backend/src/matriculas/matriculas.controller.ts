import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('matriculas')
@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  @ApiOperation({ summary: 'Matricular um usuário em um curso' })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createMatriculaDto: CreateMatriculaDto) {
    return this.matriculasService.create(createMatriculaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as matrículas' })
  findAll() {
    return this.matriculasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID' })
  findOne(@Param('id') id: string) {
    return this.matriculasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma matrícula' })
  update(
    @Param('id') id: string,
    @Body() updateMatriculaDto: UpdateMatriculaDto,
  ) {
    return this.matriculasService.update(+id, updateMatriculaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma matrícula' })
  remove(@Param('id') id: string) {
    return this.matriculasService.remove(+id);
  }
}
