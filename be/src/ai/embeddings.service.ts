import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import { AiService } from './ai.service';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly embeddingModel = 'text-embedding-3-small';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AiService,
  ) {}

  async syncProductEmbedding(productId: string): Promise<void> {
    const { data: product, error } = await this.supabaseService.client
      .from('products')
      .select(`
        id,
        name,
        short_description,
        description,
        categories:category_id (name),
        brands:brand_id (name)
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !product) {
      this.logger.warn(`Product not found or inactive: ${productId}`);
      return;
    }

    const category = Array.isArray(product.categories)
      ? product.categories[0]
      : product.categories;
    const brand = Array.isArray(product.brands)
      ? product.brands[0]
      : product.brands;

    const text = [
      `Name: ${product.name}`,
      product.short_description ? `Short Description: ${product.short_description}` : '',
      product.description ? `Description: ${product.description}` : '',
      category?.name ? `Category: ${category.name}` : '',
      brand?.name ? `Brand: ${brand.name}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const embedding = await this.aiService.generateEmbedding(text);

    const { error: upsertError } = await this.supabaseService.client
      .from('product_embeddings')
      .upsert(
        {
          product_id: productId,
          embedding: `[${embedding.join(',')}]`,
          text,
          model: this.embeddingModel,
        },
        { onConflict: 'product_id, model' },
      );

    if (upsertError) {
      throw upsertError;
    }

    this.logger.log(`Synced embedding for product: ${product.name} (${productId})`);
  }

  async syncAllProducts(): Promise<{ synced: number; failed: number }> {
    const { data: products, error } = await this.supabaseService.client
      .from('products')
      .select('id')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    let synced = 0;
    let failed = 0;

    for (const product of products ?? []) {
      try {
        await this.syncProductEmbedding(product.id);
        synced++;
      } catch (err) {
        this.logger.error(`Failed to sync product ${product.id}: ${err}`);
        failed++;
      }
    }

    return { synced, failed };
  }

  async searchSimilarProducts(
    query: string,
    limit = 12,
  ): Promise<Array<{ productId: string; productName: string; score: number }>> {
    const queryEmbedding = await this.aiService.generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await this.supabaseService.client.rpc(
      'search_product_embeddings',
      {
        query_embedding: embeddingStr,
        match_threshold: 0.5,
        match_count: limit,
      },
    );

    if (error) {
      this.logger.error(`Vector search error: ${error.message}`);

      return [];
    }

    return ((data ?? []) as Array<{
      product_id: string;
      product_name: string;
      similarity: number;
    }>).map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      score: row.similarity,
    }));
  }
}
