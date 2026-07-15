import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AiService } from './ai.service';
import { EmbeddingsService } from './embeddings.service';
import type {
  AiChatRequest,
  AiChatResponse,
  AiEmbeddingResponse,
  AiSearchResponse,
} from './ai.types';

@ApiTags('AI')
@Controller('ai')
@UseGuards(SupabaseAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  @Post('chat')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async chat(@Body() request: AiChatRequest): Promise<AiChatResponse> {
    const reply = await this.aiService.chat(request.messages);
    return { reply };
  }

  @Post('embeddings/sync/:productId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async syncEmbedding(
    @Param('productId') productId: string,
  ): Promise<AiEmbeddingResponse> {
    await this.embeddingsService.syncProductEmbedding(productId);
    return { success: true, productId };
  }

  @Post('embeddings/sync-all')
  @UseGuards(RolesGuard)
  @Roles('admin')
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
