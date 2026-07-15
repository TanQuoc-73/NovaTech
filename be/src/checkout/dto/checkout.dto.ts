import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  shippingProvince!: string;

  @ApiProperty({ example: 'Cầu Giấy' })
  @IsString()
  @IsNotEmpty()
  shippingDistrict!: string;

  @ApiProperty({ example: 'Dịch Vọng' })
  @IsString()
  @IsNotEmpty()
  shippingWard!: string;

  @ApiProperty({ example: '123 Trần Duy Hưng' })
  @IsString()
  @IsNotEmpty()
  shippingLine1!: string;

  @ApiPropertyOptional({ example: 'Tầng 5' })
  @IsOptional()
  @IsString()
  shippingLine2?: string;

  @ApiPropertyOptional({ example: 'cod', enum: ['cod', 'bank_transfer', 'vnpay', 'momo'] })
  @IsOptional()
  @IsIn(['cod', 'bank_transfer', 'vnpay', 'momo'])
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiPropertyOptional({ example: 'Giao giờ hành chính' })
  @IsOptional()
  @IsString()
  note?: string;
}
