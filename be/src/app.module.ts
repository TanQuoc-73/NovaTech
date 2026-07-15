import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';
import { CatalogModule } from './catalog/catalog.module';
import { CheckoutModule } from './checkout/checkout.module';
import { validateEnv } from './config/env.validation';
import { SupabaseModule } from './infrastructure/supabase/supabase.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { StaffModule } from './staff/staff.module';
import { AiModule } from './ai/ai.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
    }),
    SupabaseModule,
    AdminModule,
    AdminUsersModule,
    AuthModule,
    CartModule,
    CatalogModule,
    ChatModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
    StaffModule,
    WishlistModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
