# Supabase Database Setup

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable the **moddatetime** extension: Go to Database → Extensions → search "moddatetime" → enable it

## Setup Steps

### 1. Run the Schema

Open the **SQL Editor** in Supabase Dashboard and paste the contents of [`schema.sql`](./schema.sql). Execute it.

This creates:
- All custom enum types
- All tables (profiles, site_settings, projects, project_assets, research_papers, credentials, engineering_media, skills, managed_files, contact_messages)
- `updated_at` auto-triggers
- Indexes for performance
- `is_admin()` helper function
- Row Level Security policies for every table
- Storage buckets (project-images, 3d-models, engineering-media, documents, certificates)
- Storage policies
- Default site_settings row
- Profile auto-creation trigger

### 2. Seed Skills

Run [`seed.sql`](./seed.sql) to populate the skills table with the core competency groups.

### 3. Create Admin User

1. Go to **Authentication → Users → Add user**
2. Email: `tanbirhasan.mail@gmail.com`
3. Set a password
4. After the user is created, run this in the SQL Editor:

```sql
UPDATE profiles
SET role = 'admin',
    full_name = 'Md. Tanbir Hasan',
    professional_title = 'Mechanical Design & CAE Engineer'
WHERE email = 'tanbirhasan.mail@gmail.com';
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAILS=tanbirhasan.mail@gmail.com
```

## Storage Buckets

| Bucket | Public | Max Size | Content |
|---|---|---|---|
| `project-images` | ✓ | 10 MB | Project thumbnails, renders, screenshots |
| `3d-models` | ✗ | 100 MB | GLB, GLTF, STL, SolidWorks source files |
| `engineering-media` | ✓ | 50 MB | Videos, animations, engineering visuals |
| `documents` | ✗ | 20 MB | PDFs, reports, technical documents |
| `certificates` | ✓ | 10 MB | Certificate images and PDFs |

Private buckets use signed URLs for authorized access.

## RLS Summary

| Table | Public SELECT | Admin CRUD |
|---|---|---|
| profiles | ✓ (all) | Update own |
| site_settings | ✓ | Full |
| projects | Published only | Full |
| project_assets | Non-admin_only | Full |
| research_papers | Published only | Full |
| credentials | Published only | Full |
| engineering_media | Published only | Full |
| skills | ✓ | Full |
| managed_files | ✗ | Full |
| contact_messages | Insert only (anon) | Read + Delete |
