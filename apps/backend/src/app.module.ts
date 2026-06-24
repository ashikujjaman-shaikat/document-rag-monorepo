import { Module } from '@nestjs/common';

import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { VectorModule } from './vector/vector.module';

@Module({
  imports: [PrismaModule, QueueModule, VectorModule, HealthModule, ChatModule],
})
export class AppModule {}
