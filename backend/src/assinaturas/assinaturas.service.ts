import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';

@Injectable()
export class AssinaturasService {
  constructor(private prisma: PrismaService) {}

  create(createAssinaturaDto: CreateAssinaturaDto) {
    const { dataInicio, dataFim, ...dados } = createAssinaturaDto;
    return this.prisma.assinatura.create({
      data: {
        ...dados,
        // o JSON traz as datas como texto ("2026-09-28"); o Prisma espera Date
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      },
    });
  }

  findAll() {
    return this.prisma.assinatura.findMany();
  }

  findOne(id: number) {
    return this.prisma.assinatura.findUnique({ where: { idAssinatura: id } });
  }

  update(id: number, updateAssinaturaDto: UpdateAssinaturaDto) {
    const { dataInicio, dataFim, ...dados } = updateAssinaturaDto;
    return this.prisma.assinatura.update({
      where: { idAssinatura: id },
      data: {
        ...dados,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.assinatura.delete({ where: { idAssinatura: id } });
  }
}
