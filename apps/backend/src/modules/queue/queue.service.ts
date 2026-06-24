import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
  enqueueDocument(_documentId: string): void {
    // Queue integration will be added in next phase.
  }

  ping(): string {
    return 'not-configured';
  }
}
