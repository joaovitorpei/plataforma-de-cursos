import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PerfisGuard } from './auth/perfis.guard';

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
  providers: [
    AppService,
    // Guards globais, nesta ordem: primeiro "quem é você?", depois "você
    // pode?". Com isso TODA rota exige login — menos as marcadas @Publico()
    // — e as marcadas @Perfis(ADMIN) exigem também ser administrador.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PerfisGuard },
  ],
})
export class AppModule {}
