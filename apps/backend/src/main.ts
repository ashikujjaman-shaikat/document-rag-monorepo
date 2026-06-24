import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const port = Number(process.env.BACKEND_PORT ?? 4001);
  await app.listen(port);
}

bootstrap();
