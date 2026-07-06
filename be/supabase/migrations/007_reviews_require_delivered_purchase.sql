-- Restrict customer reviews to products from delivered orders.
-- Backend also checks this rule, but keeping it in RLS prevents direct client
-- inserts from reviewing products the user has not received.

drop policy if exists "Users can create own reviews" on public.reviews;
drop policy if exists "Users can update own unapproved reviews" on public.reviews;

create policy "Users can create reviews for delivered purchases"
on public.reviews for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.product_variants pv on pv.id = oi.variant_id
    where o.user_id = auth.uid()
      and o.status = 'delivered'
      and pv.product_id = reviews.product_id
  )
);

create policy "Users can update own unapproved delivered purchase reviews"
on public.reviews for update
using (
  user_id = auth.uid()
  and is_approved = false
  and exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.product_variants pv on pv.id = oi.variant_id
    where o.user_id = auth.uid()
      and o.status = 'delivered'
      and pv.product_id = reviews.product_id
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.product_variants pv on pv.id = oi.variant_id
    where o.user_id = auth.uid()
      and o.status = 'delivered'
      and pv.product_id = reviews.product_id
  )
);
