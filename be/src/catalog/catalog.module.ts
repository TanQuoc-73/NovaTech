import { Module } from '@nestjs/common';

import { SupabaseModule } from '../infrastructure/supabase/supabase.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [SupabaseModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
