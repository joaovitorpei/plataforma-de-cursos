import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { erroDeValidacaoEmPortugues } from './comum/validacao-em-portugues';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // O frontend roda em outra porta (Vite: 5173). Sem isto o navegador bloqueia
  // as chamadas por CORS — o curl e o Swagger funcionam, a tela não.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // Traduz as mensagens do class-validator, que são em inglês por padrão.
      exceptionFactory: erroDeValidacaoEmPortugues,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Plataforma de Cursos Online')
    .setDescription('API da plataforma de cursos com NestJS e Prisma')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth(
      // Faz aparecer o botão "Authorize" no topo da página do Swagger.
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'token', // precisa bater com o nome usado em @ApiBearerAuth('token')
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api`);
}
bootstrap();
