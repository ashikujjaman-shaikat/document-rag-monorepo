import { Module } from '@nestjs/common';

import { DocumentModule } from '../document/document.module';
import { EmbeddingService } from './embedding.service';
import { VectorService } from './vector.service';

@Module({
  imports: [DocumentModule],
  providers: [EmbeddingService, VectorService],
  exports: [EmbeddingService, VectorService],
})
export class VectorModule {}
