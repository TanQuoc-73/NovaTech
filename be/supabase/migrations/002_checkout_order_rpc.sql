-- Atomic checkout flow.
-- This function runs inside one Postgres transaction. Stock is deducted with
-- "where stock_quantity >= requested_quantity"; if any item cannot be deducted,
-- the function raises an exception and Postgres rolls back the whole order.

create or replace function public.create_order_from_cart(
  p_user_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_province text,
  p_shipping_district text,
  p_shipping_ward text,
  p_shipping_line1 text,
  p_shipping_line2 text default null,
  p_payment_method public.payment_method default 'cod',
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_item record;
  v_subtotal numeric(12, 2) := 0;
  v_deducted_stock integer;
begin
  select id into v_cart_id
  from public.carts
  where user_id = p_user_id;

  if v_cart_id is null then
    raise exception 'Cart was not found.';
  end if;

  if not exists (select 1 from public.cart_items where cart_id = v_cart_id) then
    raise exception 'Cart is empty.';
  end if;

  v_order_number := 'NT' || to_char(now(), 'YYYYMMDDHH24MISS') || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number,
    user_id,
    status,
    payment_status,
    payment_method,
    customer_email,
    customer_name,
    customer_phone,
    shipping_province,
    shipping_district,
    shipping_ward,
    shipping_line1,
    shipping_line2,
    note
  )
  values (
    v_order_number,
    p_user_id,
    'pending',
    'unpaid',
    p_payment_method,
    p_customer_email,
    p_customer_name,
    p_customer_phone,
    p_shipping_province,
    p_shipping_district,
    p_shipping_ward,
    p_shipping_line1,
    p_shipping_line2,
    p_note
  )
  returning id into v_order_id;

  for v_item in
    select
      ci.variant_id,
      ci.quantity,
      pv.sku,
      pv.name as variant_name,
      pv.price,
      p.name as product_name
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart_id
      and pv.is_active = true
      and p.is_active = true
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.variant_id
      and stock_quantity >= v_item.quantity
    returning stock_quantity into v_deducted_stock;

    if not found then
      raise exception 'Not enough stock for SKU %.', v_item.sku;
    end if;

    insert into public.order_items (
      order_id,
      variant_id,
      product_name,
      variant_name,
      sku,
      unit_price,
      quantity,
      total_price
    )
    values (
      v_order_id,
      v_item.variant_id,
      v_item.product_name,
      v_item.variant_name,
      v_item.sku,
      v_item.price,
      v_item.quantity,
      v_item.price * v_item.quantity
    );

    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  end loop;

  update public.orders
  set
    subtotal_amount = v_subtotal,
    shipping_amount = 0,
    discount_amount = 0,
    total_amount = v_subtotal
  where id = v_order_id;

  delete from public.cart_items
  where cart_id = v_cart_id;

  return v_order_id;
end;
$$;
