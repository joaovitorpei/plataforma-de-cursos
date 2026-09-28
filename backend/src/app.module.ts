import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CursosModule } from './cursos/cursos.module';
import { ModulosModule } from './modulos/modulos.module';
import { AulasModule } from './aulas/aulas.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { ProgressoAulasModule } from './progresso-aulas/progresso-aulas.module';
import { TrilhasModule } from './trilhas/trilhas.module';
import { TrilhasCursosModule } from './trilhas-cursos/trilhas-cursos.module';
import { CertificadosModule } from './certificados/certificados.module';
import { PlanosModule } from './planos/planos.module';
import { AssinaturasModule } from './assinaturas/assinaturas.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    CategoriasModule,
    CursosModule,
    ModulosModule,
    AulasModule,
    MatriculasModule,
    AvaliacoesModule,
    ProgressoAulasModule,
    TrilhasModule,
    TrilhasCursosModule,
    CertificadosModule,
    PlanosModule,
    AssinaturasModule,
    PagamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
