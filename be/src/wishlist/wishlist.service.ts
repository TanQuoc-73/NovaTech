import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type { CatalogProductDto } from '../catalog/catalog.types';
import { mapProducts, type ProductRow } from '../shared/utils/product-mapper.util';
import type { AddToWishlistPayload } from './wishlist.types';

type WishlistRow = {
  id: string;
  created_at: string;
  product: ProductRow | ProductRow[] | null;
};

@Injectable()
export class WishlistService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getWishlist(userId: string): Promise<CatalogProductDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('wishlists')
      .select(`
        id,
        created_at,
        product:product_id (
          id,
          name,
          thumbnail_url,
          is_featured,
          categories:category_id (slug, name),
          brands:brand_id (name),
          product_variants (
            id,
            sku,
            name,
            color,
            storage,
            ram,
            price,
            compare_at_price,
            stock_quantity,
            product_variant_images (
              id,
              image_url,
              alt_text,
              sort_order
            )
          ),
          reviews (
            id,
            rating,
            title,
            content,
            is_approved,
            created_at,
            profiles:user_id (
              full_name,
              email
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as unknown as WishlistRow[];
    const products: ProductRow[] = [];

    for (const row of rows) {
      const p = Array.isArray(row.product) ? row.product[0] : row.product;
      if (p) {
        products.push(p);
      }
    }

    return mapProducts(products);
  }

  async addToWishlist(userId: string, payload: AddToWishlistPayload): Promise<void> {
    const productId = this.readProductId(payload.productId);

    // Validate that the product exists and is active
    const { data: product, error: productError } = await this.supabaseService.client
      .from('products')
      .select('id, is_active')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    if (!product || !product.is_active) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc đã bị ẩn.');
    }

    const { error } = await this.supabaseService.client
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
      });

    if (error) {
      // Check for unique key violation
      if (error.code === '23505') {
        return; // Already added
      }
      throw error;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    if (!productId) {
      throw new BadRequestException('Mã sản phẩm không hợp lệ.');
    }

    const { error } = await this.supabaseService.client
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }
  }

  private readProductId(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('Mã sản phẩm (productId) bắt buộc.');
    }
    return value.trim();
  }
}
