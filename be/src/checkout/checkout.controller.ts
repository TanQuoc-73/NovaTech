import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CheckoutService } from './checkout.service';
import type { CheckoutPayload } from './checkout.types';

@Controller('checkout')
@UseGuards(SupabaseAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CheckoutPayload,
  ) {
    return this.checkoutService.checkout(user, payload);
  }
}
