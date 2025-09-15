-- Create the complaints table
create table if not exists public.complaints (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone not null default now(),
  issue text not null,
  location text,
  latitude float,
  longitude float,
  status text not null default 'New'::text,
  image_url text,
  constraint complaints_pkey primary key (id)
);

-- Set up Row Level Security
alter table public.complaints enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Allow insert for authenticated users" on public.complaints;
drop policy if exists "Allow select for employees" on public.complaints;
drop policy if exists "Allow anonymous insert for complaints" on public.complaints;


-- Allow anyone (anonymous users included) to insert complaints
create policy "Allow anonymous insert for complaints" on public.complaints
  for insert
  to anon
  with check (true);

-- Allow employees (any authenticated user in this example) to view all complaints
create policy "Allow select for employees" on public.complaints
  for select
  to authenticated
  using (true);


-- Create the storage bucket for complaint images
-- NOTE: You must also create this bucket in the Supabase UI if it doesn't exist.
-- 1. Go to Storage in your Supabase project.
-- 2. Click "New bucket".
-- 3. Name it "complaint-images".
-- 4. Toggle "Public bucket" to on.
-- 5. Click "Create bucket".

-- Set up access policies for the storage bucket.
-- Allow anonymous users to upload to the 'complaint-images' bucket.
create policy "Allow anonymous uploads to complaint-images"
on storage.objects for insert to anon with check (
  bucket_id = 'complaint-images'
);

-- Allow anyone to view images in the 'complaint-images' bucket.
create policy "Allow public read access to complaint-images"
on storage.objects for select using (
  bucket_id = 'complaint-images'
);
