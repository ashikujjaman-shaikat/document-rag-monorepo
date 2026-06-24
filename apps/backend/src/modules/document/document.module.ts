import { Module } from '@nestjs/common';

import { ChunkingService } from './chunking.service';
import { DocumentLoaderService } from './document-loader.service';
import { DocumentService } from './document.service';

@Module({
  providers: [DocumentService, DocumentLoaderService, ChunkingService],
  exports: [DocumentService, DocumentLoaderService, ChunkingService],
})
export class DocumentModule {}
