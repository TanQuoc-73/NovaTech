import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';

function createMockClient() {
  const self = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'cart-1' }, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  return self;
}

describe('CartService', () => {
  let service: CartService;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(async () => {
    mockClient = createMockClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: SupabaseService,
          useValue: { client: mockClient },
        },
      ],
    }).compile();

    service = module.get(CartService);
  });

  describe('private readQuantity', () => {
    it('should throw for non-integer quantity', async () => {
      // addItem calls readQuantity internally
      mockClient.maybeSingle.mockResolvedValue({ data: null, error: null });

      await expect(
        service.addItem('user-1', {
          variantId: 'v1',
          quantity: 1.5 as unknown as number,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('private readVariantId', () => {
    it('should throw for empty variantId', async () => {
      await expect(
        service.addItem('user-1', {
          variantId: '  ',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
