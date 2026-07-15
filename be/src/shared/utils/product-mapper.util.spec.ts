import {
  mapProductVariants,
  mapProductReviews,
  calculateProductRating,
  mapProducts,
  type ProductRow,
} from './product-mapper.util';

function makeVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: 'v1',
    sku: 'SKU-001',
    name: 'Default',
    color: 'Black',
    storage: '256GB',
    ram: '8GB',
    price: 10000000,
    compare_at_price: null,
    stock_quantity: 10,
    product_variant_images: [],
    ...overrides,
  };
}

function makeReview(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    rating: 5,
    title: 'Good',
    content: 'Nice product',
    is_approved: true,
    created_at: '2025-01-01T00:00:00Z',
    profiles: { full_name: 'John', email: 'john@example.com' },
    ...overrides,
  };
}

function makeProductRow(overrides: Record<string, unknown> = {}): ProductRow {
  return {
    id: 'p1',
    name: 'Test Product',
    thumbnail_url: null,
    is_featured: false,
    categories: { slug: 'phone', name: 'Phone' },
    brands: { name: 'NovaTech' },
    product_variants: [makeVariant()],
    reviews: [],
    ...overrides,
  } as unknown as ProductRow;
}

describe('mapProductVariants', () => {
  it('should map variant data correctly', () => {
    const result = mapProductVariants([makeVariant() as never]);
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(10000000);
    expect(result[0].compareAtPrice).toBeUndefined();
  });

  it('should filter out variants with non-finite prices', () => {
    const result = mapProductVariants([
      makeVariant({ price: 'invalid' }) as never,
      makeVariant() as never,
    ]);
    expect(result).toHaveLength(1);
  });

  it('should sort variants by price ascending', () => {
    const result = mapProductVariants([
      makeVariant({ price: 20000000 }) as never,
      makeVariant({ price: 10000000 }) as never,
    ]);
    expect(result[0].price).toBe(10000000);
    expect(result[1].price).toBe(20000000);
  });

  it('should sort images by sortOrder', () => {
    const result = mapProductVariants([
      makeVariant({
        product_variant_images: [
          { id: 'i2', image_url: 'b.jpg', alt_text: null, sort_order: 2 },
          { id: 'i1', image_url: 'a.jpg', alt_text: null, sort_order: 1 },
        ],
      }) as never,
    ]);
    expect(result[0].images[0].imageUrl).toBe('a.jpg');
    expect(result[0].images[1].imageUrl).toBe('b.jpg');
  });

  it('should handle compare_at_price', () => {
    const result = mapProductVariants([
      makeVariant({ compare_at_price: 15000000 }) as never,
    ]);
    expect(result[0].compareAtPrice).toBe(15000000);
  });
});

describe('mapProductReviews', () => {
  it('should return empty array for no reviews', () => {
    expect(mapProductReviews([])).toEqual([]);
  });

  it('should sort reviews by created_at descending', () => {
    const r1 = makeReview({ id: 'r1', created_at: '2025-01-01T00:00:00Z' });
    const r2 = makeReview({ id: 'r2', created_at: '2025-06-01T00:00:00Z' });
    const result = mapProductReviews([r1 as never, r2 as never]);
    expect(result[0].id).toBe('r2');
    expect(result[1].id).toBe('r1');
  });

  it('should extract author name from profile', () => {
    const result = mapProductReviews([makeReview() as never]);
    expect(result[0].authorName).toBe('John');
  });

  it('should fallback to email prefix when full_name is null', () => {
    const result = mapProductReviews([
      makeReview({ profiles: { full_name: null, email: 'jane@example.com' } }) as never,
    ]);
    expect(result[0].authorName).toBe('jane');
  });

  it('should fallback to "Khach hang" when profile is null', () => {
    const result = mapProductReviews([
      makeReview({ profiles: null }) as never,
    ]);
    expect(result[0].authorName).toBe('Khach hang');
  });
});

describe('calculateProductRating', () => {
  it('should return 5 when no reviews', () => {
    expect(calculateProductRating([])).toBe(5);
  });

  it('should calculate average rating rounded to 1 decimal', () => {
    const reviews = [
      makeReview({ rating: 4 }) as never,
      makeReview({ rating: 5 }) as never,
    ];
    expect(calculateProductRating(reviews)).toBe(4.5);
  });
});

describe('mapProducts', () => {
  it('should skip products with no variants', () => {
    const result = mapProducts([
      makeProductRow({ product_variants: [] }),
    ]);
    expect(result).toEqual([]);
  });

  it('should map a full product', () => {
    const result = mapProducts([makeProductRow()]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test Product');
    expect(result[0].brand).toBe('NovaTech');
    expect(result[0].category).toBe('phone');
  });

  it('should default brand to NovaTech when null', () => {
    const result = mapProducts([
      makeProductRow({ brands: null }),
    ]);
    expect(result[0].brand).toBe('NovaTech');
  });

  it('should default category to accessory when null', () => {
    const result = mapProducts([
      makeProductRow({ categories: null }),
    ]);
    expect(result[0].category).toBe('accessory');
  });
});
