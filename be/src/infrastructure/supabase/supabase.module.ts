import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from './supabase.constants';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL');
        const serviceRoleKey = configService.getOrThrow<string>(
          'SUPABASE_SERVICE_ROLE_KEY',
        );

        return createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
    },
    SupabaseService,
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {}
