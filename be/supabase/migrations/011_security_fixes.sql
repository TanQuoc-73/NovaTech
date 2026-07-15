-- Atomic voucher increment to prevent race condition
-- Returns true if voucher was successfully incremented (still has usage left), false otherwise
CREATE OR REPLACE FUNCTION public.increment_voucher_used_count(p_voucher_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_rows integer;
BEGIN
  UPDATE vouchers
  SET used_count = used_count + 1
  WHERE id = p_voucher_id
    AND is_active = true
    AND (usage_limit IS NULL OR used_count < usage_limit);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

-- Fix review self-approval: new reviews should default to is_approved = false
-- (migration 007 had is_approved = true in INSERT policy WITH CHECK, allowing self-approval)
DROP POLICY IF EXISTS "Customers can insert own reviews" ON reviews;
CREATE POLICY "Customers can insert own reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_approved = false
    AND EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
        AND o.status = 'delivered'
        AND oi.product_id = reviews.product_id
    )
  );

-- Missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction_id ON payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON orders(user_id, status);
