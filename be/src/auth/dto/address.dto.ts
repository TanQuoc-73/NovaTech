import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiProperty({ example: 'Cầu Giấy' })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: 'Dịch Vọng' })
  @IsString()
  @IsNotEmpty()
  ward!: string;

  @ApiProperty({ example: '123 Trần Duy Hưng' })
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @ApiPropertyOptional({ example: 'Tầng 5' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isDefault!: boolean;
}
