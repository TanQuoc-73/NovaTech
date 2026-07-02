import { Injectable } from '@nestjs/common';
import { SupabaseService } from './infrastructure/supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getHello(): string {
    return 'NovaTech API is running';
  }

  async getHealth() {
    const supabase = await this.supabaseService.healthCheck();

    return {
      status: 'ok',
      supabase,
      timestamp: new Date().toISOString(),
    };
  }
}
