# Tanbir Hasan Portfolio — Final Setup

## 1. Supabase

Run `supabase/schema.sql` in Supabase Dashboard → SQL Editor. The script is idempotent for the existing tables and adds the archive file-role columns.

## 2. Browser-safe configuration

Open `supabase-config.js` and replace the two placeholders with your Supabase **Project URL** and **Publishable key**. Do not use a secret/service-role key.

## 3. Admin

Use the existing Supabase admin account with App metadata `{ "role": "admin" }`. Open `/admin/`, sign in, and complete TOTP setup if it has not already been enrolled.

## 4. Add projects

In Admin → Add new item:

- Type: Project
- Archive / Category: CAD, CFD, FEA, or Robotics & Projects
- Thumbnail / cover image: image used on archive cards
- Gallery / result images: screenshots/photos/results
- 3D model: GLB/GLTF for the interactive CAD viewer
- Videos / animations: MP4/WebM/MOV
- Engineering files / documents: SLDPRT, SLDASM, STEP, IGES, STL, DWG, DXF, ZIP, PDF, Python, Jupyter notebooks, datasets, presentations, etc.

## 5. Publish

Commit/upload all files in this package to the root of your GitHub Pages repository.

The public pages are:

- `/`
- `/cad.html`
- `/cfd.html`
- `/fea.html`
- `/robotics-projects.html`
- `/project.html?category=cad&slug=...` (generated automatically)
- `/admin/`

## 6. Important

A file uploaded to `portfolio-public` is publicly readable. Keep passwords, API keys, private documents and other secrets out of the public bucket.


## Credentials archive

From the homepage, the Credentials section links to the dedicated `credentials.html` archive.

The archive categories are:
- Certifications
- Memberships
- Presentations
- Awards
- Training

Each published item becomes a flashcard. Clicking it opens the attached public image or PDF in a full-screen viewer.

The Admin panel now provides Membership, Presentation and Training as content types. The browser maps these to the existing database types automatically, so the existing schema remains compatible.

### Important browser configuration

`supabase-config.js` must be present in the GitHub repository. It is intentionally not ignored by `.gitignore` in this package. Put only the Supabase Project URL and publishable/anon key in that file. Never put a service-role/secret key there.
