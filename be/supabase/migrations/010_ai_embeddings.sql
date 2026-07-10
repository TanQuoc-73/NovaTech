create extension if not exists vector with schema public;

create table public.product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  embedding vector(1536) not null,
  text text not null,
  model text not null default 'text-embedding-3-small',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, model)
);

create trigger set_product_embeddings_updated_at
before update on public.product_embeddings
for each row execute function public.set_updated_at();

create index if not exists idx_product_embeddings_product
on public.product_embeddings(product_id);

create index if not exists idx_product_embeddings_embedding
on public.product_embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

alter table public.product_embeddings enable row level security;

create policy product_embeddings_select
on public.product_embeddings for select
to public
using (true);

create or replace function public.search_product_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 12
)
returns table (
  product_id uuid,
  product_name text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    pe.product_id,
    p.name as product_name,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.product_embeddings pe
  join public.products p on p.id = pe.product_id
  where 1 - (pe.embedding <=> query_embedding) > match_threshold
    and p.is_active = true
  order by pe.embedding <=> query_embedding
  limit match_count;
end;
$$;
