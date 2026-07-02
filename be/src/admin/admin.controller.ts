import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AdminService } from './admin.service';
import type {
  AdminBrandPayload,
  AdminCategoryPayload,
  AdminPaymentQrSettingPayload,
  AdminProductPayload,
  AdminProductVariantImagePayload,
  AdminProductVariantPayload,
} from './admin.types';

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('uploads/product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadProductImage(@UploadedFile() file: UploadedImageFile | undefined) {
    return this.adminService.uploadProductImage(file);
  }

  @Post('uploads/payment-qr')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadPaymentQrImage(@UploadedFile() file: UploadedImageFile | undefined) {
    return this.adminService.uploadPaymentQrImage(file);
  }

  @Post('payment-qr-settings')
  createPaymentQrSetting(@Body() payload: AdminPaymentQrSettingPayload) {
    return this.adminService.createPaymentQrSetting(payload);
  }

  @Patch('payment-qr-settings/:id')
  updatePaymentQrSetting(
    @Param('id') id: string,
    @Body() payload: AdminPaymentQrSettingPayload,
  ) {
    return this.adminService.updatePaymentQrSetting(id, payload);
  }

  @Delete('payment-qr-settings/:id')
  deletePaymentQrSetting(@Param('id') id: string) {
    return this.adminService.deletePaymentQrSetting(id);
  }

  @Post('categories')
  createCategory(@Body() payload: AdminCategoryPayload) {
    return this.adminService.createCategory(payload);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() payload: AdminCategoryPayload,
  ) {
    return this.adminService.updateCategory(id, payload);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Post('brands')
  createBrand(@Body() payload: AdminBrandPayload) {
    return this.adminService.createBrand(payload);
  }

  @Patch('brands/:id')
  updateBrand(@Param('id') id: string, @Body() payload: AdminBrandPayload) {
    return this.adminService.updateBrand(id, payload);
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.adminService.deleteBrand(id);
  }

  @Post('products')
  createProduct(@Body() payload: AdminProductPayload) {
    return this.adminService.createProduct(payload);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() payload: AdminProductPayload) {
    return this.adminService.updateProduct(id, payload);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Post('products/:id/variants')
  createProductVariant(
    @Param('id') id: string,
    @Body() payload: AdminProductVariantPayload,
  ) {
    return this.adminService.createProductVariant(id, payload);
  }

  @Patch('products/:id/variants/:variantId')
  updateProductVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() payload: AdminProductVariantPayload,
  ) {
    return this.adminService.updateProductVariant(id, variantId, payload);
  }

  @Delete('products/:id/variants/:variantId')
  deleteProductVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.adminService.deleteProductVariant(id, variantId);
  }

  @Post('products/:id/variants/:variantId/images')
  createProductVariantImage(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() payload: AdminProductVariantImagePayload,
  ) {
    return this.adminService.createProductVariantImage(id, variantId, payload);
  }

  @Patch('products/:id/variants/:variantId/images/:imageId')
  updateProductVariantImage(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
    @Body() payload: AdminProductVariantImagePayload,
  ) {
    return this.adminService.updateProductVariantImage(
      id,
      variantId,
      imageId,
      payload,
    );
  }

  @Delete('products/:id/variants/:variantId/images/:imageId')
  deleteProductVariantImage(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.adminService.deleteProductVariantImage(id, variantId, imageId);
  }
}
