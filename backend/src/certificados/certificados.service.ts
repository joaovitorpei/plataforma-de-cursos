import { Injectable, NotFoundException } from '@nestjs/common';

import { exigirDono, filtroDoDono } from '../auth/propriedade';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

@Injectable()
export class CertificadosService {
  constructor(private prisma: PrismaService) {}

  create(createCertificadoDto: CreateCertificadoDto) {
    return this.prisma.certificado.create({ data: createCertificadoDto });
  }

  /** Emitir é coisa da instituição, mas cada aluno vê só os seus. */
  findAll(logado: UsuarioLogado) {
    return this.prisma.certificado.findMany({ where: filtroDoDono(logado) });
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const certificado = await this.prisma.certificado.findUnique({
      where: { idCertificado: id },
    });
    if (!certificado) throw new NotFoundException('Registro não encontrado');

    exigirDono(certificado.idUsuario, logado);
    return certificado;
  }

  update(id: number, updateCertificadoDto: UpdateCertificadoDto) {
    return this.prisma.certificado.update({
      where: { idCertificado: id },
      data: updateCertificadoDto,
    });
  }

  remove(id: number) {
    return this.prisma.certificado.delete({ where: { idCertificado: id } });
  }
}
