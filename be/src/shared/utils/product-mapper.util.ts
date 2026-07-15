import type {
  CatalogProductDto,
  CatalogProductReviewDto,
  CatalogProductVariantDto,
} from '../../catalog/catalog.types';

export type ProductRow = {
  id: string;
  name: string;
  slug?: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  categories:
    | { slug: string; name: string }
    | Array<{ slug: string; name: string }>
    | null;
  brands: { name: string } | Array<{ name: string }> | null;
  product_variants: Array<{
    id: string;
    sku: string;
    name: string;
    color: string | null;
    storage: string | null;
    ram: string | null;
    price: string | number;
    compare_at_price: string | number | null;
    stock_quantity: number;
    product_variant_images: Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      sort_order: number;
    }>;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    is_approved: boolean;
    created_at: string;
    profiles:
      | { full_name: string | null; email: string | null }
      | Array<{ full_name: string | null; email: string | null }>
      | null;
  }>;
};

export function mapProductVariants(
  variants: ProductRow['product_variants'],
): CatalogProductVariantDto[] {
  return variants
    .map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      color: item.color,
      storage: item.storage,
      ram: item.ram,
      price: Number(item.price),
      compareAtPrice: item.compare_at_price
        ? Number(item.compare_at_price)
        : undefined,
      stock: item.stock_quantity,
      images: (item.product_variant_images ?? [])
        .map((image) => ({
          id: image.id,
          imageUrl: image.image_url,
          altText: image.alt_text,
          sortOrder: image.sort_order,
        }))
        .sort((left, right) => left.sortOrder - right.sortOrder),
    }))
    .filter((item) => Number.isFinite(item.price))
    .sort((left, right) => left.price - right.price);
}

export function mapProductReviews(
  reviews: ProductRow['reviews'],
): CatalogProductReviewDto[] {
  return (reviews ?? [])
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime(),
    )
    .map((review) => {
      const profile = Array.isArray(review.profiles)
        ? review.profiles[0]
        : review.profiles;

      return {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        authorName:
          profile?.full_name?.trim() ||
          profile?.email?.split('@')[0] ||
          'Khach hang',
        createdAt: review.created_at,
      };
    });
}

export function calculateProductRating(
  reviews: ProductRow['reviews'],
): number {
  const approvedReviews = reviews ?? [];

  if (!approvedReviews.length) {
    return 5;
  }

  const total = approvedReviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );

  return Math.round((total / approvedReviews.length) * 10) / 10;
}

export function mapProducts(products: ProductRow[]): CatalogProductDto[] {
  return products.flatMap((product) => {
    const variants = mapProductVariants(product.product_variants);
    const variant = variants[0];

    if (!variant) {
      return [];
    }

    const category = Array.isArray(product.categories)
      ? product.categories[0]
      : product.categories;
    const brand = Array.isArray(product.brands)
      ? product.brands[0]
      : product.brands;
    const primaryVariantImage = variants[0]?.images[0]?.imageUrl;

    return {
      id: product.id,
      name: product.name,
      brand: brand?.name ?? 'NovaTech',
      category: category?.slug ?? 'accessory',
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      rating: calculateProductRating(product.reviews),
      stock: variant.stock,
      imageUrl: primaryVariantImage ?? product.thumbnail_url ?? '',
      badges: product.is_featured ? ['bestseller'] : ['new'],
      variants,
      reviews: mapProductReviews(product.reviews),
    };
  });
}
