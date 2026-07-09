import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../infrastructure/supabase/supabase.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
