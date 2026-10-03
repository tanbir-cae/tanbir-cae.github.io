-- Add the fields used by the expanded engineering project editor.
alter table public.content add column if not exists project_kind text;
alter table public.content add column if not exists project_overview text;
alter table public.content add column if not exists objectives text;
alter table public.content add column if not exists methodology text;
alter table public.content add column if not exists results text;

-- Keep file roles flexible so the admin can organize CAD, CFD, FEA,
-- drawings, models, animations, reports, code, datasets and credentials.
alter table public.content_files add column if not exists file_role text not null default 'attachment';
alter table public.content_files add column if not exists sort_order integer not null default 0;
create index if not exists content_files_role_idx on public.content_files (content_id, file_role, sort_order);
