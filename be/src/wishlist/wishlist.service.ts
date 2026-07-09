import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type { CatalogProductDto } from '../catalog/catalog.types';
import type { AddToWishlistPayload } from './wishlist.types';

type ProductRow = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  categories:
    | { slug: string; name: string }
    | Array<{ slug: string; name: string }>
    | null;
  brands: { name: string } | Array<{ name: string }> | null;
  product_variants: Array<{
    id: string;
    sku: string;
    name: string;
    color: string | null;
    storage: string | null;
    ram: string | null;
    price: string | number;
    compare_at_price: string | number | null;
    stock_quantity: number;
    product_variant_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      sort_order: number;
    }>;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    is_approved: boolean;
    created_at: string;
    profiles:
      | { full_name: string | null; email: string | null }
      | Array<{ full_name: string | null; email: string | null }>
      | null;
  }>;
};

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

    return this.mapProducts(products);
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

  // Reuse logic from CatalogService mapping
  private mapProducts(products: ProductRow[]): CatalogProductDto[] {
    return products.flatMap((product) => {
      if (!product.product_variants || !product.product_variants.length) {
        return [];
      }

      const variants = product.product_variants
        .map((item) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          color: item.color,
          storage: item.storage,
          ram: item.ram,
          price: Number(item.price),
          compareAtPrice: item.compare_at_price
            ? Number(item.compare_at_price)
            : undefined,
          stock: item.stock_quantity,
          images: (item.product_variant_images ?? [])
            .map((image) => ({
              id: image.id,
              imageUrl: image.image_url,
              altText: image.alt_text,
              sortOrder: image.sort_order,
            }))
            .sort((left, right) => left.sortOrder - right.sortOrder),
        }))
        .filter((item) => Number.isFinite(item.price))
        .sort((left, right) => left.price - right.price);

      const variant = variants[0];
      if (!variant) {
        return [];
      }

      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;
      const brand = Array.isArray(product.brands)
        ? product.brands[0]
        : product.brands;
      const primaryVariantImage = variants[0]?.images[0]?.imageUrl;

      return {
        id: product.id,
        name: product.name,
        brand: brand?.name ?? 'NovaTech',
        category: category?.slug ?? 'accessory',
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        rating: this.calculateRating(product.reviews),
        stock: variant.stock,
        imageUrl: primaryVariantImage ?? product.thumbnail_url ?? '',
        badges: product.is_featured ? ['bestseller'] : ['new'],
        variants,
        reviews: this.mapReviews(product.reviews),
      };
    });
  }

  private mapReviews(reviews: ProductRow['reviews']) {
    return (reviews ?? [])
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime(),
      )
      .map((review) => {
        const profile = Array.isArray(review.profiles)
          ? review.profiles[0]
          : review.profiles;

        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          authorName:
            profile?.full_name?.trim() ||
            profile?.email?.split('@')[0] ||
            'Khach hang',
          createdAt: review.created_at,
        };
      });
  }

  private calculateRating(reviews: ProductRow['reviews']) {
    const approvedReviews = reviews ?? [];

    if (!approvedReviews.length) {
      return 5;
    }

    const total = approvedReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    return Math.round((total / approvedReviews.length) * 10) / 10;
  }
}
