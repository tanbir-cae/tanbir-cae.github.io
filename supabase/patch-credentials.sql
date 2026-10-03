-- Credential type compatibility patch
-- Run this once in Supabase SQL Editor if your existing content table was created
-- with the older type constraint. It allows dedicated Membership, Presentation,
-- and Training records in addition to the original credential types.

alter table public.content drop constraint if exists content_type_check;

alter table public.content add constraint content_type_check
check (type in ('project','research','publication','certification','award','media','membership','presentation','training','other'));

-- Replace the old content type constraint so the public archive can keep
-- memberships, presentations and training as their own first-class types.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.content'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%type%project%research%';

  if constraint_name is not null then
    execute format('alter table public.content drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.content
  add constraint content_type_check
  check (type in ('project','research','publication','certification','membership','presentation','training','award','media','other'));
