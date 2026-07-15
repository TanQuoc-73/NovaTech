import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';

function createMockClient() {
  const self = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  return self;
}

describe('WishlistService', () => {
  let service: WishlistService;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(async () => {
    mockClient = createMockClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: SupabaseService,
          useValue: { client: mockClient },
        },
      ],
    }).compile();

    service = module.get(WishlistService);
  });

  describe('addToWishlist', () => {
    it('should throw BadRequestException for empty productId', async () => {
      await expect(
        service.addToWishlist('user-1', { productId: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockClient.maybeSingle.mockResolvedValue({ data: null, error: null });

      await expect(
        service.addToWishlist('user-1', { productId: 'p1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product is inactive', async () => {
      mockClient.maybeSingle.mockResolvedValue({
        data: { id: 'p1', is_active: false },
        error: null,
      });

      await expect(
        service.addToWishlist('user-1', { productId: 'p1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should silently succeed on unique violation (already in wishlist)', async () => {
      mockClient.maybeSingle.mockResolvedValue({
        data: { id: 'p1', is_active: true },
        error: null,
      });
      mockClient.insert.mockResolvedValue({
        data: null,
        error: { code: '23505' },
      });

      await expect(
        service.addToWishlist('user-1', { productId: 'p1' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('removeFromWishlist', () => {
    it('should throw BadRequestException for empty productId', async () => {
      await expect(
        service.removeFromWishlist('user-1', ''),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
