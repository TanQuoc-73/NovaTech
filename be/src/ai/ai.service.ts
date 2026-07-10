import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { AiChatMessage } from './ai.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set. AI features will fail.');
    }

    this.openai = new OpenAI({ apiKey: apiKey ?? '' });
    this.model = this.configService.get<string>('OPENAI_CHAT_MODEL') ?? 'gpt-4o-mini';
  }

  async chat(messages: AiChatMessage[]): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 1024,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = 'text-embedding-3-small';

    const response = await this.openai.embeddings.create({
      model,
      input: text,
    });

    return response.data[0].embedding;
  }
}
