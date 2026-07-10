-- Chat system for realtime communication between customers and staff.

create type public.chat_conversation_status as enum ('open', 'closed');

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  staff_id uuid references public.profiles(id) on delete set null,
  subject text,
  status public.chat_conversation_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create trigger set_chat_conversations_updated_at
before update on public.chat_conversations
for each row execute function public.set_updated_at();

create index if not exists idx_chat_conversations_customer
on public.chat_conversations(customer_id, status);

create index if not exists idx_chat_conversations_staff
on public.chat_conversations(staff_id, status);

create index if not exists idx_chat_messages_conversation
on public.chat_messages(conversation_id, created_at asc);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Customers can view only their own conversations
create policy chat_conversations_customer_select
on public.chat_conversations for select
to authenticated
using (
  auth.uid() = customer_id
  or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
);

-- Staff/admin can view all conversations
-- (handled by the select policy above)

-- Customers can create conversations
create policy chat_conversations_customer_insert
on public.chat_conversations for insert
to authenticated
with check (
  auth.uid() = customer_id
  and status = 'open'
);

-- Staff/admin can update conversations (assign, close)
create policy chat_conversations_staff_update
on public.chat_conversations for update
to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
);

-- Messages: participants can read
create policy chat_messages_select
on public.chat_messages for select
to authenticated
using (
  exists (
    select 1 from public.chat_conversations
    where id = conversation_id
    and (
      customer_id = auth.uid()
      or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
    )
  )
);

-- Participants can insert messages
create policy chat_messages_insert
on public.chat_messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.chat_conversations
    where id = conversation_id
    and (
      customer_id = auth.uid()
      or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff'))
    )
  )
);

-- Enable realtime for chat messages
alter publication supabase_realtime add table public.chat_messages;
