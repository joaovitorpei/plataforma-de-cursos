import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
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
