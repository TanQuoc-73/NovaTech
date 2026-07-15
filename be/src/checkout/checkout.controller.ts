import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(SupabaseAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CheckoutDto,
  ) {
    return this.checkoutService.checkout(user, payload);
  }
}
