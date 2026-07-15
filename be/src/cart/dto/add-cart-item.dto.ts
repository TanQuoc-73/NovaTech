import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'uuid-of-variant' })
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
