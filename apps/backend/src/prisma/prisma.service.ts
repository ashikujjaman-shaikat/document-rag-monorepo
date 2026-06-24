import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  getStatus(): string {
    return 'not-configured';
  }
}
