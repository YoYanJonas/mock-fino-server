import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({ origin: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finora Mock API')
    .setDescription(
      'Deterministic mock API for Finora business-account onboarding. Use header X-Mock-Scenario with values: normal, slow, server-error, validation-error, conflict.',
    )
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Mock-Scenario',
        in: 'header',
        description: 'Mock scenario trigger',
      },
      'mock-scenario',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.port);
  logger.log(`Finora mock API listening on http://localhost:${env.port}`);
  logger.log(`Swagger UI: http://localhost:${env.port}/api/docs`);
}

void bootstrap();
