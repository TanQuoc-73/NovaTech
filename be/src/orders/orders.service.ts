import { BadRequestException, Injectable } from '@nestjs/common';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  CustomerOrderDto,
  CustomerOrderItemDto,
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
    product_name: string;
    variant_name: string;
    sku: string;
    unit_price: string | number;
    quantity: number;
    total_price: string | number;
  }>;
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
            product_name,
            variant_name,
            sku,
            unit_price,
            quantity,
            total_price
          )
        `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as OrderRow[]).map((order) => ({
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
      items: order.order_items.map((item) => this.mapOrderItem(item)),
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

  private mapOrderItem(
    item: OrderRow['order_items'][number],
  ): CustomerOrderItemDto {
    return {
      id: item.id,
      productName: item.product_name,
      variantName: item.variant_name,
      sku: item.sku,
      unitPrice: Number(item.unit_price ?? 0),
      quantity: item.quantity,
      totalPrice: Number(item.total_price ?? 0),
    };
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
