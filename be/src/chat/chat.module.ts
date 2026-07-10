import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../infrastructure/supabase/supabase.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
