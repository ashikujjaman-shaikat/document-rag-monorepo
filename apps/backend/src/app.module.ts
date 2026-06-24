import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { VectorModule } from './vector/vector.module';

@Module({
  imports: [PrismaModule, QueueModule, VectorModule, HealthModule],
})
export class AppModule {}
