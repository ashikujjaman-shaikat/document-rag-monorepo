import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
  enqueueDocument(_documentId: string): void {
    // Intentionally left blank for scaffold-only backend.
  }

  ping(): string {
    return 'not-configured';
  }
}
