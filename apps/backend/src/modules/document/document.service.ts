import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join, normalize, relative, resolve } from 'node:path';

import type { LoadedDocument } from '@rag/shared' with { 'resolution-mode': 'import' };

@Injectable()
export class DocumentService {
  private readonly documentsRoot = resolve(process.cwd(), 'documents');

  async readDocument(filename: string): Promise<LoadedDocument> {
    const safeFilename = normalize(filename).replace(/^([/\\])+/, '');
    const absolutePath = resolve(this.documentsRoot, safeFilename);
    const relativePath = relative(this.documentsRoot, absolutePath);

    if (relativePath.startsWith('..')) {
      throw new NotFoundException('Document not found');
    }

    const content = await readFile(absolutePath, 'utf8');

    return {
      filename: safeFilename,
      content,
    };
  }

  getDocumentPath(filename: string): string {
    return join(this.documentsRoot, filename);
  }
}
