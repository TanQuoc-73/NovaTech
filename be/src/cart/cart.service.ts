import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  AddCartItemPayload,
  CartDto,
  UpdateCartItemPayload,
} from './cart.types';

type CartRow = {
  id: string;
};

type VariantRow = {
  id: string;
  sku: string;
  name: string;
  price: string | number;
  compare_at_price: string | number | null;
  stock_quantity: number;
  is_active: boolean;
  product_variant_images: Array<{
    image_url: string;
    sort_order: number;
  }>;
  products:
    | {
        id: string;
        name: string;
        slug: string;
        thumbnail_url: string | null;
        is_active: boolean;
      }
    | Array<{
        id: string;
        name: string;
        slug: string;
        thumbnail_url: string | null;
        is_active: boolean;
      }>
    | null;
};

type CartItemRow = {
  id: string;
  quantity: number;
  product_variants:
    | (VariantRow & {
        products: VariantRow['products'];
      })
    | Array<
        VariantRow & {
          products: VariantRow['products'];
        }
      >
    | null;
};

@Injectable()
export class CartService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getCart(userId: string): Promise<CartDto> {
    const cart = await this.ensureCart(userId);

    const { data, error } = await this.supabaseService.client
      .from('cart_items')
      .select(
        `
          id,
          quantity,
          product_variants:variant_id (
            id,
            sku,
            name,
            price,
            compare_at_price,
            stock_quantity,
            is_active,
            product_variant_images (
              image_url,
              sort_order
            ),
            products:product_id (
              id,
              name,
              slug,
              thumbnail_url,
              is_active
            )
          )
        `,
      )
      .eq('cart_id', cart.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const items = ((data ?? []) as unknown as CartItemRow[]).flatMap((item) => {
      const variant = Array.isArray(item.product_variants)
        ? item.product_variants[0]
        : item.product_variants;
      const product = Array.isArray(variant?.products)
        ? variant?.products[0]
        : variant?.products;

      if (!variant || !product) {
        return [];
      }

      return [
        {
          id: item.id,
          quantity: item.quantity,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            thumbnailUrl: product.thumbnail_url,
          },
          variant: {
            id: variant.id,
            sku: variant.sku,
            name: variant.name,
            price: Number(variant.price),
            compareAtPrice: variant.compare_at_price
              ? Number(variant.compare_at_price)
              : undefined,
            stock: variant.stock_quantity,
            imageUrl:
              variant.product_variant_images.sort(
                (left, right) => left.sort_order - right.sort_order,
              )[0]?.image_url ?? product.thumbnail_url,
          },
        },
      ];
    });

    return {
      id: cart.id,
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.quantity * item.variant.price,
        0,
      ),
    };
  }

  async addItem(userId: string, payload: AddCartItemPayload): Promise<CartDto> {
    const variantId = this.readVariantId(payload.variantId);
    const quantity = this.readQuantity(payload.quantity);
    const cart = await this.ensureCart(userId);
    const variant = await this.findActiveVariant(variantId);

    if (variant.stock_quantity < quantity) {
      throw new BadRequestException('Not enough stock for this variant.');
    }

    const { data: existingItem, error: existingItemError } =
      await this.supabaseService.client
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)
        .maybeSingle();

    if (existingItemError) {
      throw existingItemError;
    }

    const currentQuantity = this.readExistingQuantity(existingItem);
    const nextQuantity = currentQuantity + quantity;

    if (variant.stock_quantity < nextQuantity) {
      throw new BadRequestException('Cart quantity exceeds available stock.');
    }

    if (this.hasExistingItemId(existingItem)) {
      const { error } = await this.supabaseService.client
        .from('cart_items')
        .update({ quantity: nextQuantity })
        .eq('id', existingItem.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await this.supabaseService.client
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          variant_id: variantId,
          quantity,
        });

      if (error) {
        throw error;
      }
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    itemId: string,
    payload: UpdateCartItemPayload,
  ): Promise<CartDto> {
    const quantity = this.readQuantity(payload.quantity);
    const cart = await this.ensureCart(userId);
    const item = await this.findOwnedCartItem(cart.id, itemId);
    const variant = await this.findActiveVariant(item.variant_id);

    if (variant.stock_quantity < quantity) {
      throw new BadRequestException('Cart quantity exceeds available stock.');
    }

    const { error } = await this.supabaseService.client
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('cart_id', cart.id);

    if (error) {
      throw error;
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<CartDto> {
    const cart = await this.ensureCart(userId);

    await this.findOwnedCartItem(cart.id, itemId);

    const { error } = await this.supabaseService.client
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cart.id);

    if (error) {
      throw error;
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartDto> {
    const cart = await this.ensureCart(userId);

    const { error } = await this.supabaseService.client
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) {
      throw error;
    }

    return this.getCart(userId);
  }

  private async ensureCart(userId: string): Promise<CartRow> {
    const { data, error } = await this.supabaseService.client
      .from('carts')
      .upsert({ user_id: userId }, { onConflict: 'user_id' })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  private async findActiveVariant(variantId: string): Promise<VariantRow> {
    const { data, error } = await this.supabaseService.client
      .from('product_variants')
      .select(
        `
          id,
          sku,
          name,
          price,
          compare_at_price,
          stock_quantity,
          is_active,
          product_variant_images (
            image_url,
            sort_order
          ),
          products:product_id (
            id,
            name,
            slug,
            thumbnail_url,
            is_active
          )
        `,
      )
      .eq('id', variantId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const variant = data as unknown as VariantRow | null;
    const product = Array.isArray(variant?.products)
      ? variant?.products[0]
      : variant?.products;

    if (!variant || !product?.is_active) {
      throw new NotFoundException('Product variant was not found.');
    }

    return variant;
  }

  private readVariantId(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('variantId is required.');
    }

    return value.trim();
  }

  private readQuantity(value: unknown) {
    if (value === undefined) {
      return 1;
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
      throw new BadRequestException('quantity must be a positive integer.');
    }

    return value;
  }

  private readExistingQuantity(value: unknown) {
    if (
      value &&
      typeof value === 'object' &&
      'quantity' in value &&
      typeof value.quantity === 'number'
    ) {
      return value.quantity;
    }

    return 0;
  }

  private hasExistingItemId(value: unknown): value is { id: string } {
    return (
      value !== null &&
      typeof value === 'object' &&
      'id' in value &&
      typeof value.id === 'string'
    );
  }

  private async findOwnedCartItem(
    cartId: string,
    itemId: string,
  ): Promise<{ id: string; variant_id: string }> {
    if (!itemId.trim()) {
      throw new BadRequestException('itemId is required.');
    }

    const { data, error } = await this.supabaseService.client
      .from('cart_items')
      .select('id, variant_id')
      .eq('id', itemId)
      .eq('cart_id', cartId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const item: unknown = data;

    if (
      item &&
      typeof item === 'object' &&
      'id' in item &&
      'variant_id' in item &&
      typeof item.id === 'string' &&
      typeof item.variant_id === 'string'
    ) {
      return {
        id: item.id,
        variant_id: item.variant_id,
      };
    }

    throw new NotFoundException('Cart item was not found.');
  }
}
