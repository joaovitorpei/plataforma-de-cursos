import { Injectable, NotFoundException } from '@nestjs/common';

import { exigirDono } from '../auth/propriedade';
import { ehAdmin } from '../auth/usuario-logado';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  async create(createPagamentoDto: CreatePagamentoDto, logado: UsuarioLogado) {
    // O pagamento não guarda o id do usuário: quem diz de quem ele é
    // é a assinatura. Por isso o dono é buscado lá.
    const dono = await this.donoDaAssinatura(createPagamentoDto.idAssinatura);
    exigirDono(dono, logado);

    // a dataPagamento é preenchida pelo banco com a data de hoje
    return this.prisma.pagamento.create({ data: createPagamentoDto });
  }

  findAll(logado: UsuarioLogado) {
    // Aluno vê só os pagamentos das assinaturas dele. O filtro atravessa o
    // relacionamento: Pagamento -> Assinatura -> ID_Usuario.
    return this.prisma.pagamento.findMany({
      where: ehAdmin(logado)
        ? undefined
        : { assinatura: { idUsuario: logado.idUsuario } },
    });
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const pagamento = await this.prisma.pagamento.findUnique({
      where: { idPagamento: id },
    });
    if (!pagamento) throw new NotFoundException('Registro não encontrado');

    const dono = await this.donoDaAssinatura(pagamento.idAssinatura);
    exigirDono(dono, logado);
    return pagamento;
  }

  async update(
    id: number,
    updatePagamentoDto: UpdatePagamentoDto,
    logado: UsuarioLogado,
  ) {
    await this.findOne(id, logado);

    // Trocar a assinatura do pagamento exige ser dono da nova também.
    if (updatePagamentoDto.idAssinatura !== undefined) {
      const novoDono = await this.donoDaAssinatura(
        updatePagamentoDto.idAssinatura,
      );
      exigirDono(novoDono, logado);
    }

    return this.prisma.pagamento.update({
      where: { idPagamento: id },
      data: updatePagamentoDto,
    });
  }

  async remove(id: number, logado: UsuarioLogado) {
    await this.findOne(id, logado);
    return this.prisma.pagamento.delete({ where: { idPagamento: id } });
  }

  private async donoDaAssinatura(idAssinatura: number): Promise<number> {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { idAssinatura },
      select: { idUsuario: true },
    });
    if (!assinatura) {
      throw new NotFoundException('A assinatura informada não existe');
    }
    return assinatura.idUsuario;
  }
}
