import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { EmbeddingsService } from './embeddings.service';
import type {
  AiChatRequest,
  AiChatResponse,
  AiEmbeddingResponse,
  AiSearchResponse,
} from './ai.types';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  @Post('chat')
  async chat(@Body() request: AiChatRequest): Promise<AiChatResponse> {
    const reply = await this.aiService.chat(request.messages);
    return { reply };
  }

  @Post('embeddings/sync/:productId')
  async syncEmbedding(
    @Param('productId') productId: string,
  ): Promise<AiEmbeddingResponse> {
    await this.embeddingsService.syncProductEmbedding(productId);
    return { success: true, productId };
  }

  @Post('embeddings/sync-all')
  async syncAllEmbeddings(): Promise<{ synced: number; failed: number }> {
    return this.embeddingsService.syncAllProducts();
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<AiSearchResponse> {
    const results = await this.embeddingsService.searchSimilarProducts(
      query,
      limit ? Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50) : 12,
    );
    return { results };
  }
}
