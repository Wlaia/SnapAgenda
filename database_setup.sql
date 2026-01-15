-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  salon_name text,
  whatsapp text,
  address text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using ( auth.uid() = id );
create policy "Users can update their own profile" on profiles for update using ( auth.uid() = id );
create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );


-- CLIENTS TABLE
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  phone text,
  email text,
  last_visit timestamp with time zone,
  image_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.clients enable row level security;
create policy "Users can view their own clients" on clients for select using ( auth.uid() = user_id );
create policy "Users can insert their own clients" on clients for insert with check ( auth.uid() = user_id );
create policy "Users can update their own clients" on clients for update using ( auth.uid() = user_id );
create policy "Users can delete their own clients" on clients for delete using ( auth.uid() = user_id );


-- PROFESSIONALS TABLE
create table public.professionals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  specialty text,
  phone text,
  email text,
  active boolean default true,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.professionals enable row level security;
create policy "Users can view their own professionals" on professionals for select using ( auth.uid() = user_id );
create policy "Users can insert their own professionals" on professionals for insert with check ( auth.uid() = user_id );
create policy "Users can update their own professionals" on professionals for update using ( auth.uid() = user_id );
create policy "Users can delete their own professionals" on professionals for delete using ( auth.uid() = user_id );


-- SERVICES TABLE
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration integer not null default 30, -- in minutes
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.services enable row level security;
create policy "Users can view their own services" on services for select using ( auth.uid() = user_id );
create policy "Users can insert their own services" on services for insert with check ( auth.uid() = user_id );
create policy "Users can update their own services" on services for update using ( auth.uid() = user_id );
create policy "Users can delete their own services" on services for delete using ( auth.uid() = user_id );


-- APPOINTMENTS TABLE
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id),
  professional_id uuid references public.professionals(id),
  service_id uuid references public.services(id),
  date timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  observation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.appointments enable row level security;
create policy "Users can view their own appointments" on appointments for select using ( auth.uid() = user_id );
create policy "Users can insert their own appointments" on appointments for insert with check ( auth.uid() = user_id );
create policy "Users can update their own appointments" on appointments for update using ( auth.uid() = user_id );
create policy "Users can delete their own appointments" on appointments for delete using ( auth.uid() = user_id );


-- FINANCIAL TRANSACTIONS TABLE
create table public.financial_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric(10,2) not null default 0,
  type text check (type in ('income', 'expense')) not null default 'income',
  status text check (status in ('paid', 'pending')) default 'pending',
  category text, 
  date date not null default CURRENT_DATE,
  appointment_id uuid references public.appointments(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.financial_transactions enable row level security;
create policy "Users can view their own transactions" on financial_transactions for select using ( auth.uid() = user_id );
create policy "Users can insert their own transactions" on financial_transactions for insert with check ( auth.uid() = user_id );
create policy "Users can update their own transactions" on financial_transactions for update using ( auth.uid() = user_id );
create policy "Users can delete their own transactions" on financial_transactions for delete using ( auth.uid() = user_id );


-- STORAGE BUCKET (Avatars)
-- Note: Creating storage buckets via SQL is unofficial but often works. 
-- Best practice is to create via Dashboard, but we can try inserting into storage.buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
  
create policy "Anyone can update an avatar."
  on storage.objects for update
  with check ( bucket_id = 'avatars' );
