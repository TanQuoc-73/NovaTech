import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CatalogService } from './catalog.service';
import type { CatalogProductSort } from './catalog.types';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  findCategories() {
    return this.catalogService.findCategories();
  }

  @Get('brands')
  findBrands() {
    return this.catalogService.findBrands();
  }

  @Get('hero-banners')
  findHeroBanners() {
    return this.catalogService.findHeroBanners();
  }

  @Get('news')
  findNewsArticles() {
    return this.catalogService.findNewsArticles();
  }

  @Get('vouchers')
  findActiveVouchers() {
    return this.catalogService.findActiveVouchers();
  }

  @Get('vouchers/validate')
  validateVoucher(
    @Query('code') code?: string,
    @Query('subtotal') subtotal?: string,
  ) {
    return this.catalogService.validateVoucher(code, subtotal);
  }

  @Get('products/featured')
  findFeaturedProducts() {
    return this.catalogService.findFeaturedProducts();
  }

  @Get('warranty/lookup')
  lookupWarranty(@Query('q') query?: string) {
    return this.catalogService.lookupWarranty(query);
  }

  @Get('products/:slug')
  findProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.findProductBySlug(slug);
  }

  @Get('products')
  findProducts(
    @Query('q') query?: string,
    @Query('brand') brand?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: CatalogProductSort,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('featured') featured?: string,
  ) {
    return this.catalogService.findProducts({
      q: query,
      brand,
      category,
      sort,
      minPrice,
      maxPrice,
      inStock,
      featured,
    });
  }
}
