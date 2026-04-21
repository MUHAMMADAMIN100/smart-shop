import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductVariantDto {
  @IsOptional() @IsString() id?: string;
  @IsString() color!: string;
  @IsOptional() @IsString() colorHex?: string;
  @IsInt() @Min(1) storageGb!: number;
  @IsInt() @Min(1) ramGb!: number;
  @IsInt() @Min(0) price!: number;
  @IsInt() @Min(0) stock!: number;
  @IsString() sku!: string;
}

export class ProductImageDto {
  @IsOptional() @IsString() id?: string;
  @IsString() url!: string;
  @IsOptional() @IsString() alt?: string;
  @IsOptional() @IsInt() order?: number;
}

export class ProductUpsertDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsString() description!: string;
  @IsString() brandId!: string;
  @IsString() categoryId!: string;
  @IsInt() @Min(0) basePrice!: number;
  @IsOptional() @IsInt() @Min(0) @Max(90) discount?: number;
  @IsOptional() @IsInt() releaseYear?: number;

  @IsOptional() @IsNumber() screenSize?: number;
  @IsOptional() @IsString() screenType?: string;
  @IsOptional() @IsString() resolution?: string;
  @IsOptional() @IsInt() refreshRate?: number;
  @IsOptional() @IsString() processor?: string;
  @IsOptional() @IsInt() batteryMah?: number;
  @IsOptional() @IsString() camerasMp?: string;
  @IsOptional() @IsString() os?: string;
  @IsOptional() @IsInt() weight?: number;
  @IsOptional() @IsString() waterproof?: string;

  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images!: ProductImageDto[];
}

export class ProductListQuery {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() brand?: string; // slug
  @IsOptional() @IsString() category?: string; // slug
  @IsOptional() @Type(() => Number) @IsInt() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() maxPrice?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @Type(() => Number) @IsInt() storageGb?: number;
  @IsOptional() @Type(() => Number) @IsInt() ramGb?: number;
  @IsOptional() @IsString() sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(60) pageSize?: number;
  @IsOptional() @IsString() featured?: 'true' | 'false';
}
