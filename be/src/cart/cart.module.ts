import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../infrastructure/supabase/supabase.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
