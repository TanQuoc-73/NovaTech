import { BadRequestException, Injectable } from '@nestjs/common';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  CreateOrderItemReviewPayload,
  CustomerOrderDto,
  CustomerOrderItemDto,
  CustomerOrderItemReviewDto,
  CustomerOrderStatus,
} from './orders.types';

type OrderRow = {
  id: string;
  order_number: string;
  status: CustomerOrderStatus;
  payment_status: string;
  payment_method: string;
  total_amount: string | number;
  shipping_province: string;
  shipping_district: string;
  shipping_ward: string;
  shipping_line1: string;
  shipping_line2: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    variant_id: string | null;
    product_name: string;
    variant_name: string;
    sku: string;
    unit_price: string | number;
    quantity: number;
    total_price: string | number;
    product_variants:
      | { product_id: string }
      | Array<{ product_id: string }>
      | null;
  }>;
};

type ReviewRow = {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
};

type OrderItemReviewSourceRow = {
  id: string;
  orders: { id: string; user_id: string | null; status: CustomerOrderStatus } | null;
  product_variants:
    | { product_id: string }
    | Array<{ product_id: string }>
    | null;
};

@Injectable()
export class OrdersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getMyOrders(userId: string): Promise<CustomerOrderDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('orders')
      .select(
        `
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          total_amount,
          shipping_province,
          shipping_district,
          shipping_ward,
          shipping_line1,
          shipping_line2,
          created_at,
          order_items (
            id,
            variant_id,
            product_name,
            variant_name,
            sku,
            unit_price,
            quantity,
            total_price,
            product_variants:variant_id (
              product_id
            )
          )
        `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const orders = (data ?? []) as unknown as OrderRow[];
    const reviewsByProductId = await this.getMyReviewsByProductId(
      userId,
      orders.flatMap((order) =>
        order.order_items
          .map((item) => this.getOrderItemProductId(item))
          .filter((productId): productId is string => Boolean(productId)),
      ),
    );

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      totalAmount: Number(order.total_amount ?? 0),
      createdAt: order.created_at,
      shippingAddress: [
        order.shipping_line1,
        order.shipping_line2,
        order.shipping_ward,
        order.shipping_district,
        order.shipping_province,
      ]
        .filter(Boolean)
        .join(', '),
      items: order.order_items.map((item) =>
        this.mapOrderItem(item, reviewsByProductId),
      ),
    }));
  }

  async cancelMyOrder(userId: string, orderId: string) {
    if (!orderId.trim()) {
      throw new BadRequestException('orderId is required.');
    }

    const response = await this.supabaseService.client.rpc(
      'cancel_customer_order',
      {
        p_user_id: userId,
        p_order_id: orderId,
      },
    );

    if (response.error) {
      throw new BadRequestException(
        this.mapCancelError(response.error.message),
      );
    }

    return this.getMyOrders(userId);
  }

  async reviewOrderItem(
    userId: string,
    itemId: string,
    payload: CreateOrderItemReviewPayload,
  ) {
    if (!itemId.trim()) {
      throw new BadRequestException('itemId is required.');
    }

    const rating = Number(payload.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Vui long chon so sao tu 1 den 5.');
    }

    const title = this.normalizeReviewText(payload.title, 120);
    const content = this.normalizeReviewText(payload.content, 1200);

    if (!title && !content) {
      throw new BadRequestException('Vui long nhap noi dung danh gia.');
    }

    const { data, error } = await this.supabaseService.client
      .from('order_items')
      .select(
        `
          id,
          orders:order_id (
            id,
            user_id,
            status
          ),
          product_variants:variant_id (
            product_id
          )
        `,
      )
      .eq('id', itemId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const item = data as unknown as OrderItemReviewSourceRow | null;
    const order = item?.orders;
    const productId = item ? this.getReviewSourceProductId(item) : null;

    if (!item || !order || order.user_id !== userId || !productId) {
      throw new BadRequestException('Khong tim thay san pham trong don hang.');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('Chi co the danh gia sau khi da nhan hang.');
    }

    const { error: upsertError } = await this.supabaseService.client
      .from('reviews')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          rating,
          title,
          content,
          is_approved: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,product_id' },
      );

    if (upsertError) {
      throw upsertError;
    }

    return this.getMyOrders(userId);
  }

  private mapOrderItem(
    item: OrderRow['order_items'][number],
    reviewsByProductId: Map<string, CustomerOrderItemReviewDto>,
  ): CustomerOrderItemDto {
    const productId = this.getOrderItemProductId(item);

    return {
      id: item.id,
      productName: item.product_name,
      variantName: item.variant_name,
      sku: item.sku,
      unitPrice: Number(item.unit_price ?? 0),
      quantity: item.quantity,
      totalPrice: Number(item.total_price ?? 0),
      review: productId ? reviewsByProductId.get(productId) ?? null : null,
    };
  }

  private async getMyReviewsByProductId(userId: string, productIds: string[]) {
    const uniqueProductIds = [...new Set(productIds)];
    const reviewsByProductId = new Map<string, CustomerOrderItemReviewDto>();

    if (!uniqueProductIds.length) {
      return reviewsByProductId;
    }

    const { data, error } = await this.supabaseService.client
      .from('reviews')
      .select('id, product_id, rating, title, content, is_approved, created_at')
      .eq('user_id', userId)
      .in('product_id', uniqueProductIds);

    if (error) {
      throw error;
    }

    for (const review of (data ?? []) as unknown as ReviewRow[]) {
      reviewsByProductId.set(review.product_id, this.mapReview(review));
    }

    return reviewsByProductId;
  }

  private mapReview(review: ReviewRow): CustomerOrderItemReviewDto {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      isApproved: review.is_approved,
      createdAt: review.created_at,
    };
  }

  private getOrderItemProductId(item: OrderRow['order_items'][number]) {
    const variant = Array.isArray(item.product_variants)
      ? item.product_variants[0]
      : item.product_variants;

    return variant?.product_id ?? null;
  }

  private getReviewSourceProductId(item: OrderItemReviewSourceRow) {
    const variant = Array.isArray(item.product_variants)
      ? item.product_variants[0]
      : item.product_variants;

    return variant?.product_id ?? null;
  }

  private normalizeReviewText(value: string | undefined, maxLength: number) {
    const normalized = value?.trim();

    if (!normalized) {
      return null;
    }

    return normalized.slice(0, maxLength);
  }

  private mapCancelError(message: string) {
    if (message.includes('cancel_customer_order')) {
      return 'Cancel order database function is missing. Run migration 003_cancel_customer_order_rpc.sql in Supabase.';
    }

    if (message.includes('Only pending orders')) {
      return 'Don hang da duoc duyet hoac dang giao, khong the huy.';
    }

    return message;
  }
}
