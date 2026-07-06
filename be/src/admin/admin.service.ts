import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  AdminBrandDto,
  AdminBrandPayload,
  AdminCategoryDto,
  AdminCategoryPayload,
  AdminDashboardDto,
  AdminOrderDto,
  AdminOrderItemDto,
  AdminOrderStatus,
  AdminOrderStatusPayload,
  AdminPaymentQrSettingDto,
  AdminPaymentQrSettingPayload,
  AdminPaymentStatus,
  AdminPaymentStatusPayload,
  AdminProductDto,
  AdminProductPayload,
  AdminProductVariantImageDto,
  AdminProductVariantImagePayload,
  AdminProductVariantDto,
  AdminProductVariantPayload,
  AdminRecentOrderDto,
} from './admin.types';

const orderStatuses: AdminOrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const paymentStatuses: AdminPaymentStatus[] = [
  'unpaid',
  'paid',
  'failed',
  'refunded',
];

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

type BrandRow = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand_id: string | null;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  categories: { name: string } | Array<{ name: string }> | null;
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
    low_stock_threshold: number;
    weight_grams: number | null;
    is_active: boolean;
    product_variant_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      sort_order: number;
    }>;
  }>;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  payment_status: string;
  total_amount: string | number;
  created_at: string;
};

type AdminOrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: AdminOrderStatus;
  payment_status: AdminPaymentStatus;
  payment_method: string;
  subtotal_amount: string | number;
  shipping_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  shipping_province: string;
  shipping_district: string;
  shipping_ward: string;
  shipping_line1: string;
  shipping_line2: string | null;
  note: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: number;
    unit_price: string | number;
    total_price: string | number;
  }>;
};

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

type PaymentQrSettingRow = {
  id: string;
  provider: string;
  title: string;
  qr_image_url: string;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async getDashboard(): Promise<AdminDashboardDto> {
    const [categories, brands, products, recentOrders, paymentQrSettings] =
      await Promise.all([
        this.getCategories(),
        this.getBrands(),
        this.getProducts(),
        this.getRecentOrders(),
        this.getPaymentQrSettings(),
      ]);
    const paidOrders = recentOrders.filter(
      (order) => order.paymentStatus === 'paid' || order.status === 'delivered',
    );

    return {
      metrics: {
        revenue: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: recentOrders.length,
        pendingOrders: recentOrders.filter(
          (order) => order.status === 'pending',
        ).length,
        deliveredOrders: recentOrders.filter(
          (order) => order.status === 'delivered',
        ).length,
        products: products.length,
        activeProducts: products.filter((product) => product.isActive).length,
        lowStockVariants: products.filter((product) => product.stock <= 5)
          .length,
        categories: categories.length,
        brands: brands.length,
      },
      categories,
      brands,
      products,
      recentOrders,
      paymentQrSettings,
    };
  }

  async getRecentOrders(): Promise<AdminRecentOrderDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('orders')
      .select(
        'id, order_number, customer_name, status, payment_status, total_amount, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      if (error.code === 'PGRST205') {
        return [];
      }

      throw error;
    }

    return ((data ?? []) as unknown as OrderRow[]).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      status: order.status,
      paymentStatus: order.payment_status,
      totalAmount: Number(order.total_amount ?? 0),
      createdAt: order.created_at,
    }));
  }

  async getOrders(): Promise<AdminOrderDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('orders')
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          status,
          payment_status,
          payment_method,
          subtotal_amount,
          shipping_amount,
          discount_amount,
          total_amount,
          shipping_province,
          shipping_district,
          shipping_ward,
          shipping_line1,
          shipping_line2,
          note,
          created_at,
          order_items (
            id,
            product_name,
            variant_name,
            sku,
            quantity,
            unit_price,
            total_price
          )
        `,
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (error.code === 'PGRST205') {
        return [];
      }

      throw error;
    }

    return ((data ?? []) as unknown as AdminOrderRow[]).map((order) =>
      this.mapOrder(order),
    );
  }

  async updateOrderStatus(id: string, payload: AdminOrderStatusPayload) {
    const status = this.readOrderStatus(payload.status);

    const { error } = await this.supabaseService.client
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getOrders();
  }

  async updateOrderPaymentStatus(
    id: string,
    payload: AdminPaymentStatusPayload,
  ) {
    const paymentStatus = this.readPaymentStatus(payload.paymentStatus);

    const { error: orderError } = await this.supabaseService.client
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', id);

    if (orderError) {
      throw orderError;
    }

    const { error: paymentError } = await this.supabaseService.client
      .from('payments')
      .update({ status: paymentStatus })
      .eq('order_id', id);

    if (paymentError) {
      throw paymentError;
    }

    return this.getOrders();
  }

  async uploadProductImage(file: UploadedImageFile | undefined) {
    return this.uploadImageToStorage(file, 'product-images', 'admin');
  }

  async uploadPaymentQrImage(file: UploadedImageFile | undefined) {
    return this.uploadImageToStorage(file, 'payment-qr-images', 'payment-qr');
  }

  private async uploadImageToStorage(
    file: UploadedImageFile | undefined,
    defaultBucket: string,
    folder: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed.');
    }

    const bucket =
      this.configService.get<string>(
        defaultBucket === 'payment-qr-images'
          ? 'SUPABASE_PAYMENT_QR_BUCKET'
          : 'SUPABASE_PRODUCT_IMAGES_BUCKET',
      ) ?? defaultBucket;
    const extension = this.getImageExtension(file.originalname, file.mimetype);
    const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

    const { error } = await this.supabaseService.client.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const { data } = this.supabaseService.client.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      bucket,
      path,
      publicUrl: data.publicUrl,
    };
  }

  async getPaymentQrSettings(): Promise<AdminPaymentQrSettingDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('payment_qr_settings')
      .select(
        'id, provider, title, qr_image_url, account_name, account_number, bank_name, instructions, is_active, sort_order',
      )
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as PaymentQrSettingRow[]).map((setting) =>
      this.mapPaymentQrSetting(setting),
    );
  }

  async createPaymentQrSetting(payload: AdminPaymentQrSettingPayload) {
    const { error } = await this.supabaseService.client
      .from('payment_qr_settings')
      .insert({
        provider: this.readPaymentProvider(payload.provider),
        title: this.readString(payload.title, 'title'),
        qr_image_url: this.readString(payload.qrImageUrl, 'qrImageUrl'),
        account_name: this.readOptionalString(payload.accountName),
        account_number: this.readOptionalString(payload.accountNumber),
        bank_name: this.readOptionalString(payload.bankName),
        instructions: this.readOptionalString(payload.instructions),
        is_active: this.readOptionalBoolean(payload.isActive) ?? true,
        sort_order: this.readOptionalNumber(payload.sortOrder) ?? 0,
      });

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async updatePaymentQrSetting(
    id: string,
    payload: AdminPaymentQrSettingPayload,
  ) {
    const updates: Record<string, unknown> = {};

    if (payload.provider !== undefined) {
      updates.provider = this.readPaymentProvider(payload.provider);
    }

    this.assignString(updates, 'title', payload.title);
    this.assignString(updates, 'qr_image_url', payload.qrImageUrl);
    this.assignString(updates, 'account_name', payload.accountName);
    this.assignString(updates, 'account_number', payload.accountNumber);
    this.assignString(updates, 'bank_name', payload.bankName);
    this.assignString(updates, 'instructions', payload.instructions);
    this.assignBoolean(updates, 'is_active', payload.isActive);
    this.assignNumber(updates, 'sort_order', payload.sortOrder);

    const { error } = await this.supabaseService.client
      .from('payment_qr_settings')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async deletePaymentQrSetting(id: string) {
    const { error } = await this.supabaseService.client
      .from('payment_qr_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async getCategories(): Promise<AdminCategoryDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('categories')
      .select('id, name, slug, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as CategoryRow[]).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sort_order,
      isActive: category.is_active,
    }));
  }

  async createCategory(payload: AdminCategoryPayload) {
    const name = this.readString(payload.name, 'name');
    const slug = this.readString(payload.slug, 'slug');

    const { error } = await this.supabaseService.client
      .from('categories')
      .insert({
        name,
        slug,
        sort_order: this.readOptionalNumber(payload.sortOrder) ?? 0,
        is_active: this.readOptionalBoolean(payload.isActive) ?? true,
      });

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async updateCategory(id: string, payload: AdminCategoryPayload) {
    const updates: Record<string, unknown> = {};

    this.assignString(updates, 'name', payload.name);
    this.assignString(updates, 'slug', payload.slug);
    this.assignNumber(updates, 'sort_order', payload.sortOrder);
    this.assignBoolean(updates, 'is_active', payload.isActive);

    const { error } = await this.supabaseService.client
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async deleteCategory(id: string) {
    const { error } = await this.supabaseService.client
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async getBrands(): Promise<AdminBrandDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('brands')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as BrandRow[]).map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
    }));
  }

  async createBrand(payload: AdminBrandPayload) {
    const { error } = await this.supabaseService.client.from('brands').insert({
      name: this.readString(payload.name, 'name'),
      slug: this.readString(payload.slug, 'slug'),
    });

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async updateBrand(id: string, payload: AdminBrandPayload) {
    const updates: Record<string, unknown> = {};

    this.assignString(updates, 'name', payload.name);
    this.assignString(updates, 'slug', payload.slug);

    const { error } = await this.supabaseService.client
      .from('brands')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async deleteBrand(id: string) {
    const { error } = await this.supabaseService.client
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async getProducts(): Promise<AdminProductDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('products')
      .select(
        `
          id,
          name,
          slug,
          category_id,
          brand_id,
          short_description,
          description,
          thumbnail_url,
          is_active,
          is_featured,
          categories:category_id (name),
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
            low_stock_threshold,
            weight_grams,
            is_active,
            product_variant_images (
              id,
              image_url,
              alt_text,
              sort_order
            )
          )
        `,
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as ProductRow[]).map((product) => {
      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;
      const brand = Array.isArray(product.brands)
        ? product.brands[0]
        : product.brands;
      const variant = product.product_variants[0];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryId: product.category_id,
        brandId: product.brand_id,
        brand: brand?.name ?? 'NovaTech',
        category: category?.name ?? 'Chua phan loai',
        shortDescription: product.short_description,
        description: product.description,
        thumbnailUrl: product.thumbnail_url,
        isActive: product.is_active,
        isFeatured: product.is_featured,
        price: Number(variant?.price ?? 0),
        stock: variant?.stock_quantity ?? 0,
        variants: product.product_variants.map((item) =>
          this.mapProductVariant(item),
        ),
      };
    });
  }

  async createProduct(payload: AdminProductPayload) {
    const name = this.readString(payload.name, 'name');
    const thumbnailUrl = this.readOptionalString(payload.thumbnailUrl);
    const { data: product, error: productError } =
      await this.supabaseService.client
        .from('products')
        .insert({
          name,
          slug: this.readString(payload.slug, 'slug'),
          category_id: this.readString(payload.categoryId, 'categoryId'),
          brand_id: this.readString(payload.brandId, 'brandId'),
          short_description: this.readOptionalString(payload.shortDescription),
          description: this.readOptionalString(payload.description),
          thumbnail_url: thumbnailUrl,
          is_active: this.readOptionalBoolean(payload.isActive) ?? true,
          is_featured: this.readOptionalBoolean(payload.isFeatured) ?? false,
        })
        .select('id')
        .single();

    if (productError) {
      throw productError;
    }

    const productId = this.readCreatedId(product);

    const { error: variantError } = await this.supabaseService.client
      .from('product_variants')
      .insert({
        product_id: productId,
        sku: this.readString(payload.sku, 'sku'),
        name: this.readString(payload.variantName, 'variantName'),
        price: this.readNumber(payload.price, 'price'),
        compare_at_price: this.readOptionalNumber(payload.compareAtPrice),
        stock_quantity: this.readOptionalNumber(payload.stockQuantity) ?? 0,
      });

    if (variantError) {
      throw variantError;
    }

    await this.syncProductMainImage(productId, thumbnailUrl, name);

    return this.getDashboard();
  }

  async updateProduct(id: string, payload: AdminProductPayload) {
    const updates: Record<string, unknown> = {};

    this.assignString(updates, 'name', payload.name);
    this.assignString(updates, 'slug', payload.slug);
    this.assignString(updates, 'category_id', payload.categoryId);
    this.assignString(updates, 'brand_id', payload.brandId);
    this.assignString(updates, 'short_description', payload.shortDescription);
    this.assignString(updates, 'description', payload.description);
    this.assignString(updates, 'thumbnail_url', payload.thumbnailUrl);
    this.assignBoolean(updates, 'is_active', payload.isActive);
    this.assignBoolean(updates, 'is_featured', payload.isFeatured);

    const { error } = await this.supabaseService.client
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }

    if (typeof payload.thumbnailUrl === 'string') {
      await this.syncProductMainImage(
        id,
        this.readOptionalString(payload.thumbnailUrl),
        typeof payload.name === 'string' && payload.name.trim()
          ? payload.name.trim()
          : undefined,
      );
    }

    return this.getDashboard();
  }

  async createProductVariantImage(
    productId: string,
    variantId: string,
    payload: AdminProductVariantImagePayload,
  ) {
    await this.ensureProductVariant(productId, variantId);

    const { error } = await this.supabaseService.client
      .from('product_variant_images')
      .insert({
        variant_id: variantId,
        image_url: this.readString(payload.imageUrl, 'imageUrl'),
        alt_text: this.readOptionalString(payload.altText),
        sort_order: this.readOptionalNumber(payload.sortOrder) ?? 0,
      });

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async updateProductVariantImage(
    productId: string,
    variantId: string,
    imageId: string,
    payload: AdminProductVariantImagePayload,
  ) {
    await this.ensureProductVariant(productId, variantId);

    const updates: Record<string, unknown> = {};

    this.assignString(updates, 'image_url', payload.imageUrl);
    this.assignString(updates, 'alt_text', payload.altText);
    this.assignNumber(updates, 'sort_order', payload.sortOrder);

    const { error } = await this.supabaseService.client
      .from('product_variant_images')
      .update(updates)
      .eq('id', imageId)
      .eq('variant_id', variantId);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async deleteProductVariantImage(
    productId: string,
    variantId: string,
    imageId: string,
  ) {
    await this.ensureProductVariant(productId, variantId);

    const { error } = await this.supabaseService.client
      .from('product_variant_images')
      .delete()
      .eq('id', imageId)
      .eq('variant_id', variantId);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async deleteProduct(id: string) {
    const { error } = await this.supabaseService.client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async createProductVariant(
    productId: string,
    payload: AdminProductVariantPayload,
  ) {
    const { error } = await this.supabaseService.client
      .from('product_variants')
      .insert({
        product_id: productId,
        name: this.readString(payload.name, 'name'),
        sku: this.readString(payload.sku, 'sku'),
        color: this.readOptionalString(payload.color),
        storage: this.readOptionalString(payload.storage),
        ram: this.readOptionalString(payload.ram),
        price: this.readNumber(payload.price, 'price'),
        compare_at_price: this.readOptionalNumber(payload.compareAtPrice),
        stock_quantity: this.readOptionalNumber(payload.stockQuantity) ?? 0,
        low_stock_threshold:
          this.readOptionalNumber(payload.lowStockThreshold) ?? 5,
        weight_grams: this.readOptionalNumber(payload.weightGrams),
        is_active: this.readOptionalBoolean(payload.isActive) ?? true,
      });

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async updateProductVariant(
    productId: string,
    variantId: string,
    payload: AdminProductVariantPayload,
  ) {
    const updates: Record<string, unknown> = {};

    this.assignString(updates, 'name', payload.name);
    this.assignString(updates, 'sku', payload.sku);
    this.assignString(updates, 'color', payload.color);
    this.assignString(updates, 'storage', payload.storage);
    this.assignString(updates, 'ram', payload.ram);
    this.assignNumber(updates, 'price', payload.price);
    this.assignNumber(updates, 'compare_at_price', payload.compareAtPrice);
    this.assignNumber(updates, 'stock_quantity', payload.stockQuantity);
    this.assignNumber(
      updates,
      'low_stock_threshold',
      payload.lowStockThreshold,
    );
    this.assignNumber(updates, 'weight_grams', payload.weightGrams);
    this.assignBoolean(updates, 'is_active', payload.isActive);

    const { error } = await this.supabaseService.client
      .from('product_variants')
      .update(updates)
      .eq('id', variantId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  async deleteProductVariant(productId: string, variantId: string) {
    const { error } = await this.supabaseService.client
      .from('product_variants')
      .delete()
      .eq('id', variantId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    return this.getDashboard();
  }

  private mapOrder(order: AdminOrderRow): AdminOrderDto {
    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      subtotalAmount: Number(order.subtotal_amount ?? 0),
      shippingAmount: Number(order.shipping_amount ?? 0),
      discountAmount: Number(order.discount_amount ?? 0),
      totalAmount: Number(order.total_amount ?? 0),
      shippingAddress: [
        order.shipping_line1,
        order.shipping_line2,
        order.shipping_ward,
        order.shipping_district,
        order.shipping_province,
      ]
        .filter(Boolean)
        .join(', '),
      note: order.note,
      createdAt: order.created_at,
      items: order.order_items.map((item) => this.mapOrderItem(item)),
    };
  }

  private mapOrderItem(
    item: AdminOrderRow['order_items'][number],
  ): AdminOrderItemDto {
    return {
      id: item.id,
      productName: item.product_name,
      variantName: item.variant_name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price ?? 0),
      totalPrice: Number(item.total_price ?? 0),
    };
  }

  private mapProductVariant(
    variant: ProductRow['product_variants'][number],
  ): AdminProductVariantDto {
    return {
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      color: variant.color,
      storage: variant.storage,
      ram: variant.ram,
      price: Number(variant.price ?? 0),
      compareAtPrice:
        variant.compare_at_price === null
          ? null
          : Number(variant.compare_at_price),
      stockQuantity: variant.stock_quantity,
      lowStockThreshold: variant.low_stock_threshold,
      weightGrams: variant.weight_grams,
      isActive: variant.is_active,
      images: variant.product_variant_images
        .map((image) => this.mapProductVariantImage(image))
        .sort((left, right) => left.sortOrder - right.sortOrder),
    };
  }

  private mapProductVariantImage(
    image: ProductRow['product_variants'][number]['product_variant_images'][number],
  ): AdminProductVariantImageDto {
    return {
      id: image.id,
      imageUrl: image.image_url,
      altText: image.alt_text,
      sortOrder: image.sort_order,
    };
  }

  private mapPaymentQrSetting(
    setting: PaymentQrSettingRow,
  ): AdminPaymentQrSettingDto {
    return {
      id: setting.id,
      provider: setting.provider,
      title: setting.title,
      qrImageUrl: setting.qr_image_url,
      accountName: setting.account_name,
      accountNumber: setting.account_number,
      bankName: setting.bank_name,
      instructions: setting.instructions,
      isActive: setting.is_active,
      sortOrder: setting.sort_order,
    };
  }

  private async ensureProductVariant(productId: string, variantId: string) {
    const { data, error } = await this.supabaseService.client
      .from('product_variants')
      .select('id')
      .eq('id', variantId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new BadRequestException('Product variant was not found.');
    }
  }

  private async syncProductMainImage(
    productId: string,
    imageUrl: string | null,
    altText?: string,
  ) {
    if (!imageUrl) {
      return;
    }

    const { data: existingImage, error: findError } =
      await this.supabaseService.client
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (
      existingImage &&
      typeof existingImage === 'object' &&
      'id' in existingImage &&
      typeof existingImage.id === 'string'
    ) {
      const { error } = await this.supabaseService.client
        .from('product_images')
        .update({
          image_url: imageUrl,
          alt_text: altText ?? null,
          sort_order: 1,
        })
        .eq('id', existingImage.id);

      if (error) {
        throw error;
      }

      return;
    }

    const { error } = await this.supabaseService.client
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        alt_text: altText ?? null,
        sort_order: 1,
      });

    if (error) {
      throw error;
    }
  }

  private getImageExtension(originalName: string, mimeType: string) {
    const extension = originalName.split('.').pop()?.toLowerCase();

    if (extension && /^[a-z0-9]+$/.test(extension)) {
      return extension === 'jpeg' ? 'jpg' : extension;
    }

    if (mimeType === 'image/png') {
      return 'png';
    }

    if (mimeType === 'image/webp') {
      return 'webp';
    }

    if (mimeType === 'image/gif') {
      return 'gif';
    }

    return 'jpg';
  }

  private readString(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${field} is required.`);
    }

    return value.trim();
  }

  private readOptionalString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private readNumber(value: unknown, field: string) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue < 0) {
      throw new BadRequestException(`${field} must be a positive number.`);
    }

    return numberValue;
  }

  private readOptionalNumber(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  private readOptionalBoolean(value: unknown) {
    return typeof value === 'boolean' ? value : undefined;
  }

  private readPaymentProvider(value: unknown) {
    if (value === 'bank_transfer' || value === 'momo' || value === 'vnpay') {
      return value;
    }

    return 'bank_transfer';
  }

  private readOrderStatus(value: unknown): AdminOrderStatus {
    if (
      typeof value === 'string' &&
      orderStatuses.includes(value as AdminOrderStatus)
    ) {
      return value as AdminOrderStatus;
    }

    throw new BadRequestException('Invalid order status.');
  }

  private readPaymentStatus(value: unknown): AdminPaymentStatus {
    if (
      typeof value === 'string' &&
      paymentStatuses.includes(value as AdminPaymentStatus)
    ) {
      return value as AdminPaymentStatus;
    }

    throw new BadRequestException('Invalid payment status.');
  }

  private readCreatedId(value: unknown) {
    if (
      value &&
      typeof value === 'object' &&
      'id' in value &&
      typeof value.id === 'string'
    ) {
      return value.id;
    }

    throw new BadRequestException('Cannot create product.');
  }

  private assignString(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ) {
    if (typeof value === 'string') {
      target[key] = value.trim() || null;
    }
  }

  private assignNumber(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ) {
    const numberValue = this.readOptionalNumber(value);

    if (numberValue !== undefined) {
      target[key] = numberValue;
    }
  }

  private assignBoolean(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ) {
    if (typeof value === 'boolean') {
      target[key] = value;
    }
  }
}
