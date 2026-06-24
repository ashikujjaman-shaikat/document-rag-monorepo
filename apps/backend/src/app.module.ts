import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';

import { validateEnv } from './config/env.validation';
import { DocumentModule } from './modules/document/document.module';
import { GroqModule } from './modules/groq/groq.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { QueueModule } from './modules/queue/queue.module';
import { VectorModule } from './modules/vector/vector.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    QueueModule,
    VectorModule,
    GroqModule,
    DocumentModule,
    HealthModule,
  ],
})
export class AppModule {}
