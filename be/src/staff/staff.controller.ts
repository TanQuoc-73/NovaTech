import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import type {
  StaffInventoryPayload,
  StaffOrderStatusPayload,
} from './staff.types';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('dashboard')
  getDashboard() {
    return this.staffService.getDashboard();
  }

  @Get('orders')
  getOrders() {
    return this.staffService.getOrders();
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() payload: StaffOrderStatusPayload,
  ) {
    return this.staffService.updateOrderStatus(id, payload);
  }

  @Get('inventory/low-stock')
  getLowStockInventory() {
    return this.staffService.getLowStockInventory();
  }

  @Patch('inventory/:id')
  updateInventory(
    @Param('id') id: string,
    @Body() payload: StaffInventoryPayload,
  ) {
    return this.staffService.updateInventory(id, payload);
  }

  @Get('support/reviews')
  getSupportReviews() {
    return this.staffService.getSupportReviews();
  }
}
