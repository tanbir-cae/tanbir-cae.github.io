-- =============================================================================
-- TANBIR HASAN — MECHANICAL DESIGN & CAE PORTFOLIO
-- Supabase PostgreSQL Schema
-- =============================================================================
-- Run this file in the Supabase SQL Editor to create all tables, enums,
-- indexes, RLS policies, and storage buckets.
--
-- Prerequisites:
--   1. A Supabase project with Auth enabled.
--   2. An admin user created via Supabase Auth (email: tanbirhasan.mail@gmail.com).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "moddatetime";     -- auto-update updated_at

-- ---------------------------------------------------------------------------
-- 1. CUSTOM ENUM TYPES
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_category AS ENUM (
    'cad', 'cfd', 'fea', 'robotics', 'computational'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'idea', 'design', 'simulation', 'prototype', 'testing', 'ongoing', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM (
    'image', 'drawing', 'video', 'animation', '3d_model',
    'solidworks_part', 'solidworks_assembly', 'solidworks_drawing',
    'step', 'iges', 'stl', 'report', 'document'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_visibility AS ENUM (
    'public_download', 'viewer_only', 'admin_only'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM (
    'exploded_animation', 'mechanism_motion', 'gear_motion',
    'linkage_motion', 'cam_motion', 'robotic_arm_motion',
    'cad_motion_study', 'cfd_transient', 'free_surface',
    'fea_deformation', 'thermal', 'manufacturing',
    'experimental', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE credential_badge_type AS ENUM (
    'certification', 'training', 'award', 'presentation', 'membership'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE research_kind AS ENUM (
    'journal_paper', 'conference_paper', 'research_project',
    'ongoing_research', 'research_interest'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE skill_group AS ENUM (
    'mechanical_design_cad', 'cae_simulation',
    'robotics_mechatronics', 'computational_engineering'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------------

-- ─── profiles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NOT NULL DEFAULT '',
  professional_title text NOT NULL DEFAULT '',
  biography       text,
  profile_image_url text,
  email           text NOT NULL DEFAULT '',
  linkedin_url    text,
  github_url      text,
  scholar_url     text,
  cv_url          text,
  role            user_role NOT NULL DEFAULT 'viewer',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── site_settings (singleton: one row) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title              text NOT NULL DEFAULT 'Md. Tanbir Hasan — Mechanical Design & CAE',
  site_description        text NOT NULL DEFAULT 'Professional portfolio of Md. Tanbir Hasan, Mechanical Design & CAE Engineer.',
  headline                text NOT NULL DEFAULT 'Design. Simulate. Analyze. Build.',
  hero_cta_primary_label  text NOT NULL DEFAULT 'Explore Engineering Work',
  hero_cta_secondary_label text NOT NULL DEFAULT 'Download CV',
  technical_strip         text[] NOT NULL DEFAULT ARRAY[
    'SolidWorks','ANSYS Fluent','ANSYS Mechanical','CAD','CFD','FEA','Mechatronics'
  ],
  contact_email           text NOT NULL DEFAULT 'tanbirhasan.mail@gmail.com',
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── projects ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  category              project_category NOT NULL,
  year                  text,
  status                project_status NOT NULL DEFAULT 'idea',
  software              text[] NOT NULL DEFAULT '{}',
  tools                 text[] NOT NULL DEFAULT '{}',
  tags                  text[] NOT NULL DEFAULT '{}',
  featured              boolean NOT NULL DEFAULT false,
  published             boolean NOT NULL DEFAULT false,
  summary               text,
  problem_statement     text,
  objective             text,
  design_specs          jsonb,
  engineering_approach   text,
  simulation_details    jsonb,
  results_summary       text,
  validation_summary    text,
  conclusion            text,
  thumbnail_url         text,
  repository_url        text,
  external_url          text,
  github_url            text,
  section_flags         jsonb NOT NULL DEFAULT '{
    "problemStatement": true,
    "designSpecs": false,
    "cadDesign": false,
    "simulationSetup": false,
    "results": false,
    "prototypeValidation": false,
    "files": false,
    "designEvolution": false
  }'::jsonb,
  order_index           integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ─── project_assets ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_assets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_type        asset_type NOT NULL,
  title             text NOT NULL DEFAULT '',
  file_url          text,
  storage_path      text,
  file_size         bigint,
  mime_type         text,
  viewer_enabled    boolean NOT NULL DEFAULT false,
  download_enabled  boolean NOT NULL DEFAULT false,
  visibility        asset_visibility NOT NULL DEFAULT 'admin_only',
  order_index       integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── research_papers ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_papers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  kind          research_kind NOT NULL DEFAULT 'research_project',
  authors       text[] NOT NULL DEFAULT '{}',
  venue         text,
  year          text,
  abstract      text,
  keywords      text[] NOT NULL DEFAULT '{}',
  doi           text,
  pdf_url       text,
  external_url  text,
  published     boolean NOT NULL DEFAULT false,
  order_index   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── credentials ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credentials (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  issuer            text,
  badge_type        credential_badge_type NOT NULL DEFAULT 'certification',
  issue_date        text,
  credential_id     text,
  verification_url  text,
  image_url         text,
  document_url      text,
  published         boolean NOT NULL DEFAULT false,
  order_index       integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── engineering_media ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineering_media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  media_type      media_type NOT NULL DEFAULT 'other',
  video_url       text,
  thumbnail_url   text,
  software_used   text,
  description     text,
  published       boolean NOT NULL DEFAULT false,
  order_index     integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── skills ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  group_name  skill_group NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

-- ─── managed_files (File Manager backing table) ─────────────────────────────
CREATE TABLE IF NOT EXISTS managed_files (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        text NOT NULL,
  storage_bucket  text NOT NULL,
  storage_path    text NOT NULL,
  mime_type       text,
  file_size       bigint,
  project_id      uuid REFERENCES projects(id) ON DELETE SET NULL,
  visibility      asset_visibility NOT NULL DEFAULT 'admin_only',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── contact_messages ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text,
  message     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. AUTO-UPDATE updated_at TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER project_assets_updated_at
  BEFORE UPDATE ON project_assets
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER research_papers_updated_at
  BEFORE UPDATE ON research_papers
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER engineering_media_updated_at
  BEFORE UPDATE ON engineering_media
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE OR REPLACE TRIGGER managed_files_updated_at
  BEFORE UPDATE ON managed_files
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- 4. INDEXES
-- ---------------------------------------------------------------------------
-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);

-- Project assets
CREATE INDEX IF NOT EXISTS idx_project_assets_project ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_type ON project_assets(asset_type);

-- Research
CREATE INDEX IF NOT EXISTS idx_research_published ON research_papers(published);
CREATE INDEX IF NOT EXISTS idx_research_kind ON research_papers(kind);

-- Credentials
CREATE INDEX IF NOT EXISTS idx_credentials_published ON credentials(published);
CREATE INDEX IF NOT EXISTS idx_credentials_badge ON credentials(badge_type);

-- Engineering media
CREATE INDEX IF NOT EXISTS idx_media_published ON engineering_media(published);

-- Managed files
CREATE INDEX IF NOT EXISTS idx_managed_files_project ON managed_files(project_id);
CREATE INDEX IF NOT EXISTS idx_managed_files_bucket ON managed_files(storage_bucket);

-- Skills
CREATE INDEX IF NOT EXISTS idx_skills_group ON skills(group_name);

-- Contact messages
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. HELPER: is_admin()
-- ---------------------------------------------------------------------------
-- Returns true when the JWT email matches the ADMIN_EMAILS app setting.
-- This requires setting an app_setting in Supabase Dashboard → Settings → API:
--   key: app.admin_emails   value: tanbirhasan.mail@gmail.com
--
-- Alternatively, check if the user's profile has role = 'admin'.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

-- ─── profiles ───────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Admins can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid() AND is_admin())
  WITH CHECK (id = auth.uid() AND is_admin());

CREATE POLICY "Admins can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ─── site_settings ──────────────────────────────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (is_admin());

-- ─── projects ───────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (is_admin());

-- ─── project_assets ─────────────────────────────────────────────────────────
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read viewable assets"
  ON project_assets FOR SELECT
  USING (
    visibility != 'admin_only'
    OR is_admin()
  );

CREATE POLICY "Admins can insert assets"
  ON project_assets FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update assets"
  ON project_assets FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete assets"
  ON project_assets FOR DELETE
  USING (is_admin());

-- ─── research_papers ────────────────────────────────────────────────────────
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published research"
  ON research_papers FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can insert research"
  ON research_papers FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update research"
  ON research_papers FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete research"
  ON research_papers FOR DELETE
  USING (is_admin());

-- ─── credentials ────────────────────────────────────────────────────────────
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published credentials"
  ON credentials FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can insert credentials"
  ON credentials FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update credentials"
  ON credentials FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete credentials"
  ON credentials FOR DELETE
  USING (is_admin());

-- ─── engineering_media ──────────────────────────────────────────────────────
ALTER TABLE engineering_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media"
  ON engineering_media FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can insert media"
  ON engineering_media FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update media"
  ON engineering_media FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete media"
  ON engineering_media FOR DELETE
  USING (is_admin());

-- ─── skills ─────────────────────────────────────────────────────────────────
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read skills"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage skills"
  ON skills FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── managed_files ──────────────────────────────────────────────────────────
ALTER TABLE managed_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all files"
  ON managed_files FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert files"
  ON managed_files FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update files"
  ON managed_files FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete files"
  ON managed_files FOR DELETE
  USING (is_admin());

-- ─── contact_messages ───────────────────────────────────────────────────────
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert a message
CREATE POLICY "Anyone can submit contact message"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "Admins can read messages"
  ON contact_messages FOR SELECT
  USING (is_admin());

-- Only admins can delete messages
CREATE POLICY "Admins can delete messages"
  ON contact_messages FOR DELETE
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- 7. STORAGE BUCKETS
-- ---------------------------------------------------------------------------
-- Create storage buckets. These are idempotent; Supabase ignores duplicates.
-- Run these in the Supabase SQL Editor or via the Dashboard → Storage.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-images', 'project-images', true, 10485760,  -- 10 MB
    ARRAY['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']),
  ('3d-models', '3d-models', false, 104857600,  -- 100 MB
    ARRAY[
      'model/gltf-binary','model/gltf+json',
      'application/octet-stream',  -- .stl, .sldprt, .sldasm, .slddrw, .step, .iges
      'application/sla',
      'application/step','application/iges',
      'model/stl'
    ]),
  ('engineering-media', 'engineering-media', true, 52428800,  -- 50 MB
    ARRAY['video/mp4','video/webm','image/png','image/jpeg','image/webp','image/gif']),
  ('documents', 'documents', false, 20971520,  -- 20 MB
    ARRAY['application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('certificates', 'certificates', true, 10485760,  -- 10 MB
    ARRAY['image/png','image/jpeg','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. STORAGE POLICIES
-- ---------------------------------------------------------------------------

-- project-images: public read, admin write
CREATE POLICY "Public read project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Admin insert project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND (SELECT is_admin()));

CREATE POLICY "Admin update project images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-images' AND (SELECT is_admin()));

CREATE POLICY "Admin delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND (SELECT is_admin()));

-- 3d-models: admin only (private bucket, signed URLs for viewer)
CREATE POLICY "Admin read 3d models"
  ON storage.objects FOR SELECT
  USING (bucket_id = '3d-models' AND (SELECT is_admin()));

CREATE POLICY "Admin insert 3d models"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = '3d-models' AND (SELECT is_admin()));

CREATE POLICY "Admin update 3d models"
  ON storage.objects FOR UPDATE
  USING (bucket_id = '3d-models' AND (SELECT is_admin()));

CREATE POLICY "Admin delete 3d models"
  ON storage.objects FOR DELETE
  USING (bucket_id = '3d-models' AND (SELECT is_admin()));

-- engineering-media: public read, admin write
CREATE POLICY "Public read engineering media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'engineering-media');

CREATE POLICY "Admin insert engineering media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'engineering-media' AND (SELECT is_admin()));

CREATE POLICY "Admin update engineering media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'engineering-media' AND (SELECT is_admin()));

CREATE POLICY "Admin delete engineering media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'engineering-media' AND (SELECT is_admin()));

-- documents: admin only
CREATE POLICY "Admin read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (SELECT is_admin()));

CREATE POLICY "Admin insert documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (SELECT is_admin()));

CREATE POLICY "Admin update documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND (SELECT is_admin()));

CREATE POLICY "Admin delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND (SELECT is_admin()));

-- certificates: public read, admin write
CREATE POLICY "Public read certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

CREATE POLICY "Admin insert certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND (SELECT is_admin()));

CREATE POLICY "Admin update certificates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'certificates' AND (SELECT is_admin()));

CREATE POLICY "Admin delete certificates"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'certificates' AND (SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- 9. SEED DATA
-- ---------------------------------------------------------------------------
-- Insert the default site_settings row (singleton). No personal content is
-- fabricated — only CMS-configurable defaults.

INSERT INTO site_settings (
  site_title,
  site_description,
  headline,
  hero_cta_primary_label,
  hero_cta_secondary_label,
  technical_strip,
  contact_email
)
VALUES (
  'Md. Tanbir Hasan — Mechanical Design & CAE',
  'Professional portfolio of Md. Tanbir Hasan, Mechanical Design & CAE Engineer. CAD, CFD, FEA, robotics, and engineering simulation.',
  'Design. Simulate. Analyze. Build.',
  'Explore Engineering Work',
  'Download CV',
  ARRAY['SolidWorks','ANSYS Fluent','ANSYS Mechanical','CAD','CFD','FEA','Mechatronics'],
  'tanbirhasan.mail@gmail.com'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. PROFILE AUTO-CREATION TRIGGER
-- ---------------------------------------------------------------------------
-- Automatically create a profile row when a new user signs up via Auth.
-- The admin must then update their profile through the CMS.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, professional_title, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    '',
    'viewer'
  );
  RETURN NEW;
END;
$$;

-- Drop if exists and recreate to be idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- DONE
-- ---------------------------------------------------------------------------
-- After running this schema:
--   1. Create an admin user in Supabase Auth Dashboard
--      (email: tanbirhasan.mail@gmail.com)
--   2. Manually set that user's profile role to 'admin':
--      UPDATE profiles SET role = 'admin'
--        WHERE email = 'tanbirhasan.mail@gmail.com';
--   3. Set ADMIN_EMAILS in .env.local to match
-- ---------------------------------------------------------------------------
