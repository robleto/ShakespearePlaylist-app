-- Enable Row Level Security
alter table if exists public.users enable row level security;
alter table if exists public.api_keys enable row level security;
alter table if exists public.api_usage enable row level security;

-- Users table for API key management
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  company text,
  use_case text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API Keys table
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  key_hash text unique not null,
  key_preview text not null, -- First 8 characters for display
  tier text default 'free' check (tier in ('free', 'professional', 'enterprise')),
  requests_remaining integer default 1000,
  requests_total integer default 0,
  daily_limit integer default 1000,
  monthly_limit integer default null,
  last_request_at timestamp with time zone,
  last_reset_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API Usage tracking
create table if not exists public.api_usage (
  id uuid default gen_random_uuid() primary key,
  api_key text not null,
  endpoint text not null,
  parameters jsonb,
  response_time_ms integer,
  status_code integer default 200,
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_api_keys_key_hash on public.api_keys(key_hash);
create index if not exists idx_api_keys_user_id on public.api_keys(user_id);
create index if not exists idx_api_usage_api_key on public.api_usage(api_key);
create index if not exists idx_api_usage_timestamp on public.api_usage(timestamp);
create index if not exists idx_users_email on public.users(email);

-- Row Level Security Policies

-- Users can only see their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid()::text = id::text);

create policy "Users can update own profile" on public.users
  for update using (auth.uid()::text = id::text);

-- API Keys policies
create policy "Users can view own API keys" on public.api_keys
  for select using (auth.uid()::text = user_id::text);

create policy "Users can update own API keys" on public.api_keys
  for update using (auth.uid()::text = user_id::text);

-- API Usage is viewable by key owners
create policy "Users can view own API usage" on public.api_usage
  for select using (
    api_key in (
      select key_hash from public.api_keys 
      where user_id = auth.uid()
    )
  );

-- Functions for API key management

-- Function to generate API key
create or replace function generate_api_key(user_email text, user_name text default null, user_company text default null, user_use_case text default null, user_description text default null)
returns json
language plpgsql
security definer
as $$
declare
  new_user_id uuid;
  new_key text;
  key_hash text;
  key_preview text;
begin
  -- Generate API key (gaa_ prefix + 32 random chars)
  new_key := 'gaa_' || encode(gen_random_bytes(24), 'base64');
  new_key := replace(replace(new_key, '+', ''), '/', '');
  new_key := substr(new_key, 1, 36);
  
  key_hash := encode(digest(new_key, 'sha256'), 'hex');
  key_preview := substr(new_key, 1, 8) || '...';

  -- Insert or get user
  insert into public.users (email, name, company, use_case, description)
  values (user_email, user_name, user_company, user_use_case, user_description)
  on conflict (email) 
  do update set 
    name = coalesce(excluded.name, users.name),
    company = coalesce(excluded.company, users.company),
    use_case = coalesce(excluded.use_case, users.use_case),
    description = coalesce(excluded.description, users.description),
    updated_at = now()
  returning id into new_user_id;

  -- Insert API key
  insert into public.api_keys (user_id, key_hash, key_preview)
  values (new_user_id, key_hash, key_preview);

  return json_build_object(
    'success', true,
    'api_key', new_key,
    'preview', key_preview,
    'tier', 'free',
    'daily_limit', 1000
  );
exception
  when others then
    return json_build_object(
      'success', false,
      'error', SQLERRM
    );
end;
$$;

-- Function to validate and track API key usage
create or replace function validate_api_key(key_to_check text)
returns json
language plpgsql
security definer
as $$
declare
  key_hash text;
  key_record record;
  current_date date;
begin
  -- Hash the provided key
  key_hash := encode(digest(key_to_check, 'sha256'), 'hex');
  current_date := current_date;

  -- Get key record
  select * into key_record
  from public.api_keys
  where key_hash = validate_api_key.key_hash
  and is_active = true;

  if not found then
    return json_build_object(
      'valid', false,
      'error', 'Invalid API key'
    );
  end if;

  -- Check if we need to reset daily limits
  if date(key_record.last_reset_at) < current_date then
    update public.api_keys
    set 
      requests_remaining = daily_limit,
      last_reset_at = now()
    where id = key_record.id;
    
    key_record.requests_remaining := key_record.daily_limit;
  end if;

  -- Check rate limits
  if key_record.requests_remaining <= 0 then
    return json_build_object(
      'valid', false,
      'error', 'Rate limit exceeded'
    );
  end if;

  -- Decrement usage
  update public.api_keys
  set 
    requests_remaining = requests_remaining - 1,
    requests_total = requests_total + 1,
    last_request_at = now()
  where id = key_record.id;

  return json_build_object(
    'valid', true,
    'tier', key_record.tier,
    'requests_remaining', key_record.requests_remaining - 1,
    'daily_limit', key_record.daily_limit
  );
end;
$$;
