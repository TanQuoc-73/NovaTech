import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('qr-settings')
  getPaymentQrSettings() {
    return this.paymentsService.getActivePaymentQrSettings();
  }

  @Get('vnpay/return')
  @Redirect()
  async handleVnpayReturn(@Query() query: Record<string, string | string[]>) {
    const result = await this.paymentsService.handleVnpayCallback(query);

    return {
      url: this.paymentsService.createFrontendRedirectUrl(
        result.success,
        result.orderNumber,
      ),
    };
  }

  @Get('vnpay/ipn')
  async handleVnpayIpn(@Query() query: Record<string, string | string[]>) {
    const result = await this.paymentsService.handleVnpayCallback(query);

    return {
      RspCode: result.success ? '00' : '97',
      Message: result.success ? 'Confirm Success' : 'Confirm Failed',
    };
  }

  @Post('momo/ipn')
  async handleMomoIpn(@Body() payload: Record<string, unknown>) {
    const result = await this.paymentsService.handleMomoCallback(payload);

    return {
      resultCode: result.success ? 0 : 1,
      message: result.success ? 'Confirm Success' : 'Confirm Failed',
    };
  }

  @Get('momo/return')
  @Redirect()
  async handleMomoReturn(@Query() query: Record<string, string | string[]>) {
    const payload = Object.fromEntries(
      Object.entries(query).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ]),
    );
    const result = await this.paymentsService.handleMomoCallback(payload);

    return {
      url: this.paymentsService.createFrontendRedirectUrl(
        result.success,
        result.orderNumber,
      ),
    };
  }
}
