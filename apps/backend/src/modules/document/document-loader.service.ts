import { Injectable } from '@nestjs/common';
import { readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

import type { LoadedDocument } from '@rag/shared' with { 'resolution-mode': 'import' };

import { DocumentService } from './document.service';

@Injectable()
export class DocumentLoaderService {
  private readonly documentsRoot = resolve(process.cwd(), 'documents');
  private readonly supportedExtensions = new Set(['.txt', '.md']);

  constructor(private readonly documentService: DocumentService) {}

  async loadAllDocuments(): Promise<LoadedDocument[]> {
    const files = await this.scanDocuments(this.documentsRoot);
    const documents = await Promise.all(
      files.map((file) => this.documentService.readDocument(file)),
    );

    return documents;
  }

  private async scanDocuments(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const filePaths: string[] = [];

    for (const entry of entries) {
      const absolutePath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const nestedFiles = await this.scanDocuments(absolutePath);
        filePaths.push(...nestedFiles);
        continue;
      }

      const extension = extname(entry.name).toLowerCase();
      if (!this.supportedExtensions.has(extension)) {
        continue;
      }

      filePaths.push(relative(this.documentsRoot, absolutePath));
    }

    return filePaths;
  }
}
