import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import type { AddToWishlistPayload } from './wishlist.types';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(SupabaseAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: AuthenticatedUser) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post()
  async addToWishlist(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: AddToWishlistPayload,
  ) {
    await this.wishlistService.addToWishlist(user.id, payload);
    return { success: true };
  }

  @Delete(':productId')
  async removeFromWishlist(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    await this.wishlistService.removeFromWishlist(user.id, productId);
    return { success: true };
  }
}
