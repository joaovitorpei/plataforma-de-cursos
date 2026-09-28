import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  create(createPagamentoDto: CreatePagamentoDto) {
    // a dataPagamento é preenchida pelo banco com a data de hoje
    return this.prisma.pagamento.create({ data: createPagamentoDto });
  }

  findAll() {
    return this.prisma.pagamento.findMany();
  }

  findOne(id: number) {
    return this.prisma.pagamento.findUnique({ where: { idPagamento: id } });
  }

  update(id: number, updatePagamentoDto: UpdatePagamentoDto) {
    return this.prisma.pagamento.update({
      where: { idPagamento: id },
      data: updatePagamentoDto,
    });
  }

  remove(id: number) {
    return this.prisma.pagamento.delete({ where: { idPagamento: id } });
  }
}
