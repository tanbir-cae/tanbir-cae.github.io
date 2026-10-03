-- Tanbir Hasan Portfolio CMS
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('project','research','publication','certification','membership','presentation','training','award','media','other')),
  title text not null,
  slug text not null unique,
  category text,
  description text,
  technologies text[] not null default '{}',
  external_url text,
  date date,
  issuer text,
  credential_id text,
  status text,
  project_kind text,
  project_overview text,
  objectives text,
  methodology text,
  results text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid not null references auth.users(id) on delete cascade
);

create table if not exists public.content_files (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  bucket text not null check (bucket in ('portfolio-public','portfolio-private')),
  storage_path text not null,
  original_name text not null,
  mime text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  owner_id uuid not null references auth.users(id) on delete cascade
);

create index if not exists content_published_idx on public.content (published, type, created_at desc);
create index if not exists content_owner_idx on public.content (owner_id);
create index if not exists content_files_content_idx on public.content_files (content_id);

-- File presentation roles used by the portfolio archive.
alter table public.content_files add column if not exists file_role text not null default 'attachment';
alter table public.content_files add column if not exists sort_order integer not null default 0;
create index if not exists content_files_role_idx on public.content_files (content_id, file_role, sort_order);

alter table public.content enable row level security;
alter table public.content_files enable row level security;

-- Public visitors may read published content. The admin may read all of their own content only after MFA.
drop policy if exists "public read published content" on public.content;
drop policy if exists "mfa admin read own content" on public.content;
create policy "public or mfa admin read content"
on public.content for select
to anon, authenticated
using (
  published = true
  or (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin')
);

drop policy if exists "mfa owner insert content" on public.content;
create policy "mfa owner insert content"
on public.content as restrictive for insert
to authenticated
with check (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa owner update content" on public.content;
create policy "mfa owner update content"
on public.content as restrictive for update
to authenticated
using (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa owner delete content" on public.content;
create policy "mfa owner delete content"
on public.content as restrictive for delete
to authenticated
using (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Public file metadata is readable when its parent content is published; the admin may read all of their own file metadata after MFA.
drop policy if exists "public read files for published content" on public.content_files;
create policy "public or mfa admin read file metadata"
on public.content_files for select
to anon, authenticated
using (
  exists (select 1 from public.content c where c.id = content_id and c.published = true)
  or (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin')
);

drop policy if exists "mfa owner insert files" on public.content_files;
create policy "mfa owner insert files"
on public.content_files as restrictive for insert
to authenticated
with check (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa owner delete files" on public.content_files;
create policy "mfa owner delete files"
on public.content_files as restrictive for delete
to authenticated
using (owner_id = auth.uid() and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Storage buckets. Public bucket is readable by visitors, but writes are admin-only.
insert into storage.buckets (id, name, public)
values ('portfolio-public','portfolio-public',true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('portfolio-private','portfolio-private',false)
on conflict (id) do update set public = false;

-- Public bucket: anyone may read, only MFA-authenticated owner may write/delete.
drop policy if exists "public bucket read" on storage.objects;
create policy "public bucket read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-public');

drop policy if exists "mfa upload public files" on storage.objects;
create policy "mfa upload public files"
on storage.objects as restrictive for insert
to authenticated
with check (bucket_id = 'portfolio-public' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa update public files" on storage.objects;
create policy "mfa update public files"
on storage.objects as restrictive for update
to authenticated
using (bucket_id = 'portfolio-public' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check (bucket_id = 'portfolio-public' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa delete public files" on storage.objects;
create policy "mfa delete public files"
on storage.objects as restrictive for delete
to authenticated
using (bucket_id = 'portfolio-public' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Private bucket: only MFA-authenticated users may read/write/delete.
drop policy if exists "mfa read private files" on storage.objects;
create policy "mfa read private files"
on storage.objects as restrictive for select
to authenticated
using (bucket_id = 'portfolio-private' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa upload private files" on storage.objects;
create policy "mfa upload private files"
on storage.objects as restrictive for insert
to authenticated
with check (bucket_id = 'portfolio-private' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa update private files" on storage.objects;
create policy "mfa update private files"
on storage.objects as restrictive for update
to authenticated
using (bucket_id = 'portfolio-private' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check (bucket_id = 'portfolio-private' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "mfa delete private files" on storage.objects;
create policy "mfa delete private files"
on storage.objects as restrictive for delete
to authenticated
using (bucket_id = 'portfolio-private' and (select auth.jwt()->>'aal') = 'aal2' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Optional helper for the public website: convert a row to safe JSON-like fields in the browser.
-- No service-role key is ever needed in the frontend.
