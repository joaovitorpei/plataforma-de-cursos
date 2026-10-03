import { Injectable, NotFoundException } from '@nestjs/common';

import { exigirDono, filtroDoDono } from '../auth/propriedade';
import type { UsuarioLogado } from '../auth/usuario-logado';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';

@Injectable()
export class AssinaturasService {
  constructor(private prisma: PrismaService) {}

  create(createAssinaturaDto: CreateAssinaturaDto, logado: UsuarioLogado) {
    // O aluno assina para si; o administrador pode assinar por alguém.
    exigirDono(createAssinaturaDto.idUsuario, logado);

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

  findAll(logado: UsuarioLogado) {
    return this.prisma.assinatura.findMany({ where: filtroDoDono(logado) });
  }

  async findOne(id: number, logado: UsuarioLogado) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { idAssinatura: id },
    });
    if (!assinatura) throw new NotFoundException('Registro não encontrado');

    exigirDono(assinatura.idUsuario, logado);
    return assinatura;
  }

  async update(
    id: number,
    updateAssinaturaDto: UpdateAssinaturaDto,
    logado: UsuarioLogado,
  ) {
    await this.findOne(id, logado);

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

  async remove(id: number, logado: UsuarioLogado) {
    await this.findOne(id, logado);
    return this.prisma.assinatura.delete({ where: { idAssinatura: id } });
  }

  /** De quem é esta assinatura — usado pelos pagamentos. */
  async donoDaAssinatura(idAssinatura: number): Promise<number> {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { idAssinatura },
      select: { idUsuario: true },
    });
    if (!assinatura)
      throw new NotFoundException('A assinatura informada não existe');
    return assinatura.idUsuario;
  }
}
