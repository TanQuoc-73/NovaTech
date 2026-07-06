import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { OrdersService } from './orders.service';
import type { CreateOrderItemReviewPayload } from './orders.types';

@Controller('orders')
@UseGuards(SupabaseAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Patch('me/:id/cancel')
  cancelMyOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancelMyOrder(user.id, id);
  }

  @Post('me/items/:itemId/review')
  reviewOrderItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() payload: CreateOrderItemReviewPayload,
  ) {
    return this.ordersService.reviewOrderItem(user.id, itemId, payload);
  }
}
