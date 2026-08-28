import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // expor o PrismaService para outros modulos utilizarem
})
export class PrismaModule {}
