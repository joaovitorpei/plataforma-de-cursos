import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL não definida');
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    super({
      adapter,
      // A senha (hash) nunca sai do banco por engano: fica escondida em TODA
      // consulta a Usuario. Quem realmente precisa dela — o login — pede de
      // volta explicitamente com `omit: { senha: false }`.
      omit: { usuario: { senha: true } },
    });
  }
}
