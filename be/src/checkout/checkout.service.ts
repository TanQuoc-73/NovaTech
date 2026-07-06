import { BadRequestException, Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import { MailService } from '../mail/mail.service';
import { PaymentsService } from '../payments/payments.service';
import type { CheckoutPayload, CheckoutResultDto } from './checkout.types';

type OrderSummaryRow = {
  id: string;
  order_number: string;
  subtotal_amount: string | number;
  shipping_amount: string | number;
  total_amount: string | number;
};

type VoucherRow = {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string | number;
  min_order_amount: string | number;
  max_discount_amount: string | number | null;
  usage_limit: number | null;
  used_count: number;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async checkout(
    user: AuthenticatedUser,
    payload: CheckoutPayload,
  ): Promise<CheckoutResultDto> {
    const paymentMethod = this.readPaymentMethod(payload.paymentMethod);
    const checkoutResponse = await this.supabaseService.client.rpc(
      'create_order_from_cart',
      {
        p_user_id: user.id,
        p_customer_email: user.email ?? '',
        p_customer_name: this.readRequiredString(
          payload.customerName,
          'customerName',
        ),
        p_customer_phone: this.readRequiredString(
          payload.customerPhone,
          'customerPhone',
        ),
        p_shipping_province: this.readRequiredString(
          payload.shippingProvince,
          'shippingProvince',
        ),
        p_shipping_district: this.readRequiredString(
          payload.shippingDistrict,
          'shippingDistrict',
        ),
        p_shipping_ward: this.readRequiredString(
          payload.shippingWard,
          'shippingWard',
        ),
        p_shipping_line1: this.readRequiredString(
          payload.shippingLine1,
          'shippingLine1',
        ),
        p_shipping_line2: this.readOptionalString(payload.shippingLine2),
        p_payment_method: paymentMethod,
        p_note: this.readOptionalString(payload.note),
      },
    );

    if (checkoutResponse.error) {
      throw new BadRequestException(
        this.mapCheckoutError(checkoutResponse.error),
      );
    }

    const orderId: unknown = checkoutResponse.data;

    if (typeof orderId !== 'string') {
      throw new BadRequestException('Cannot create order.');
    }

    const orderResponse = await this.supabaseService.client
      .from('orders')
      .select('id, order_number, subtotal_amount, shipping_amount, total_amount')
      .eq('id', orderId)
      .single();

    if (orderResponse.error) {
      throw new BadRequestException(orderResponse.error.message);
    }

    let summary = this.readOrderSummary(orderResponse.data);
    const voucherCode = this.readOptionalString(payload.voucherCode);

    if (voucherCode) {
      summary = await this.applyVoucher(orderId, voucherCode, summary);
    }

    const result: CheckoutResultDto = {
      orderId: summary.id,
      orderNumber: summary.order_number,
      totalAmount: Number(summary.total_amount ?? 0),
    };

    if (paymentMethod === 'vnpay') {
      const payment = await this.paymentsService.createPaymentUrl({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        amount: result.totalAmount,
        provider: paymentMethod,
      });

      result.paymentUrl = payment.paymentUrl;
      result.paymentProvider = payment.provider;
    }

    // MoMo real gateway is temporarily disabled. While testing without a
    // merchant account, MoMo orders stay in the normal checkout flow and the
    // frontend shows the QR image configured from the admin payment page.
    // To enable real MoMo again, include `paymentMethod === 'momo'` in the
    // provider redirect block above.

    if (user.email) {
      await this.mailService.sendOrderConfirmation({
        to: user.email,
        customerName: this.readRequiredString(
          payload.customerName,
          'customerName',
        ),
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
      });
    }

    return result;
  }

  private readRequiredString(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${field} is required.`);
    }

    return value.trim();
  }

  private readOptionalString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private readPaymentMethod(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return 'cod';
    }

    if (
      value === 'cod' ||
      value === 'bank_transfer' ||
      value === 'vnpay' ||
      value === 'momo'
    ) {
      return value;
    }

    throw new BadRequestException('Unsupported payment method.');
  }

  private readOrderSummary(value: unknown): OrderSummaryRow {
    if (
      value &&
      typeof value === 'object' &&
      'id' in value &&
      'order_number' in value &&
      'subtotal_amount' in value &&
      'shipping_amount' in value &&
      'total_amount' in value &&
      typeof value.id === 'string' &&
      typeof value.order_number === 'string' &&
      (typeof value.subtotal_amount === 'string' ||
        typeof value.subtotal_amount === 'number') &&
      (typeof value.shipping_amount === 'string' ||
        typeof value.shipping_amount === 'number') &&
      (typeof value.total_amount === 'string' ||
        typeof value.total_amount === 'number')
    ) {
      return {
        id: value.id,
        order_number: value.order_number,
        total_amount: value.total_amount,
        subtotal_amount: value.subtotal_amount,
        shipping_amount: value.shipping_amount,
      };
    }

    throw new BadRequestException('Cannot read order summary.');
  }

  private async applyVoucher(
    orderId: string,
    voucherCode: string,
    summary: OrderSummaryRow,
  ) {
    const voucher = await this.findVoucher(voucherCode);

    if (!voucher) {
      throw new BadRequestException('Voucher khong hop le hoac da het han.');
    }

    const subtotal = Number(summary.subtotal_amount ?? 0);
    const shipping = Number(summary.shipping_amount ?? 0);
    const discountAmount = this.calculateVoucherDiscount(voucher, subtotal);

    if (discountAmount <= 0) {
      throw new BadRequestException('Don hang chua du dieu kien ap dung voucher.');
    }

    const nextTotal = Math.max(0, subtotal + shipping - discountAmount);
    const orderResponse = await this.supabaseService.client
      .from('orders')
      .update({
        discount_amount: discountAmount,
        total_amount: nextTotal,
      })
      .eq('id', orderId)
      .select('id, order_number, subtotal_amount, shipping_amount, total_amount')
      .single();

    if (orderResponse.error) {
      throw new BadRequestException(orderResponse.error.message);
    }

    await this.supabaseService.client
      .from('vouchers')
      .update({ used_count: voucher.used_count + 1 })
      .eq('id', voucher.id);

    return this.readOrderSummary(orderResponse.data);
  }

  private async findVoucher(code: string) {
    const { data, error } = await this.supabaseService.client
      .from('vouchers')
      .select(
        'id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count',
      )
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .or('starts_at.is.null,starts_at.lte.now()')
      .or('ends_at.is.null,ends_at.gte.now()')
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    const voucher = data as unknown as VoucherRow | null;

    if (
      !voucher ||
      (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit)
    ) {
      return null;
    }

    return voucher;
  }

  private calculateVoucherDiscount(voucher: VoucherRow, subtotal: number) {
    if (subtotal < Number(voucher.min_order_amount)) {
      return 0;
    }

    const rawDiscount =
      voucher.discount_type === 'percent'
        ? Math.floor((subtotal * Number(voucher.discount_value)) / 100)
        : Number(voucher.discount_value);

    return Math.max(
      0,
      Math.min(
        subtotal,
        voucher.max_discount_amount === null
          ? rawDiscount
          : Math.min(rawDiscount, Number(voucher.max_discount_amount)),
      ),
    );
  }

  private mapCheckoutError(error: { code?: string; message?: string }) {
    const message = error.message ?? 'Cannot create order.';

    if (
      error.code === 'PGRST202' ||
      message.includes('create_order_from_cart')
    ) {
      return 'Checkout database function is missing. Run migration 002_checkout_order_rpc.sql in Supabase.';
    }

    if (message.includes('Not enough stock')) {
      return 'San pham trong gio hang vua het hang hoac khong du so luong.';
    }

    if (message.includes('Cart is empty')) {
      return 'Gio hang dang trong.';
    }

    return message;
  }
}
