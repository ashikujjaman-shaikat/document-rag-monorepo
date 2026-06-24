import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, normalize, relative, resolve } from 'node:path';

import type { LoadedDocument } from '@rag/shared' with { 'resolution-mode': 'import' };

@Injectable()
export class DocumentService {
  private readonly documentsRoot = this.resolveDocumentsRoot();

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

  private resolveDocumentsRoot(): string {
    const candidates = [
      resolve(process.cwd(), 'documents'),
      resolve(process.cwd(), '..', 'documents'),
      resolve(process.cwd(), '..', '..', 'documents'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return candidates[0];
  }
}
