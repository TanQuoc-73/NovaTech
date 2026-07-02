import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../infrastructure/supabase/supabase.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
