import { Injectable } from '@nestjs/common';

import type {
  CatalogBrandDto,
  CatalogCategoryDto,
  CatalogProductDto,
  CatalogProductFilters,
  CatalogProductSort,
} from './catalog.types';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

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
    rating: number;
    is_approved: boolean;
  }>;
};

@Injectable()
export class CatalogService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findCategories(): Promise<CatalogCategoryDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as CategoryRow[]).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.image_url,
    }));
  }

  async findBrands(): Promise<CatalogBrandDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('brands')
      .select('id, name, slug, logo_url')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as BrandRow[]).map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url,
    }));
  }

  async findFeaturedProducts(): Promise<CatalogProductDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('products')
      .select(this.productSelect)
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('product_variants.is_active', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) {
      throw error;
    }

    return this.mapProducts(data ?? []);
  }

  async findProducts(
    filters: CatalogProductFilters = {},
  ): Promise<CatalogProductDto[]> {
    const normalizedQuery = filters.q?.trim();
    const normalizedBrand = filters.brand?.trim();
    const normalizedCategory = filters.category?.trim();
    const sort = this.normalizeSort(filters.sort);
    const minPrice = this.readOptionalPrice(filters.minPrice);
    const maxPrice = this.readOptionalPrice(filters.maxPrice);
    const shouldFilterInStock = this.readBooleanFilter(filters.inStock);
    const shouldFilterFeatured = this.readBooleanFilter(filters.featured);
    let request = this.supabaseService.client
      .from('products')
      .select(this.productSelect)
      .eq('is_active', true)
      .eq('product_variants.is_active', true)
      .limit(64);

    if (sort === 'name_asc') {
      request = request.order('name', { ascending: true });
    } else {
      request = request.order('created_at', { ascending: false });
    }

    if (normalizedQuery) {
      const escapedQuery = normalizedQuery
        .replaceAll('%', '\\%')
        .replaceAll('_', '\\_');

      request = request.or(
        `name.ilike.%${escapedQuery}%,short_description.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`,
      );
    }

    if (normalizedBrand) {
      const brandId = await this.findBrandIdBySlug(normalizedBrand);

      if (!brandId) {
        return [];
      }

      request = request.eq('brand_id', brandId);
    }

    if (normalizedCategory) {
      const categoryId = await this.findCategoryIdBySlug(normalizedCategory);

      if (!categoryId) {
        return [];
      }

      request = request.eq('category_id', categoryId);
    }

    if (shouldFilterFeatured) {
      request = request.eq('is_featured', true);
    }

    const { data, error } = await request;

    if (error) {
      throw error;
    }

    let products = this.mapProducts(data ?? []);

    if (minPrice !== undefined) {
      products = products.filter((product) => product.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      products = products.filter((product) => product.price <= maxPrice);
    }

    if (shouldFilterInStock) {
      products = products.filter((product) => product.stock > 0);
    }

    if (sort === 'price_asc') {
      return products.sort((left, right) => left.price - right.price);
    }

    if (sort === 'price_desc') {
      return products.sort((left, right) => right.price - left.price);
    }

    if (sort === 'stock_desc') {
      return products.sort((left, right) => right.stock - left.stock);
    }

    return products;
  }

  private readonly productSelect = `
    id,
    name,
    thumbnail_url,
    is_featured,
    categories:category_id (slug, name),
    brands:brand_id (name),
    product_variants!inner (
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
      rating,
      is_approved
    )
  `;

  private mapProducts(products: ProductRow[]): CatalogProductDto[] {
    return products.flatMap((product) => {
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
          images: item.product_variant_images
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
      };
    });
  }

  private calculateRating(reviews: ProductRow['reviews']) {
    const approvedReviews = (reviews ?? []).filter(
      (review) => review.is_approved,
    );

    if (!approvedReviews.length) {
      return 5;
    }

    const total = approvedReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    return Math.round((total / approvedReviews.length) * 10) / 10;
  }

  private normalizeSort(sort: string | undefined): CatalogProductSort {
    const supportedSorts: CatalogProductSort[] = [
      'newest',
      'name_asc',
      'price_asc',
      'price_desc',
      'stock_desc',
    ];

    return supportedSorts.includes(sort as CatalogProductSort)
      ? (sort as CatalogProductSort)
      : 'newest';
  }

  private readOptionalPrice(value: string | undefined) {
    if (!value?.trim()) {
      return undefined;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue) && numberValue >= 0
      ? numberValue
      : undefined;
  }

  private readBooleanFilter(value: string | undefined) {
    return value === 'true' || value === '1' || value === 'on';
  }

  private async findBrandIdBySlug(slug: string): Promise<string | null> {
    const { data, error } = await this.supabaseService.client
      .from('brands')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const brand: unknown = data;

    if (
      brand &&
      typeof brand === 'object' &&
      'id' in brand &&
      typeof brand.id === 'string'
    ) {
      return brand.id;
    }

    return null;
  }

  private async findCategoryIdBySlug(slug: string): Promise<string | null> {
    const { data, error } = await this.supabaseService.client
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const category: unknown = data;

    if (
      category &&
      typeof category === 'object' &&
      'id' in category &&
      typeof category.id === 'string'
    ) {
      return category.id;
    }

    return null;
  }
}
