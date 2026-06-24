import { Injectable } from '@nestjs/common';

@Injectable()
export class VectorService {
  health(): string {
    return 'not-configured';
  }

  searchRelevant(_question: string, _topK = 5): unknown[] {
    return [];
  }
}
