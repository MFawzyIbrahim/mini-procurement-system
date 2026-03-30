import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'https://YOUR_GITHUB_USERNAME.github.io',
      'https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME',
      'https://YOUR_RENDER_BACKEND_DOMAIN.onrender.com',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const publicApiUrl = process.env.PUBLIC_API_URL;

  const swaggerBuilder = new DocumentBuilder()
    .setTitle('Mini Procurement API')
    .setDescription('API documentation for Mini Procurement System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste Supabase access token here',
      },
      'bearer',
    )
    .addServer('http://localhost:3000', 'Local');

  if (publicApiUrl) {
    swaggerBuilder.addServer(publicApiUrl, 'Public');
  }

  const swaggerConfig = swaggerBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);

  console.log(`Backend running on: http://localhost:${port}/api`);
  console.log(`Swagger running on: http://localhost:${port}/api/docs`);
}

bootstrap();