import { Injectable } from '@nestjs/common';

import type {
  CatalogBrandDto,
  CatalogCategoryDto,
  CatalogHeroBannerDto,
  CatalogNewsArticleDto,
  CatalogProductDto,
  CatalogProductFilters,
  CatalogProductSort,
  CatalogVoucherDto,
  VoucherValidationDto,
} from './catalog.types';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import { mapProducts, type ProductRow } from '../shared/utils/product-mapper.util';

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

type HeroBannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  label: string | null;
  tag: string | null;
  device_type: string | null;
  price_text: string | null;
  highlight_label: string | null;
  highlight: string | null;
  image_url: string | null;
  href: string | null;
  gradient: string;
  sort_order: number;
};

type NewsArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image_url: string | null;
  href: string | null;
  published_at: string;
};

type VoucherRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: string | number;
  min_order_amount: string | number;
  max_discount_amount: string | number | null;
  usage_limit: number | null;
  used_count: number;
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

  async findHeroBanners(): Promise<CatalogHeroBannerDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('hero_banners')
      .select(
        'id, title, subtitle, label, tag, device_type, price_text, highlight_label, highlight, image_url, href, gradient, sort_order',
      )
      .eq('is_active', true)
      .or('starts_at.is.null,starts_at.lte.now()')
      .or('ends_at.is.null,ends_at.gte.now()')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as HeroBannerRow[]).map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      label: banner.label,
      tag: banner.tag,
      deviceType: banner.device_type,
      priceText: banner.price_text,
      highlightLabel: banner.highlight_label,
      highlight: banner.highlight,
      imageUrl: banner.image_url,
      href: banner.href,
      gradient: banner.gradient,
      sortOrder: banner.sort_order,
    }));
  }

  async findNewsArticles(): Promise<CatalogNewsArticleDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('news_articles')
      .select(
        'id, title, slug, excerpt, content, category, image_url, href, published_at',
      )
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(12);

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as NewsArticleRow[]).map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      imageUrl: article.image_url,
      href: article.href,
      publishedAt: article.published_at,
    }));
  }

  async findActiveVouchers(): Promise<CatalogVoucherDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('vouchers')
      .select(
        'id, code, title, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count',
      )
      .eq('is_active', true)
      .or('starts_at.is.null,starts_at.lte.now()')
      .or('ends_at.is.null,ends_at.gte.now()')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as VoucherRow[])
      .filter((voucher) => this.hasVoucherUsageLeft(voucher))
      .map((voucher) => this.mapVoucher(voucher));
  }

  async validateVoucher(
    code: string | undefined,
    subtotalValue: string | undefined,
  ): Promise<VoucherValidationDto> {
    const normalizedCode = code?.trim().toUpperCase() ?? '';
    const subtotal = Number(subtotalValue ?? 0);

    if (!normalizedCode) {
      return {
        isValid: false,
        code: '',
        discountAmount: 0,
        message: 'Vui long nhap ma voucher.',
      };
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return {
        isValid: false,
        code: normalizedCode,
        discountAmount: 0,
        message: 'Tong tien khong hop le.',
      };
    }

    const voucher = await this.findVoucherByCode(normalizedCode);

    if (!voucher) {
      return {
        isValid: false,
        code: normalizedCode,
        discountAmount: 0,
        message: 'Voucher khong hop le hoac da het han.',
      };
    }

    const discountAmount = this.calculateVoucherDiscount(voucher, subtotal);

    if (discountAmount <= 0) {
      return {
        isValid: false,
        code: normalizedCode,
        discountAmount: 0,
        message: `Don hang can toi thieu ${Number(voucher.min_order_amount).toLocaleString('vi-VN')}d.`,
      };
    }

    return {
      isValid: true,
      code: voucher.code,
      title: voucher.title,
      discountAmount,
    };
  }

  async lookupWarranty(query: string | undefined) {
    const q = query?.trim();
    if (!q || q.length < 3) {
      return { found: false as const };
    }

    const { data, error } = await this.supabaseService.client
      .from('orders')
      .select(`
        id, order_number, status, created_at,
        order_items (
          product_name, variant_name, sku, quantity
        )
      `)
      .or(`order_number.ilike.%${q}%,order_items.sku.ilike.%${q}%`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { found: false as const };
    }

    const order = data as {
      id: string;
      order_number: string;
      status: string;
      created_at: string;
      order_items: Array<{
        product_name: string;
        variant_name: string;
        sku: string;
        quantity: number;
      }>;
    };

    return {
      found: true as const,
      orderNumber: order.order_number,
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items,
    };
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

    return mapProducts(data ?? []);
  }

  async findProductBySlug(slug: string): Promise<CatalogProductDto | null> {
    const { data, error } = await this.supabaseService.client
      .from('products')
      .select(this.productSelect)
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('product_variants.is_active', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const results = mapProducts([data as unknown as ProductRow]);
    return results[0] ?? null;
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
    const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;
    const hasStockFilter = shouldFilterInStock;

    let productIds: string[] | null = null;

    if (hasPriceFilter || hasStockFilter) {
      let variantQuery = this.supabaseService.client
        .from('product_variants')
        .select('product_id')
        .eq('is_active', true);

      if (hasPriceFilter) {
        if (minPrice !== undefined) {
          variantQuery = variantQuery.gte('price', minPrice);
        }
        if (maxPrice !== undefined) {
          variantQuery = variantQuery.lte('price', maxPrice);
        }
      }

      if (hasStockFilter) {
        variantQuery = variantQuery.gt('stock_quantity', 0);
      }

      const { data: matchingVariants, error: variantError } =
        await variantQuery.limit(256);

      if (variantError) {
        throw variantError;
      }

      productIds = [
        ...new Set(
          (matchingVariants ?? []).map((v) => v.product_id as string),
        ),
      ];

      if (productIds.length === 0) {
        return [];
      }
    }

    let request = this.supabaseService.client
      .from('products')
      .select(this.productSelect)
      .eq('is_active', true)
      .eq('product_variants.is_active', true)
      .limit(64);

    if (productIds) {
      request = request.in('id', productIds);
    }

    if (sort === 'name_asc') {
      request = request.order('name', { ascending: true });
    } else if (sort === 'price_asc') {
      request = request.order('product_variants.price', { ascending: true, foreignTable: 'product_variants' });
    } else if (sort === 'price_desc') {
      request = request.order('product_variants.price', { ascending: false, foreignTable: 'product_variants' });
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

    let products = mapProducts(data ?? []);

    if (sort === 'stock_desc') {
      products.sort((left, right) => right.stock - left.stock);
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
  `;

  private async findVoucherByCode(code: string) {
    const { data, error } = await this.supabaseService.client
      .from('vouchers')
      .select(
        'id, code, title, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count',
      )
      .eq('code', code)
      .eq('is_active', true)
      .or('starts_at.is.null,starts_at.lte.now()')
      .or('ends_at.is.null,ends_at.gte.now()')
      .maybeSingle();

    if (error) {
      throw error;
    }

    const voucher = data as unknown as VoucherRow | null;

    return voucher && this.hasVoucherUsageLeft(voucher) ? voucher : null;
  }

  private hasVoucherUsageLeft(voucher: VoucherRow) {
    return (
      voucher.usage_limit === null || voucher.used_count < voucher.usage_limit
    );
  }

  private mapVoucher(voucher: VoucherRow): CatalogVoucherDto {
    return {
      id: voucher.id,
      code: voucher.code,
      title: voucher.title,
      description: voucher.description,
      discountType: voucher.discount_type,
      discountValue: Number(voucher.discount_value),
      minOrderAmount: Number(voucher.min_order_amount),
      maxDiscountAmount:
        voucher.max_discount_amount === null
          ? null
          : Number(voucher.max_discount_amount),
    };
  }

  private calculateVoucherDiscount(voucher: VoucherRow, subtotal: number) {
    const minOrderAmount = Number(voucher.min_order_amount);

    if (subtotal < minOrderAmount) {
      return 0;
    }

    const rawDiscount =
      voucher.discount_type === 'percent'
        ? Math.floor((subtotal * Number(voucher.discount_value)) / 100)
        : Number(voucher.discount_value);
    const maxDiscount =
      voucher.max_discount_amount === null
        ? rawDiscount
        : Math.min(rawDiscount, Number(voucher.max_discount_amount));

    return Math.max(0, Math.min(subtotal, maxDiscount));
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
