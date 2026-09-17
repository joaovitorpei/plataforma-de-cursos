import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

@Injectable()
export class CertificadosService {
  constructor(private prisma: PrismaService) {}

  create(createCertificadoDto: CreateCertificadoDto) {
    return this.prisma.certificado.create({ data: createCertificadoDto });
  }

  findAll() {
    return this.prisma.certificado.findMany();
  }

  findOne(id: number) {
    return this.prisma.certificado.findUnique({ where: { idCertificado: id } });
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
