import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GroqChoice {
  message?: {
    content?: string | null;
  };
}

interface GroqChatResponse {
  choices?: GroqChoice[];
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly apiKey: string | null;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') ?? null;
  }

  async ask(prompt: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new InternalServerErrorException('GROQ_API_KEY is not configured');
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Groq API request failed: ${response.status} ${errorBody}`);
        throw new InternalServerErrorException('Groq API request failed');
      }

      const data = (await response.json()) as GroqChatResponse;
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new InternalServerErrorException('Groq API returned an empty response');
      }

      return content;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error('Failed to call Groq API', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to call Groq API');
    }
  }
}
