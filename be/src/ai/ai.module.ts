import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../infrastructure/supabase/supabase.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingsService } from './embeddings.service';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [AiController],
  providers: [AiService, EmbeddingsService],
  exports: [AiService, EmbeddingsService],
})
export class AiModule {}
