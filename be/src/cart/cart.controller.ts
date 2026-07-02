import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CartService } from './cart.service';
import type { AddCartItemPayload, UpdateCartItemPayload } from './cart.types';

@Controller('cart')
@UseGuards(SupabaseAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: AddCartItemPayload,
  ) {
    return this.cartService.addItem(user.id, payload);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() payload: UpdateCartItemPayload,
  ) {
    return this.cartService.updateItem(user.id, itemId, payload);
  }

  @Delete('items/:itemId')
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete('items')
  clearCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clearCart(user.id);
  }
}
