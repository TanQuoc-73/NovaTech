import { BadRequestException, Injectable } from '@nestjs/common';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  StaffDashboardDto,
  StaffInventoryItemDto,
  StaffInventoryPayload,
  StaffOrderDto,
  StaffOrderItemDto,
  StaffOrderStatus,
  StaffOrderStatusPayload,
  StaffReviewDto,
} from './staff.types';

const orderStatuses: StaffOrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: StaffOrderStatus;
  payment_status: string;
  total_amount: string | number;
  shipping_province: string;
  shipping_district: string;
  shipping_ward: string;
  shipping_line1: string;
  shipping_line2: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: number;
    total_price: string | number;
  }>;
};

type InventoryRow = {
  id: string;
  sku: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  products: { name: string } | Array<{ name: string }> | null;
};

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
  products: { name: string } | Array<{ name: string }> | null;
};

@Injectable()
export class StaffService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getDashboard(): Promise<StaffDashboardDto> {
    const [orders, inventory, reviews] = await Promise.all([
      this.getOrders(),
      this.getLowStockInventory(),
      this.getSupportReviews(),
    ]);

    return {
      metrics: {
        pendingOrders: orders.filter((order) => order.status === 'pending')
          .length,
        processingOrders: orders.filter((order) =>
          ['confirmed', 'processing'].includes(order.status),
        ).length,
        lowStockItems: inventory.length,
        supportReviews: reviews.length,
      },
      orders: orders.slice(0, 6),
      inventory: inventory.slice(0, 6),
      reviews: reviews.slice(0, 6),
    };
  }

  async getOrders(): Promise<StaffOrderDto[]> {
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
          total_amount,
          shipping_province,
          shipping_district,
          shipping_ward,
          shipping_line1,
          shipping_line2,
          created_at,
          order_items (
            id,
            product_name,
            variant_name,
            sku,
            quantity,
            total_price
          )
        `,
      )
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as OrderRow[]).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      status: order.status,
      paymentStatus: order.payment_status,
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
      createdAt: order.created_at,
      items: order.order_items.map((item) => this.mapOrderItem(item)),
    }));
  }

  async updateOrderStatus(id: string, payload: StaffOrderStatusPayload) {
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

  async getLowStockInventory(): Promise<StaffInventoryItemDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('product_variants')
      .select(
        `
          id,
          sku,
          name,
          stock_quantity,
          low_stock_threshold,
          is_active,
          products:product_id (name)
        `,
      )
      .order('stock_quantity', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as InventoryRow[])
      .filter((item) => item.stock_quantity <= item.low_stock_threshold)
      .map((item) => {
        const product = Array.isArray(item.products)
          ? item.products[0]
          : item.products;

        return {
          id: item.id,
          productName: product?.name ?? 'San pham',
          variantName: item.name,
          sku: item.sku,
          stockQuantity: item.stock_quantity,
          lowStockThreshold: item.low_stock_threshold,
          isActive: item.is_active,
        };
      });
  }

  async updateInventory(id: string, payload: StaffInventoryPayload) {
    const stockQuantity = this.readStockQuantity(payload.stockQuantity);

    const { error } = await this.supabaseService.client
      .from('product_variants')
      .update({ stock_quantity: stockQuantity })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getLowStockInventory();
  }

  async getSupportReviews(): Promise<StaffReviewDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('reviews')
      .select(
        `
          id,
          rating,
          title,
          content,
          is_approved,
          created_at,
          products:product_id (name)
        `,
      )
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as ReviewRow[]).map((review) => {
      const product = Array.isArray(review.products)
        ? review.products[0]
        : review.products;

      return {
        id: review.id,
        productName: product?.name ?? 'San pham',
        rating: review.rating,
        title: review.title,
        content: review.content,
        isApproved: review.is_approved,
        createdAt: review.created_at,
      };
    });
  }

  private mapOrderItem(
    item: OrderRow['order_items'][number],
  ): StaffOrderItemDto {
    return {
      id: item.id,
      productName: item.product_name,
      variantName: item.variant_name,
      sku: item.sku,
      quantity: item.quantity,
      totalPrice: Number(item.total_price ?? 0),
    };
  }

  private readOrderStatus(value: unknown): StaffOrderStatus {
    if (
      typeof value === 'string' &&
      orderStatuses.includes(value as StaffOrderStatus)
    ) {
      return value as StaffOrderStatus;
    }

    throw new BadRequestException('Invalid order status.');
  }

  private readStockQuantity(value: unknown) {
    const stockQuantity = Number(value);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new BadRequestException(
        'Stock quantity must be a positive integer.',
      );
    }

    return stockQuantity;
  }
}
