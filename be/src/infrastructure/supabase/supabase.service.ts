import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  get client(): SupabaseClient {
    return this.supabase;
  }

  async healthCheck() {
    const { error } = await this.supabase
      .from('_supabase_health_check')
      .select('*')
      .limit(1);

    return {
      connected: !error || error.code === '42P01',
      error: error?.message,
    };
  }

  async getUser(accessToken: string) {
    return this.supabase.auth.getUser(accessToken);
  }
}
