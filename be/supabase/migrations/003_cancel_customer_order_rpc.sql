-- Customer order cancellation.
-- Only pending orders can be cancelled by the owning user. Stock is restored in
-- the same transaction, so the order status and inventory cannot drift apart.

create or replace function public.cancel_customer_order(
  p_user_id uuid,
  p_order_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.order_status;
  v_item record;
begin
  select status into v_status
  from public.orders
  where id = p_order_id
    and user_id = p_user_id
  for update;

  if v_status is null then
    raise exception 'Order was not found.';
  end if;

  if v_status <> 'pending' then
    raise exception 'Only pending orders can be cancelled.';
  end if;

  for v_item in
    select variant_id, quantity
    from public.order_items
    where order_id = p_order_id
      and variant_id is not null
  loop
    update public.product_variants
    set stock_quantity = stock_quantity + v_item.quantity
    where id = v_item.variant_id;
  end loop;

  update public.orders
  set status = 'cancelled'
  where id = p_order_id
    and user_id = p_user_id;
end;
$$;

revoke execute on function public.cancel_customer_order(uuid, uuid) from anon;
revoke execute on function public.cancel_customer_order(uuid, uuid) from authenticated;
grant execute on function public.cancel_customer_order(uuid, uuid) to service_role;
