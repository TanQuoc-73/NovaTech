import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  CreatePaymentRequest,
  CreatePaymentResult,
  PaymentProvider,
  PaymentQrSettingDto,
} from './payments.types';

type QueryValue = string | string[] | undefined;
type QueryRecord = Record<string, QueryValue>;

type PaymentQrSettingRow = {
  id: string;
  provider: string;
  title: string;
  qr_image_url: string;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  instructions: string | null;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async createPaymentUrl(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    await this.upsertPendingPayment(request);

    if (request.provider === 'vnpay') {
      return {
        provider: 'vnpay',
        paymentUrl: this.createVnpayPaymentUrl(request),
      };
    }

    return this.createMomoPaymentUrl(request);
  }

  async handleVnpayCallback(query: QueryRecord) {
    const isValid = this.verifyVnpaySignature(query);
    const orderNumber = this.readQueryString(query.vnp_TxnRef);
    const responseCode = this.readQueryString(query.vnp_ResponseCode);
    const transactionId = this.readQueryString(query.vnp_TransactionNo);

    if (!isValid) {
      return { success: false, message: 'Invalid VNPAY signature.' };
    }

    await this.markPaymentResult({
      orderNumber,
      provider: 'vnpay',
      success: responseCode === '00',
      transactionId,
      metadata: query,
    });

    return {
      success: responseCode === '00',
      orderNumber,
    };
  }

  async handleMomoCallback(payload: Record<string, unknown>) {
    const isValid = this.verifyMomoSignature(payload);
    const orderNumber = this.readPayloadString(payload.orderId);
    const resultCode = Number(payload.resultCode);
    const transactionId = this.readPayloadString(payload.transId);

    if (!isValid) {
      return { success: false, message: 'Invalid MoMo signature.' };
    }

    await this.markPaymentResult({
      orderNumber,
      provider: 'momo',
      success: resultCode === 0,
      transactionId,
      metadata: payload,
    });

    return {
      success: resultCode === 0,
      orderNumber,
    };
  }

  createFrontendRedirectUrl(success: boolean, orderNumber?: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const url = new URL('/cart', frontendUrl);

    url.searchParams.set('tab', 'ordered');
    url.searchParams.set('payment', success ? 'success' : 'failed');

    if (orderNumber) {
      url.searchParams.set('order', orderNumber);
    }

    return url.toString();
  }

  async getActivePaymentQrSettings(): Promise<PaymentQrSettingDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('payment_qr_settings')
      .select(
        'id, provider, title, qr_image_url, account_name, account_number, bank_name, instructions',
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return [];
      }

      throw error;
    }

    return ((data ?? []) as unknown as PaymentQrSettingRow[]).map(
      (setting) => ({
        id: setting.id,
        provider: setting.provider,
        title: setting.title,
        qrImageUrl: setting.qr_image_url,
        accountName: setting.account_name,
        accountNumber: setting.account_number,
        bankName: setting.bank_name,
        instructions: setting.instructions,
      }),
    );
  }

  private createVnpayPaymentUrl(request: CreatePaymentRequest) {
    const tmnCode = this.getRequiredConfig('VNPAY_TMN_CODE');
    const hashSecret = this.getRequiredConfig('VNPAY_HASH_SECRET');
    const paymentUrl =
      this.configService.get<string>('VNPAY_PAYMENT_URL') ??
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = this.getRequiredConfig('VNPAY_RETURN_URL');
    const now = new Date();
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(Math.round(request.amount * 100)),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: request.orderNumber,
      vnp_OrderInfo: `Thanh toan don hang ${request.orderNumber}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: request.ipAddress ?? '127.0.0.1',
      vnp_CreateDate: this.formatVnpayDate(now),
    };
    const signedParams = this.sortParams(params);
    const signData = new URLSearchParams(signedParams).toString();
    const secureHash = createHmac('sha512', hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    const url = new URL(paymentUrl);

    Object.entries(signedParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    url.searchParams.set('vnp_SecureHash', secureHash);

    return url.toString();
  }

  private async createMomoPaymentUrl(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    const partnerCode = this.getRequiredConfig('MOMO_PARTNER_CODE');
    const accessKey = this.getRequiredConfig('MOMO_ACCESS_KEY');
    const secretKey = this.getRequiredConfig('MOMO_SECRET_KEY');
    const endpoint =
      this.configService.get<string>('MOMO_ENDPOINT') ??
      'https://test-payment.momo.vn/v2/gateway/api/create';
    const redirectUrl = this.getRequiredConfig('MOMO_REDIRECT_URL');
    const ipnUrl = this.getRequiredConfig('MOMO_IPN_URL');
    const amount = String(Math.round(request.amount));
    const requestId = `${request.orderNumber}-${Date.now()}`;
    const orderId = request.orderNumber;
    const orderInfo = `Thanh toan don hang ${request.orderNumber}`;
    const extraData = '';
    const requestType = 'captureWallet';
    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');
    const signature = createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'vi',
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Cannot create MoMo payment URL.');
    }

    const body: unknown = await response.json();

    if (
      body &&
      typeof body === 'object' &&
      'payUrl' in body &&
      typeof body.payUrl === 'string'
    ) {
      return {
        provider: 'momo',
        paymentUrl: body.payUrl,
      };
    }

    throw new BadRequestException('Cannot read MoMo payment URL.');
  }

  private async upsertPendingPayment(request: CreatePaymentRequest) {
    const { error } = await this.supabaseService.client
      .from('payments')
      .insert({
        order_id: request.orderId,
        provider: request.provider,
        status: 'unpaid',
        amount: request.amount,
        metadata: {
          orderNumber: request.orderNumber,
        },
      });

    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async markPaymentResult({
    orderNumber,
    provider,
    success,
    transactionId,
    metadata,
  }: {
    orderNumber: string;
    provider: PaymentProvider;
    success: boolean;
    transactionId: string;
    metadata: unknown;
  }) {
    const { data: order, error: orderError } = await this.supabaseService.client
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (orderError) {
      throw orderError;
    }

    if (
      !order ||
      typeof order !== 'object' ||
      !('id' in order) ||
      typeof order.id !== 'string'
    ) {
      throw new BadRequestException('Order was not found.');
    }

    const paymentStatus = success ? 'paid' : 'failed';
    const { error: paymentError } = await this.supabaseService.client
      .from('payments')
      .update({
        status: paymentStatus,
        provider_transaction_id: transactionId || null,
        metadata,
      })
      .eq('order_id', order.id)
      .eq('provider', provider);

    if (paymentError) {
      throw paymentError;
    }

    const { error: orderUpdateError } = await this.supabaseService.client
      .from('orders')
      .update({
        payment_status: paymentStatus,
      })
      .eq('id', order.id);

    if (orderUpdateError) {
      throw orderUpdateError;
    }
  }

  private verifyVnpaySignature(query: QueryRecord) {
    const hashSecret = this.getRequiredConfig('VNPAY_HASH_SECRET');
    const secureHash = this.readQueryString(query.vnp_SecureHash);
    const params: Record<string, string> = {};

    Object.entries(query).forEach(([key, value]) => {
      if (key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') {
        return;
      }

      const normalized = this.readQueryString(value);

      if (normalized) {
        params[key] = normalized;
      }
    });

    const signData = new URLSearchParams(this.sortParams(params)).toString();
    const expected = createHmac('sha512', hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return secureHash.toLowerCase() === expected.toLowerCase();
  }

  private verifyMomoSignature(payload: Record<string, unknown>) {
    const secretKey = this.getRequiredConfig('MOMO_SECRET_KEY');
    const signature = this.readPayloadString(payload.signature);
    const fields = [
      'accessKey',
      'amount',
      'extraData',
      'message',
      'orderId',
      'orderInfo',
      'orderType',
      'partnerCode',
      'payType',
      'requestId',
      'responseTime',
      'resultCode',
      'transId',
    ];
    const rawSignature = fields
      .map((field) => `${field}=${this.readPayloadString(payload[field])}`)
      .join('&');
    const expected = createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return signature.toLowerCase() === expected.toLowerCase();
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured.`);
    }

    return value;
  }

  private sortParams(params: Record<string, string>) {
    return Object.keys(params)
      .sort()
      .reduce<Record<string, string>>((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
  }

  private formatVnpayDate(date: Date) {
    const pad = (value: number) => value.toString().padStart(2, '0');

    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  private readQueryString(value: QueryValue) {
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return typeof value === 'string' ? value : '';
  }

  private readPayloadString(value: unknown) {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }

    return '';
  }
}
